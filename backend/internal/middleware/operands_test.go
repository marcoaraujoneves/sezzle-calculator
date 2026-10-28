package middleware_test

import (
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"sezzle-calculator/internal/middleware"
)

func TestWithOperands(t *testing.T) {
	tests := []struct {
		name      string
		body      string
		wantError string
	}{
		{"both operands present", `{"first_input":1,"second_input":2}`, ""},
		{"extra fields pass through", `{"operation":"addition","first_input":1,"second_input":2}`, ""},
		{"zero operands", `{"first_input":0,"second_input":0}`, ""},
		{"negative zero", `{"first_input":-0,"second_input":0}`, ""},
		{"whitespace around values", `{"first_input" : 1 , "second_input" :	2 }`, ""},
		{"duplicate field uses the last value", `{"first_input":"x","first_input":1,"second_input":2}`, ""},

		// Answers are reused as operands, so a literal is never rejected for its length.
		{"nine digits is allowed", `{"first_input":123456789,"second_input":-987654321}`, ""},
		{"previous answer with seventeen significant digits", `{"first_input":0.30000000000000004,"second_input":1}`, ""},
		{"previous answer with eighteen integer digits", `{"first_input":999999998000000000,"second_input":-999999998000000000}`, ""},
		{"longest float64 literal", `{"first_input":-1.7976931348623157e+308,"second_input":5e-324}`, ""},

		// Exponent notation is accepted. The calculation handlers are responsible for the overflow it
		// can cause.
		{"short exponent literal is allowed", `{"first_input":1e308,"second_input":2e-5}`, ""},
		{"exponent with a sign and capital letter", `{"first_input":1E+5,"second_input":1}`, ""},

		{"missing first", `{"second_input":2}`, "first_input is required"},
		{"missing second", `{"first_input":1}`, "second_input is required"},
		{"both missing reports the first", `{}`, "first_input is required"},
		{"null body", `null`, "first_input is required"},
		{"null operand", `{"first_input":null,"second_input":2}`, "first_input must be a number"},
		{"string operand", `{"first_input":"1","second_input":2}`, "first_input must be a number"},
		{"empty string operand", `{"first_input":1,"second_input":""}`, "second_input must be a number"},
		{"boolean operand", `{"first_input":true,"second_input":2}`, "first_input must be a number"},
		{"array operand", `{"first_input":[1],"second_input":2}`, "first_input must be a number"},
		{"object operand", `{"first_input":1,"second_input":{"value":2}}`, "second_input must be a number"},

		{"array body", `[1,2]`, "body must be a JSON object"},
		{"string body", `"text"`, "body must be a JSON object"},
		{"number body", `5`, "body must be a JSON object"},
		{"invalid json", `{`, "body must be a JSON object"},
		{"trailing garbage", `{"first_input":1,"second_input":2} x`, "body must be a JSON object"},
		{"empty body", ``, "body must be a JSON object"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var forwardedBody string
			wasForwarded := false
			next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				wasForwarded = true
				bodyBytes, _ := io.ReadAll(r.Body)
				forwardedBody = string(bodyBytes)
			})

			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))
			middleware.WithOperands([]string{"first_input", "second_input"}, nil, next).ServeHTTP(recorder, request)

			if tt.wantError == "" {
				if recorder.Code != http.StatusOK || !wasForwarded {
					t.Fatalf("status = %d, forwarded = %t, want the request forwarded (body %q)", recorder.Code, wasForwarded, recorder.Body.String())
				}

				if forwardedBody != tt.body {
					t.Errorf("next handler body = %q, want %q", forwardedBody, tt.body)
				}

				return
			}

			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", recorder.Code, http.StatusBadRequest)
			}

			if wasForwarded {
				t.Error("a rejected request must not reach the next handler")
			}

			wantBody := `{"error":"` + tt.wantError + `"}`
			if gotBody := strings.TrimSpace(recorder.Body.String()); gotBody != wantBody {
				t.Errorf("body = %q, want %q", gotBody, wantBody)
			}
		})
	}
}

func TestWithOperandsSingleField(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
	}{
		{"only the named operand is required", `{"first_input":9}`, http.StatusOK},
		{"unnamed operand is ignored", `{"first_input":9,"second_input":"x"}`, http.StatusOK},
		{"missing named operand", `{"second_input":9}`, http.StatusBadRequest},
		{"named operand of the wrong type", `{"first_input":"9"}`, http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))

			middleware.WithOperands([]string{"first_input"}, nil, next).ServeHTTP(recorder, request)

			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body %q)", recorder.Code, tt.wantStatus, recorder.Body.String())
			}
		})
	}
}

func TestWithOperandsOptionalField(t *testing.T) {
	tests := []struct {
		name      string
		body      string
		wantError string
	}{
		{"absent optional operand", `{"first_input":9}`, ""},
		{"null optional operand", `{"first_input":9,"second_input":null}`, ""},
		{"present optional operand", `{"first_input":9,"second_input":2}`, ""},
		{"zero optional operand", `{"first_input":9,"second_input":0}`, ""},
		{"optional operand with nine digits", `{"first_input":9,"second_input":-123456789}`, ""},
		{"optional operand with seventeen significant digits", `{"first_input":9,"second_input":0.30000000000000004}`, ""},
		{"string optional operand", `{"first_input":9,"second_input":"2"}`, "second_input must be a number"},
		{"boolean optional operand", `{"first_input":9,"second_input":false}`, "second_input must be a number"},
		{"required operand is checked first", `{"second_input":"2"}`, "first_input is required"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wasForwarded := false
			next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) { wasForwarded = true })
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))

			middleware.WithOperands([]string{"first_input"}, []string{"second_input"}, next).ServeHTTP(recorder, request)

			if tt.wantError == "" {
				if !wasForwarded {
					t.Fatalf("request was rejected: %q", recorder.Body.String())
				}

				return
			}

			wantBody := `{"error":"` + tt.wantError + `"}`
			if gotBody := strings.TrimSpace(recorder.Body.String()); gotBody != wantBody || wasForwarded {
				t.Errorf("body = %q, forwarded = %t, want %q rejected", gotBody, wasForwarded, wantBody)
			}
		})
	}
}

func TestWithOperandsWithoutNames(t *testing.T) {
	wasForwarded := false
	next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) { wasForwarded = true })
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{}`))

	middleware.WithOperands(nil, nil, next).ServeHTTP(recorder, request)

	if !wasForwarded {
		t.Error("with no operands to validate, a JSON object must be forwarded")
	}
}

func TestWithOperandsUnreadableBody(t *testing.T) {
	next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Error("an unreadable request must not reach the next handler")
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/", failingReader{})

	middleware.WithOperands([]string{"first_input"}, nil, next).ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusBadRequest)
	}

	wantBody := `{"error":"unreadable request body"}`
	if gotBody := strings.TrimSpace(recorder.Body.String()); gotBody != wantBody {
		t.Errorf("body = %q, want %q", gotBody, wantBody)
	}
}

func TestWithOperandsBodyTooLarge(t *testing.T) {
	tests := []struct {
		name       string
		digitCount int
		wantStatus int
	}{
		{"body at the limit is forwarded", 1024 - len(`{"first_input":}`), http.StatusOK},
		{"body one byte over the limit", 1024 - len(`{"first_input":}`) + 1, http.StatusRequestEntityTooLarge},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
			body := `{"first_input":` + strings.Repeat("1", tt.digitCount) + `}`
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))

			middleware.WithOperands([]string{"first_input"}, nil, next).ServeHTTP(recorder, request)

			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body %q)", recorder.Code, tt.wantStatus, recorder.Body.String())
			}
		})
	}
}

type failingReader struct{}

func (failingReader) Read([]byte) (int, error) {
	return 0, errors.New("connection reset")
}
