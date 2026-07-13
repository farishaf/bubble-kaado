package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	supabaseURL := strings.TrimRight(os.Getenv("SUPABASE_URL"), "/")
	serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if supabaseURL == "" || serviceKey == "" {
		fmt.Fprintln(os.Stderr, "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
		os.Exit(1)
	}

	args := os.Args[1:]
	if len(args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: seed-user <email> <password> [full_name]")
		fmt.Fprintln(os.Stderr, "  creates a confirmed test user (no email sent, no rate limit)")
		os.Exit(2)
	}
	email := args[0]
	password := args[1]
	fullName := ""
	if len(args) >= 3 {
		fullName = args[2]
	}

	payload, _ := json.Marshal(map[string]any{
		"email":          email,
		"password":       password,
		"email_confirm":  true,
		"user_metadata":  map[string]any{"full_name": fullName},
	})
	req, _ := http.NewRequest(http.MethodPost, supabaseURL+"/auth/v1/admin/users", bytes.NewReader(payload))
	req.Header.Set("apikey", serviceKey)
	req.Header.Set("Authorization", "Bearer "+serviceKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Fprintln(os.Stderr, "request failed:", err)
		os.Exit(1)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 300 {
		fmt.Fprintln(os.Stderr, "create failed:", resp.Status, string(body))
		os.Exit(1)
	}

	var created struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"-"`
	}
	if err := json.Unmarshal(body, &created); err != nil {
		fmt.Fprintln(os.Stderr, "parse response:", err)
		os.Exit(1)
	}
	fmt.Printf("ok: created %s (id=%s, confirmed, no email sent)\n", created.Email, created.ID)
}