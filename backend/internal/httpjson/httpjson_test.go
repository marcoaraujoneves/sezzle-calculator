package httpjson_test

import (
	"math"
	"net/http"
	"net/http/httptest"
	"testing"

	"sezzle-calculator/internal/httpjson"
)

func TestWrite(t *testing.T) {
	tests := []struct {
		name       string
		status     int
		body       any
		wantStatus int
		wantBody   string
	}{
		{"result", http.StatusOK, map[string]float64{"result": 4}, http.StatusOK, `{"result":4}`},
		{"fraction", http.StatusOK, map[string]float64{"result": 0.1}, http.StatusOK, `{"result":0.1}`},
		{"negative zero", http.StatusOK, map[string]float64{"result": math.Copysign(0, -1)}, http.StatusOK, `{"result":-0}`},
		{"largest float", http.StatusOK, map[string]float64{"result": math.MaxFloat64}, http.StatusOK, `{"result":1.7976931348623157e+308}`},
		{"smallest float", http.StatusOK, map[string]float64{"result": math.SmallestNonzeroFloat64}, http.StatusOK, `{"result":5e-324}`},
		{"custom status", http.StatusCreated, map[string]string{"status": "ok"}, http.StatusCreated, `{"status":"ok"}`},
		{"positive infinity", http.StatusOK, map[string]float64{"result": math.Inf(1)}, http.StatusInternalServerError, `{"error":"internal error"}`},
		{"negative infinity", http.StatusOK, map[string]float64{"result": math.Inf(-1)}, http.StatusInternalServerError, `{"error":"internal error"}`},
		{"not a number", http.StatusOK, map[string]float64{"result": math.NaN()}, http.StatusInternalServerError, `{"error":"internal error"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()

			httpjson.Write(recorder, tt.status, tt.body)

			if recorder.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", recorder.Code, tt.wantStatus)
			}

			if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json" {
				t.Errorf("Content-Type = %q, want application/json", contentType)
			}

			if gotBody := trimNewline(recorder.Body.String()); gotBody != tt.wantBody {
				t.Errorf("body = %q, want %q", gotBody, tt.wantBody)
			}
		})
	}
}

func TestWriteError(t *testing.T) {
	recorder := httptest.NewRecorder()

	httpjson.WriteError(recorder, http.StatusBadRequest, "bad input")

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusBadRequest)
	}

	if gotBody := trimNewline(recorder.Body.String()); gotBody != `{"error":"bad input"}` {
		t.Errorf("body = %q", gotBody)
	}
}

func trimNewline(body string) string {
	if len(body) > 0 && body[len(body)-1] == '\n' {
		return body[:len(body)-1]
	}

	return body
}
