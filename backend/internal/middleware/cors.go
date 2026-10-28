package middleware

import "net/http"

const (
	headerOrigin        = "Origin"
	headerAllowOrigin   = "Access-Control-Allow-Origin"
	headerAllowMethods  = "Access-Control-Allow-Methods"
	headerAllowHeaders  = "Access-Control-Allow-Headers"
	headerRequestMethod = "Access-Control-Request-Method"
	allowedMethods      = "GET, POST, OPTIONS"
	allowedHeaders      = "Content-Type"
)

// WithCORS lets browsers on allowedOrigin call next. An empty allowedOrigin leaves CORS
// disabled, which is correct when the SPA is served from the same origin as the API.
func WithCORS(allowedOrigin string, next http.Handler) http.Handler {
	if allowedOrigin == "" {
		return next
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", headerOrigin)

		isAllowedOrigin := r.Header.Get(headerOrigin) == allowedOrigin
		if !isAllowedOrigin {
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Set(headerAllowOrigin, allowedOrigin)

		// The method-scoped mux would answer a preflight with 405, so it is answered here.
		isPreflight := r.Method == http.MethodOptions && r.Header.Get(headerRequestMethod) != ""
		if isPreflight {
			w.Header().Set(headerAllowMethods, allowedMethods)
			w.Header().Set(headerAllowHeaders, allowedHeaders)
			w.WriteHeader(http.StatusNoContent)

			return
		}

		next.ServeHTTP(w, r)
	})
}
