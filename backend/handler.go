package calculator

import (
	"net/http"

	"sezzle-calculator/internal/handlers"
	"sezzle-calculator/internal/middleware"
)

const (
	healthPath               = "/healthz"
	basicCalculationsPath    = "/basic-calculations"
	advancedCalculationsPath = "/advanced-calculations"

	firstInputField  = "first_input"
	secondInputField = "second_input"
)

// NewHandler returns the HTTP handler exposing the calculator service.
func NewHandler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET "+healthPath, handlers.Healthz)
	mux.HandleFunc(healthPath, handlers.MethodNotAllowed(http.MethodGet))

	basicCalculations := middleware.WithOperands(
		[]string{firstInputField, secondInputField},
		nil,
		handlers.BasicCalculations,
	)
	mux.Handle("POST "+basicCalculationsPath, basicCalculations)
	mux.HandleFunc(basicCalculationsPath, handlers.MethodNotAllowed(http.MethodPost))

	// The second operand is optional here: only exponentiation and percentage use it, and the
	// handler reports it missing for them.
	advancedCalculations := middleware.WithOperands(
		[]string{firstInputField},
		[]string{secondInputField},
		handlers.AdvancedCalculations,
	)
	mux.Handle("POST "+advancedCalculationsPath, advancedCalculations)
	mux.HandleFunc(advancedCalculationsPath, handlers.MethodNotAllowed(http.MethodPost))

	return mux
}
