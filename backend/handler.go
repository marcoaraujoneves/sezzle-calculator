package calculator

import (
	"net/http"

	"sezzle-calculator/internal/handlers"
	"sezzle-calculator/internal/middleware"
)

// NewHandler returns the HTTP handler exposing the calculator service.
func NewHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", handlers.Healthz)
	mux.HandleFunc("/healthz", handlers.MethodNotAllowed(http.MethodGet))
	mux.Handle("POST /basic-calculations", middleware.WithOperands([]string{"first_input", "second_input"}, http.HandlerFunc(handlers.BasicCalculations)))
	mux.HandleFunc("/basic-calculations", handlers.MethodNotAllowed(http.MethodPost))
	mux.Handle("POST /advanced-calculations", middleware.WithOperands([]string{"first_input"}, http.HandlerFunc(handlers.AdvancedCalculations)))
	mux.HandleFunc("/advanced-calculations", handlers.MethodNotAllowed(http.MethodPost))
	return mux
}
