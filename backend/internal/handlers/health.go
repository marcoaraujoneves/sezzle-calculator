package handlers

import (
	"net/http"

	"sezzle-calculator/internal/httpjson"
)

func Healthz(w http.ResponseWriter, _ *http.Request) {
	httpjson.Write(w, http.StatusOK, map[string]string{"status": "ok"})
}

// MethodNotAllowed replaces the mux's plain-text 405 so every response of the API is JSON.
func MethodNotAllowed(allowedMethod string) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Allow", allowedMethod)
		httpjson.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}
