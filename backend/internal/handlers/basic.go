package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
)

var (
	ErrDivisionByZero   = errors.New("division by zero")
	ErrUnknownOperation = errors.New("unknown operation")
)

type basicRequest struct {
	Operation   string  `json:"operation"`
	FirstInput  float64 `json:"first_input"`
	SecondInput float64 `json:"second_input"`
}

func Calculate(operation string, first, second float64) (float64, error) {
	switch operation {
	case "addition":
		return first + second, nil
	case "subtraction":
		return first - second, nil
	case "multiplication":
		return first * second, nil
	case "division":
		if second == 0 {
			return 0, ErrDivisionByZero
		}
		return first / second, nil
	default:
		return 0, ErrUnknownOperation
	}
}

func BasicCalculations(w http.ResponseWriter, r *http.Request) {
	var req basicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	result, err := Calculate(req.Operation, req.FirstInput, req.SecondInput)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]float64{"result": result})
}
