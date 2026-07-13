package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Env                string
	Port               string
	LogLevel           string
	AllowedOrigins     []string
	DatabaseURL        string
	DBMaxConns         int32
	DBMinConns         int32
	SupabaseURL        string
	SupabaseServiceKey string
	SupabaseJWTSecret  string
}

func Load() (*Config, error) {
	cfg := &Config{
		Env:                getEnv("ENV", "development"),
		Port:               getEnv("PORT", "8080"),
		LogLevel:           getEnv("LOG_LEVEL", "info"),
		AllowedOrigins:     splitCSV(getEnv("ALLOWED_ORIGINS", "http://localhost:3000")),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		DBMaxConns:         int32(getEnvInt("DB_MAX_CONNS", 10)),
		DBMinConns:         int32(getEnvInt("DB_MIN_CONNS", 2)),
		SupabaseURL:        os.Getenv("SUPABASE_URL"),
		SupabaseServiceKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		SupabaseJWTSecret:  os.Getenv("SUPABASE_JWT_SECRET"),
	}

	var missing []string
	if cfg.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if cfg.SupabaseURL == "" {
		missing = append(missing, "SUPABASE_URL")
	}
	if cfg.SupabaseServiceKey == "" {
		missing = append(missing, "SUPABASE_SERVICE_ROLE_KEY")
	}
	if cfg.SupabaseJWTSecret == "" {
		missing = append(missing, "SUPABASE_JWT_SECRET")
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required env: %s", strings.Join(missing, ", "))
	}
	return cfg, nil
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func getEnvInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}