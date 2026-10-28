package calculator_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	calculator "sezzle-calculator"
)

// These cases pin down what happens at the limits of the types in play: nine-digit operands that
// are the largest the SPA can send, and float64 literals that fit the digit limit but not the type.
func TestCalculationEndpointsAtTypeLimits(t *testing.T) {
	tests := []struct {
		name       string
		path       string
		body       string
		wantStatus int
		wantBody   string
	}{
		{"largest operands multiplied", "/basic-calculations", `{"operation":"multiplication","first_input":999999999,"second_input":999999999}`, http.StatusOK, `{"result":999999998000000000}`},
		{"largest negative operands added", "/basic-calculations", `{"operation":"addition","first_input":-999999999,"second_input":-999999999}`, http.StatusOK, `{"result":-1999999998}`},
		{"smallest nine-digit decimal", "/basic-calculations", `{"operation":"addition","first_input":0.00000001,"second_input":0}`, http.StatusOK, `{"result":1e-8}`},
		{"binary fractions are inexact", "/basic-calculations", `{"operation":"addition","first_input":0.1,"second_input":0.2}`, http.StatusOK, `{"result":0.30000000000000004}`},
		{"large results use exponent notation", "/basic-calculations", `{"operation":"multiplication","first_input":1e10,"second_input":1e11}`, http.StatusOK, `{"result":1e+21}`},
		{"negative zero keeps its sign", "/basic-calculations", `{"operation":"multiplication","first_input":-1,"second_input":0}`, http.StatusOK, `{"result":-0}`},

		{"multiplication overflowing the float type", "/basic-calculations", `{"operation":"multiplication","first_input":1e308,"second_input":10}`, http.StatusBadRequest, `{"error":"result is too large to be represented"}`},
		{"addition overflowing the float type", "/basic-calculations", `{"operation":"addition","first_input":1.7e308,"second_input":1.7e308}`, http.StatusBadRequest, `{"error":"result is too large to be represented"}`},
		{"division overflowing the float type", "/basic-calculations", `{"operation":"division","first_input":1e308,"second_input":1e-10}`, http.StatusBadRequest, `{"error":"result is too large to be represented"}`},
		{"operand beyond the float range", "/basic-calculations", `{"operation":"addition","first_input":1e999,"second_input":1}`, http.StatusBadRequest, `{"error":"invalid request body"}`},
		{"operand digits beyond the limit", "/basic-calculations", `{"operation":"addition","first_input":1234567890,"second_input":1}`, http.StatusBadRequest, `{"error":"first_input must have at most 9 digits"}`},

		{"largest square root", "/advanced-calculations", `{"operation":"square_root","first_input":999999999}`, http.StatusOK, `{"result":31622.776585872405}`},
		{"largest base squared", "/advanced-calculations", `{"operation":"exponentiation","first_input":999999999,"second_input":2}`, http.StatusOK, `{"result":999999998000000000}`},
		{"largest exponent overflowing", "/advanced-calculations", `{"operation":"exponentiation","first_input":999999999,"second_input":999999999}`, http.StatusBadRequest, `{"error":"result is too large to be represented"}`},
		{"largest exponent of one", "/advanced-calculations", `{"operation":"exponentiation","first_input":1,"second_input":999999999}`, http.StatusOK, `{"result":1}`},
		{"largest exponent underflowing", "/advanced-calculations", `{"operation":"exponentiation","first_input":0.5,"second_input":999999999}`, http.StatusOK, `{"result":0}`},
		{"exponent with exponent notation", "/advanced-calculations", `{"operation":"exponentiation","first_input":2,"second_input":1e1}`, http.StatusOK, `{"result":1024}`},
		{"percentage overflowing the float type", "/advanced-calculations", `{"operation":"percentage","first_input":1e308,"second_input":1e308}`, http.StatusBadRequest, `{"error":"result is too large to be represented"}`},
		{"percentage of the largest base", "/advanced-calculations", `{"operation":"percentage","first_input":50,"second_input":999999999}`, http.StatusOK, `{"result":499999999.5}`},
		{"second input over the digit limit", "/advanced-calculations", `{"operation":"percentage","first_input":1,"second_input":1234567890}`, http.StatusBadRequest, `{"error":"second_input must have at most 9 digits"}`},
		{"second input of the wrong type", "/advanced-calculations", `{"operation":"exponentiation","first_input":2,"second_input":"3"}`, http.StatusBadRequest, `{"error":"second_input must be a number"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			request := httptest.NewRequest(http.MethodPost, tt.path, strings.NewReader(tt.body))

			calculator.NewHandler().ServeHTTP(recorder, request)

			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body %q)", recorder.Code, tt.wantStatus, recorder.Body.String())
			}

			if gotBody := strings.TrimSpace(recorder.Body.String()); gotBody != tt.wantBody {
				t.Errorf("body = %q, want %q", gotBody, tt.wantBody)
			}
		})
	}
}
