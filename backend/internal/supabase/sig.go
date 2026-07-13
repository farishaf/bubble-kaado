package supabase

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"math/big"
)

func parseJWK(k jwk) (crypto.PublicKey, error) {
	switch k.Kty {
	case "RSA":
		nb, err := base64.RawURLEncoding.DecodeString(k.N)
		if err != nil {
			return nil, err
		}
		eb, err := base64.RawURLEncoding.DecodeString(k.E)
		if err != nil {
			return nil, err
		}
		n := new(big.Int).SetBytes(nb)
		e := int(new(big.Int).SetBytes(eb).Int64())
		return &rsa.PublicKey{N: n, E: e}, nil
	case "EC":
		var curve elliptic.Curve
		switch k.Crv {
		case "P-256":
			curve = elliptic.P256()
		default:
			return nil, fmt.Errorf("unsupported curve: %s", k.Crv)
		}
		xb, err := base64.RawURLEncoding.DecodeString(k.X)
		if err != nil {
			return nil, err
		}
		yb, err := base64.RawURLEncoding.DecodeString(k.Y)
		if err != nil {
			return nil, err
		}
		return &ecdsa.PublicKey{
			Curve: curve,
			X:     new(big.Int).SetBytes(xb),
			Y:     new(big.Int).SetBytes(yb),
		}, nil
	default:
		return nil, fmt.Errorf("unsupported key type: %s", k.Kty)
	}
}

func verifySig(key crypto.PublicKey, header, payload, sig []byte) error {
	if len(sig) == 0 {
		return errors.New("empty signature")
	}
	signed := append(append([]byte{}, header...), '.')
	signed = append(signed, payload...)
	sum := sha256.Sum256(signed)

	switch k := key.(type) {
	case *rsa.PublicKey:
		if err := rsa.VerifyPKCS1v15(k, crypto.SHA256, sum[:], sig); err != nil {
			return fmt.Errorf("verify: %w", err)
		}
		return nil
	case *ecdsa.PublicKey:
		size := (k.Curve.Params().BitSize + 7) / 8
		if len(sig) != 2*size {
			return fmt.Errorf("verify: invalid ES256 signature length %d", len(sig))
		}
		r := new(big.Int).SetBytes(sig[:size])
		s := new(big.Int).SetBytes(sig[size:])
		if !ecdsa.Verify(k, sum[:], r, s) {
			return errors.New("verify: signature mismatch")
		}
		return nil
	default:
		return fmt.Errorf("verify: unsupported key type %T", key)
	}
}
