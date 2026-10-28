package handlers

import (
	"encoding/json"
	"errors"
	"math"
	"net/http"
)

var ErrNegativeSquareRoot = errors.New("square root of a negative number is not allowed")

type advancedRequest struct {
	Operation  string  `json:"operation"`
	FirstInput float64 `json:"first_input"`
}

func CalculateAdvanced(operation string, input float64) (float64, error) {
	switch operation {
	case "square_root":
		if input < 0 {
			return 0, ErrNegativeSquareRoot
		}
		return math.Sqrt(input), nil
	default:
		return 0, ErrUnknownOperation
	}
}

func AdvancedCalculations(w http.ResponseWriter, r *http.Request) {
	var req advancedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	result, err := CalculateAdvanced(req.Operation, req.FirstInput)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]float64{"result": result})
}
