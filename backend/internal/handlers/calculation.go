package handlers

import (
	"encoding/json"
	"math"
	"net/http"

	"sezzle-calculator/internal/httpjson"
)

const invalidRequestBodyMessage = "invalid request body"

// calculationHandler decodes a request of type Request, runs calculate on it and answers with
// {"result": ...}. It is shared by every calculation endpoint so they only differ in their math.
func calculationHandler[Request any](calculate func(Request) (float64, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request Request

		decodeErr := json.NewDecoder(r.Body).Decode(&request)
		if decodeErr != nil {
			httpjson.WriteError(w, http.StatusBadRequest, invalidRequestBodyMessage)
			return
		}

		result, calculationErr := calculate(request)
		if calculationErr != nil {
			httpjson.WriteError(w, http.StatusBadRequest, calculationErr.Error())
			return
		}

		httpjson.Write(w, http.StatusOK, map[string]float64{"result": result})
	}
}

// ensureRepresentable rejects results JSON cannot carry. The operands are finite, so an infinite
// result always comes from overflowing float64.
func ensureRepresentable(result float64) (float64, error) {
	if math.IsInf(result, 0) {
		return 0, ErrResultNotRepresented
	}

	return result, nil
}
