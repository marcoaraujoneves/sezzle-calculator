package middleware

import "net/http"

// WithCORS lets browsers on allowedOrigin call next. An empty allowedOrigin leaves CORS
// disabled, which is correct when the SPA is served from the same origin as the API.
func WithCORS(allowedOrigin string, next http.Handler) http.Handler {
	if allowedOrigin == "" {
		return next
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", "Origin")

		if r.Header.Get("Origin") != allowedOrigin {
			next.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)

		// The method-scoped mux would answer a preflight with 405, so it is answered here.
		if r.Method == http.MethodOptions && r.Header.Get("Access-Control-Request-Method") != "" {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
