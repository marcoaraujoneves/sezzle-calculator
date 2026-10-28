package handlers_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"sezzle-calculator/internal/handlers"
)

// The operand middleware rejects malformed operands before these handlers run, so the cases here
// cover what only the handlers see: field types the middleware does not inspect.
func TestCalculationHandlersRejectUndecodableBodies(t *testing.T) {
	handlersByName := map[string]http.HandlerFunc{
		"basic":    handlers.BasicCalculations,
		"advanced": handlers.AdvancedCalculations,
	}

	bodies := []struct {
		name string
		body string
	}{
		{"operation is a number", `{"operation":5,"first_input":1,"second_input":2}`},
		{"operation is an object", `{"operation":{},"first_input":1,"second_input":2}`},
		{"operand beyond float64 range", `{"operation":"addition","first_input":1e999,"second_input":2}`},
		{"operand is a string", `{"operation":"addition","first_input":"1","second_input":2}`},
		{"truncated body", `{"operation":"addition"`},
		{"empty body", ``},
	}

	for handlerName, handler := range handlersByName {
		for _, tt := range bodies {
			t.Run(handlerName+"/"+tt.name, func(t *testing.T) {
				recorder := httptest.NewRecorder()
				request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))

				handler.ServeHTTP(recorder, request)

				if recorder.Code != http.StatusBadRequest {
					t.Fatalf("status = %d, want %d", recorder.Code, http.StatusBadRequest)
				}

				wantBody := `{"error":"invalid request body"}`
				if gotBody := strings.TrimSpace(recorder.Body.String()); gotBody != wantBody {
					t.Errorf("body = %q, want %q", gotBody, wantBody)
				}
			})
		}
	}
}

func TestCalculationHandlersAnswerWithJSON(t *testing.T) {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{"operation":"addition","first_input":1,"second_input":2}`))

	handlers.BasicCalculations.ServeHTTP(recorder, request)

	if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", contentType)
	}
}
