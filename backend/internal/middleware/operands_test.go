package middleware_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"sezzle-calculator/internal/middleware"
)

func TestWithOperands(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
	}{
		{"both operands present", `{"first_input":1,"second_input":2}`, http.StatusOK},
		{"extra fields pass through", `{"operation":"addition","first_input":1,"second_input":2}`, http.StatusOK},
		{"nine digits is allowed", `{"first_input":123456789,"second_input":-987654321}`, http.StatusOK},
		{"decimal point is not a digit", `{"first_input":12345678.9,"second_input":0.5}`, http.StatusOK},
		{"ten digits is rejected", `{"first_input":1234567890,"second_input":1}`, http.StatusBadRequest},
		{"ten digits in second operand", `{"first_input":1,"second_input":1234567.890}`, http.StatusBadRequest},
		{"missing first", `{"second_input":2}`, http.StatusBadRequest},
		{"missing second", `{"first_input":1}`, http.StatusBadRequest},
		{"null operand", `{"first_input":null,"second_input":2}`, http.StatusBadRequest},
		{"string operand", `{"first_input":"1","second_input":2}`, http.StatusBadRequest},
		{"not an object", `[1,2]`, http.StatusBadRequest},
		{"invalid json", `{`, http.StatusBadRequest},
		{"empty body", ``, http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var gotBody string
			next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				b, _ := io.ReadAll(r.Body)
				gotBody = string(b)
			})

			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))
			middleware.WithOperands(next).ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body %q)", rec.Code, tt.wantStatus, rec.Body.String())
			}
			if tt.wantStatus == http.StatusOK && gotBody != tt.body {
				t.Errorf("next handler body = %q, want %q", gotBody, tt.body)
			}
		})
	}
}
