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

	bucket := "lumio-assets"
	if len(os.Args) > 1 {
		bucket = os.Args[1]
	}

	if err := ensureBucket(supabaseURL, serviceKey, bucket); err != nil {
		fmt.Fprintln(os.Stderr, "setup failed:", err)
		os.Exit(1)
	}
	fmt.Println("ok: bucket", bucket, "is public and ready")
}

func ensureBucket(baseURL, serviceKey, bucket string) error {
	getURL := baseURL + "/storage/v1/bucket/" + bucket
	req, _ := http.NewRequest(http.MethodGet, getURL, nil)
	req.Header.Set("Authorization", "Bearer "+serviceKey)
	req.Header.Set("apikey", serviceKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("check bucket: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
		if !bytes.Contains(body, []byte("Bucket not found")) {
			return fmt.Errorf("check bucket: %s: %s", resp.Status, string(body))
		}
	}
	if resp.StatusCode == http.StatusOK {
		fmt.Println("bucket already exists")
		return ensurePublic(baseURL, serviceKey, bucket)
	}

	payload, _ := json.Marshal(map[string]any{
		"name":   bucket,
		"public": true,
		"file_size_limit": 8 * 1024 * 1024,
		"allowed_mime_types": []string{
			"image/jpeg", "image/png", "image/webp", "image/gif",
		},
	})
	createReq, _ := http.NewRequest(http.MethodPost, baseURL+"/storage/v1/bucket", bytes.NewReader(payload))
	createReq.Header.Set("Authorization", "Bearer "+serviceKey)
	createReq.Header.Set("apikey", serviceKey)
	createReq.Header.Set("Content-Type", "application/json")
	createResp, err := http.DefaultClient.Do(createReq)
	if err != nil {
		return fmt.Errorf("create bucket: %w", err)
	}
	defer createResp.Body.Close()
	cbody, _ := io.ReadAll(createResp.Body)
	if createResp.StatusCode >= 300 {
		return fmt.Errorf("create bucket: %s: %s", createResp.Status, string(cbody))
	}
	fmt.Println("bucket created")
	return nil
}

func ensurePublic(baseURL, serviceKey, bucket string) error {
	payload, _ := json.Marshal(map[string]any{"public": true})
	req, _ := http.NewRequest(http.MethodPut, baseURL+"/storage/v1/bucket/"+bucket, bytes.NewReader(payload))
	req.Header.Set("Authorization", "Bearer "+serviceKey)
	req.Header.Set("apikey", serviceKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("update bucket: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("update bucket: %s: %s", resp.Status, string(body))
	}
	return nil
}