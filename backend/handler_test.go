package calculator_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	calculator "sezzle-calculator"
)

func TestBasicCalculationsEndpoint(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		body       string
		wantStatus int
		wantBody   string
	}{
		{"addition", http.MethodPost, `{"operation":"addition","first_input":2,"second_input":3}`, http.StatusOK, `{"result":5}`},
		{"division", http.MethodPost, `{"operation":"division","first_input":1,"second_input":4}`, http.StatusOK, `{"result":0.25}`},
		{"division by zero", http.MethodPost, `{"operation":"division","first_input":1,"second_input":0}`, http.StatusBadRequest, `{"error":"division by zero"}`},
		{"unknown operation", http.MethodPost, `{"operation":"root","first_input":1,"second_input":2}`, http.StatusBadRequest, `{"error":"unknown operation"}`},
		{"missing operand", http.MethodPost, `{"operation":"addition","first_input":1}`, http.StatusBadRequest, `{"error":"second_input is required"}`},
		{"get is not allowed", http.MethodGet, ``, http.StatusMethodNotAllowed, `{"error":"method not allowed"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			req := httptest.NewRequest(tt.method, "/basic-calculations", strings.NewReader(tt.body))
			calculator.NewHandler().ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantBody != "" && strings.TrimSpace(rec.Body.String()) != tt.wantBody {
				t.Errorf("body = %q, want %q", rec.Body.String(), tt.wantBody)
			}
		})
	}
}

func TestAdvancedCalculationsEndpoint(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		body       string
		wantStatus int
		wantBody   string
	}{
		{"square root", http.MethodPost, `{"operation":"square_root","first_input":16}`, http.StatusOK, `{"result":4}`},
		{"square root of a decimal", http.MethodPost, `{"operation":"square_root","first_input":2.25}`, http.StatusOK, `{"result":1.5}`},
		{"negative square root", http.MethodPost, `{"operation":"square_root","first_input":-9}`, http.StatusBadRequest, `{"error":"square root of a negative number is not allowed"}`},
		{"exponentiation", http.MethodPost, `{"operation":"exponentiation","first_input":2,"second_input":10}`, http.StatusOK, `{"result":1024}`},
		{"exponentiation with a negative exponent", http.MethodPost, `{"operation":"exponentiation","first_input":2,"second_input":-1}`, http.StatusOK, `{"result":0.5}`},
		{"exponentiation with a decimal exponent", http.MethodPost, `{"operation":"exponentiation","first_input":2,"second_input":1.5}`, http.StatusBadRequest, `{"error":"second_input must be an integer"}`},
		{"exponentiation without an exponent", http.MethodPost, `{"operation":"exponentiation","first_input":2}`, http.StatusBadRequest, `{"error":"second_input is required"}`},
		{"exponentiation with a null exponent", http.MethodPost, `{"operation":"exponentiation","first_input":2,"second_input":null}`, http.StatusBadRequest, `{"error":"second_input is required"}`},
		{"exponentiation overflowing", http.MethodPost, `{"operation":"exponentiation","first_input":999999999,"second_input":999999999}`, http.StatusBadRequest, `{"error":"result is too large to be represented"}`},
		{"unknown operation", http.MethodPost, `{"operation":"cube_root","first_input":8}`, http.StatusBadRequest, `{"error":"unknown operation"}`},
		{"missing operand", http.MethodPost, `{"operation":"square_root"}`, http.StatusBadRequest, `{"error":"first_input is required"}`},
		{"get is not allowed", http.MethodGet, ``, http.StatusMethodNotAllowed, `{"error":"method not allowed"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			req := httptest.NewRequest(tt.method, "/advanced-calculations", strings.NewReader(tt.body))
			calculator.NewHandler().ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if strings.TrimSpace(rec.Body.String()) != tt.wantBody {
				t.Errorf("body = %q, want %q", rec.Body.String(), tt.wantBody)
			}
		})
	}
}

func TestHealthz(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		wantStatus int
		wantBody   string
	}{
		{"get returns ok", http.MethodGet, http.StatusOK, `{"status":"ok"}`},
		{"post is not allowed", http.MethodPost, http.StatusMethodNotAllowed, `{"error":"method not allowed"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			calculator.NewHandler().ServeHTTP(rec, httptest.NewRequest(tt.method, "/healthz", nil))

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantBody != "" && strings.TrimSpace(rec.Body.String()) != tt.wantBody {
				t.Errorf("body = %q, want %q", rec.Body.String(), tt.wantBody)
			}
		})
	}
}
