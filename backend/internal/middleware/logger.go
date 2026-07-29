package middleware

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

// errBodyCapBytes bounds how much of a response body RequestLogger buffers
// looking for an error message — enough for the "error" JSON field handlers
// use, not enough to hold a photo/letter payload if a handler ever echoes one.
const errBodyCapBytes = 4096

// errBodyWriter tees Gin's response writes into a bounded buffer so
// RequestLogger can read back the "error" field handlers wrote, without
// changing what's actually sent to the client.
type errBodyWriter struct {
	gin.ResponseWriter
	buf *bytes.Buffer
}

func (w *errBodyWriter) Write(b []byte) (int, error) {
	if w.buf.Len() < errBodyCapBytes {
		room := errBodyCapBytes - w.buf.Len()
		if room > len(b) {
			room = len(b)
		}
		w.buf.Write(b[:room])
	}
	return w.ResponseWriter.Write(b)
}

// RequestLogger emits one structured log line per request, after it
// completes. Placed after Recover in the chain so a recovered panic still
// gets logged with the 500 status Recover set, instead of being swallowed.
//
// Every handler in this service replies with `gin.H{"error": "..."}` on
// failure (see internal/handlers) — on 4xx/5xx this middleware reads that
// field back out of the response body and puts it directly in the log line,
// so a failure is diagnosable from the terminal alone, no reproduction step
// needed.
func RequestLogger(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		if raw := c.Request.URL.RawQuery; raw != "" {
			path += "?" + raw
		}

		bw := &errBodyWriter{ResponseWriter: c.Writer, buf: &bytes.Buffer{}}
		c.Writer = bw

		c.Next()

		status := c.Writer.Status()
		attrs := []any{
			"method", c.Request.Method,
			"path", path,
			"status", status,
			"duration_ms", time.Since(start).Milliseconds(),
			"request_id", GetRequestID(c),
			"client_ip", c.ClientIP(),
			"bytes_in", c.Request.ContentLength,
			"bytes_out", c.Writer.Size(),
		}
		if ua := c.Request.UserAgent(); ua != "" {
			attrs = append(attrs, "user_agent", ua)
		}

		if status >= 400 {
			if msg := extractError(bw.buf.Bytes()); msg != "" {
				attrs = append(attrs, "error", msg)
			}
			// gin.Context.Errors carries anything handlers pushed via c.Error(),
			// e.g. the underlying DB/parse error behind a generic client message.
			if len(c.Errors) > 0 {
				attrs = append(attrs, "internal_err", c.Errors.String())
			}
		}

		switch {
		case status >= 500:
			log.Error("request", attrs...)
		case status >= 400:
			log.Warn("request", attrs...)
		default:
			log.Info("request", attrs...)
		}
	}
}

func extractError(body []byte) string {
	if len(body) == 0 {
		return ""
	}
	var parsed struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(body, &parsed); err == nil && parsed.Error != "" {
		return parsed.Error
	}
	// not the {"error": "..."} shape — fall back to the raw body so a
	// non-JSON failure (e.g. a panic'd proxy response) still surfaces.
	return string(body)
}
