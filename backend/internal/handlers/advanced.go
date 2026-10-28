package handlers

import (
	"encoding/json"
	"errors"
	"math"
	"net/http"
)

var (
	ErrNegativeSquareRoot   = errors.New("square root of a negative number is not allowed")
	ErrSecondInputRequired  = errors.New("second_input is required")
	ErrExponentNotInteger   = errors.New("second_input must be an integer")
	ErrResultNotRepresented = errors.New("result is too large to be represented")
)

type advancedRequest struct {
	Operation  string  `json:"operation"`
	FirstInput float64 `json:"first_input"`
	// A pointer tells an absent second_input apart from an explicit 0, which is a valid exponent.
	SecondInput *float64 `json:"second_input"`
}

func CalculateAdvanced(operation string, first float64, second *float64) (float64, error) {
	switch operation {
	case "square_root":
		if first < 0 {
			return 0, ErrNegativeSquareRoot
		}
		return math.Sqrt(first), nil
	case "exponentiation":
		return exponentiate(first, second)
	case "percentage":
		return percentage(first, second)
	default:
		return 0, ErrUnknownOperation
	}
}

// The exponent must be an integer so a negative base never yields a complex result.
func exponentiate(base float64, exponent *float64) (float64, error) {
	if exponent == nil {
		return 0, ErrSecondInputRequired
	}
	if *exponent != math.Trunc(*exponent) {
		return 0, ErrExponentNotInteger
	}

	// JSON cannot carry Inf, which overflow and a zero base with a negative exponent produce.
	result := math.Pow(base, *exponent)
	if math.IsInf(result, 0) {
		return 0, ErrResultNotRepresented
	}
	return result, nil
}

// The first input is the rate and the second the base, so "20 % 150" reads as 20% of 150.
func percentage(rate float64, base *float64) (float64, error) {
	if base == nil {
		return 0, ErrSecondInputRequired
	}

	result := rate / 100 * *base
	if math.IsInf(result, 0) {
		return 0, ErrResultNotRepresented
	}
	return result, nil
}

func AdvancedCalculations(w http.ResponseWriter, r *http.Request) {
	var req advancedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	result, err := CalculateAdvanced(req.Operation, req.FirstInput, req.SecondInput)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]float64{"result": result})
}
