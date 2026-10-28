package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	calculator "sezzle-calculator"
	"sezzle-calculator/internal/middleware"
)

func TestWithCORS(t *testing.T) {
	const allowed = "http://localhost:5173"

	tests := []struct {
		name            string
		allowedOrigin   string
		method          string
		headers         map[string]string
		wantStatus      int
		wantAllowOrigin string
	}{
		{"allowed origin gets the header", allowed, http.MethodGet, map[string]string{"Origin": allowed}, http.StatusOK, allowed},
		{"other origin gets no header", allowed, http.MethodGet, map[string]string{"Origin": "http://evil.example"}, http.StatusOK, ""},
		{"same-origin request is untouched", allowed, http.MethodGet, nil, http.StatusOK, ""},
		{"preflight from the allowed origin is answered", allowed, http.MethodOptions, map[string]string{"Origin": allowed, "Access-Control-Request-Method": "POST"}, http.StatusNoContent, allowed},
		{"preflight from another origin is not answered", allowed, http.MethodOptions, map[string]string{"Origin": "http://evil.example", "Access-Control-Request-Method": "POST"}, http.StatusMethodNotAllowed, ""},
		{"empty config disables CORS", "", http.MethodGet, map[string]string{"Origin": allowed}, http.StatusOK, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/healthz", nil)
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}
			rec := httptest.NewRecorder()

			middleware.WithCORS(tt.allowedOrigin, calculator.NewHandler()).ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if got := rec.Header().Get("Access-Control-Allow-Origin"); got != tt.wantAllowOrigin {
				t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, tt.wantAllowOrigin)
			}
		})
	}
}
