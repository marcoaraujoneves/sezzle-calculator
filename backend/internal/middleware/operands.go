package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const maxOperandDigits = 9

// WithOperands rejects requests whose JSON body lacks any of the named operand fields, or whose
// operands have more than 9 digits, so handlers can assume well-formed operands.
func WithOperands(names []string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			writeError(w, http.StatusBadRequest, "unreadable request body")
			return
		}

		if err := validateOperands(body, names); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		r.Body = io.NopCloser(bytes.NewReader(body))
		next.ServeHTTP(w, r)
	})
}

func validateOperands(body []byte, names []string) error {
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(body, &fields); err != nil {
		return fmt.Errorf("body must be a JSON object")
	}

	for _, name := range names {
		raw, ok := fields[name]
		if !ok {
			return fmt.Errorf("%s is required", name)
		}

		var n json.Number
		if err := json.Unmarshal(raw, &n); err != nil || string(raw) == "null" || strings.HasPrefix(string(raw), `"`) {
			return fmt.Errorf("%s must be a number", name)
		}

		if countDigits(n.String()) > maxOperandDigits {
			return fmt.Errorf("%s must have less than 10 digits", name)
		}
	}

	return nil
}

// countDigits ignores sign and decimal point: only the digits a user typed count toward the limit.
func countDigits(literal string) int {
	count := 0
	for _, c := range literal {
		if c >= '0' && c <= '9' {
			count++
		}
	}
	return count
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}
