package supabase

import (
	"context"
	"crypto"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type jwk struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	Use string `json:"use"`
	Crv string `json:"crv"`
	N   string `json:"n"`
	E   string `json:"e"`
	X   string `json:"x"`
	Y   string `json:"y"`
}

type jwks struct {
	Keys []jwk `json:"keys"`
}

type Verifier struct {
	jwksURL string
	issuer   string

	mu        sync.RWMutex
	keys      map[string]crypto.PublicKey
	fetchedAt time.Time
}

func NewVerifier(jwksURL, issuer string) *Verifier {
	return &Verifier{
		jwksURL: jwksURL,
		issuer:  issuer,
		keys:    make(map[string]crypto.PublicKey),
	}
}

type Claims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Exp   int64  `json:"exp"`
	Iat   int64  `json:"iat"`
	Role  string `json:"role"`
}

func (v *Verifier) Verify(ctx context.Context, token string) (*Claims, error) {
	headerB64, payloadB64, headerJSON, payloadJSON, sig, err := splitJWT(token)
	if err != nil {
		return nil, err
	}

	headerFields := map[string]string{}
	if err := json.Unmarshal(headerJSON, &headerFields); err != nil {
		return nil, fmt.Errorf("parse header: %w", err)
	}
	kid, ok := headerFields["kid"]
	if !ok {
		return nil, errors.New("missing kid in JWT header")
	}

	key, err := v.keyFor(ctx, kid)
	if err != nil {
		return nil, err
	}

	// JWS signs the raw base64url-encoded header/payload strings, not their decoded bytes.
	if err := verifySig(key, headerB64, payloadB64, sig); err != nil {
		return nil, err
	}

	claims := &Claims{}
	if err := json.Unmarshal(payloadJSON, claims); err != nil {
		return nil, fmt.Errorf("parse claims: %w", err)
	}
	if v.issuer != "" && claims.Sub == "" {
		return nil, errors.New("missing sub claim")
	}
	if claims.Exp > 0 && time.Now().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}
	return claims, nil
}

func (v *Verifier) keyFor(ctx context.Context, kid string) (crypto.PublicKey, error) {
	v.mu.RLock()
	k, ok := v.keys[kid]
	v.mu.RUnlock()
	if ok && time.Since(v.fetchedAt) < time.Hour {
		return k, nil
	}
	if err := v.refresh(ctx); err != nil {
		return nil, err
	}
	v.mu.RLock()
	defer v.mu.RUnlock()
	k, ok = v.keys[kid]
	if !ok {
		return nil, fmt.Errorf("kid %q not found in JWKS", kid)
	}
	return k, nil
}

func (v *Verifier) refresh(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, v.jwksURL, nil)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("fetch jwks: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("jwks status: %d", resp.StatusCode)
	}
	var ks jwks
	if err := json.NewDecoder(resp.Body).Decode(&ks); err != nil {
		return fmt.Errorf("decode jwks: %w", err)
	}
	keys := make(map[string]crypto.PublicKey, len(ks.Keys))
	for _, k := range ks.Keys {
		pub, err := parseJWK(k)
		if err != nil {
			continue
		}
		keys[k.Kid] = pub
	}
	v.mu.Lock()
	v.keys = keys
	v.fetchedAt = time.Now()
	v.mu.Unlock()
	return nil
}

func splitJWT(token string) (headerB64, payloadB64, headerJSON, payloadJSON, sig []byte, err error) {
	parts := splitDots(token)
	if len(parts) != 3 {
		return nil, nil, nil, nil, nil, errors.New("malformed JWT")
	}
	headerJSON, err = base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, nil, nil, nil, nil, fmt.Errorf("decode header: %w", err)
	}
	payloadJSON, err = base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, nil, nil, nil, nil, fmt.Errorf("decode payload: %w", err)
	}
	sig, err = base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, nil, nil, nil, nil, fmt.Errorf("decode sig: %w", err)
	}
	return []byte(parts[0]), []byte(parts[1]), headerJSON, payloadJSON, sig, nil
}

func splitDots(s string) []string {
	out := make([]string, 0, 3)
	last := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '.' {
			out = append(out, s[last:i])
			last = i + 1
		}
	}
	out = append(out, s[last:])
	return out
}