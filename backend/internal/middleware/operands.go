package middleware

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"sezzle-calculator/internal/httpjson"
)

// Answers are fed back as operands, so their length is bounded by the body size instead of a digit
// count: the longest float64 literal is under 30 bytes, which leaves room for any valid request.
const maxBodyBytes = 1024

var errBodyNotObject = errors.New("body must be a JSON object")

// WithOperands rejects requests whose JSON body lacks any of the required operand fields, or whose
// operands are not numbers, so handlers can assume well-formed operands. Optional operands may be
// absent or null, but when given they are held to the same rules.
func WithOperands(requiredNames, optionalNames []string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, readErr := io.ReadAll(http.MaxBytesReader(w, r.Body, maxBodyBytes))

		_, isBodyTooLarge := errors.AsType[*http.MaxBytesError](readErr)
		if isBodyTooLarge {
			httpjson.WriteError(w, http.StatusRequestEntityTooLarge, "request body too large")
			return
		}

		if readErr != nil {
			httpjson.WriteError(w, http.StatusBadRequest, "unreadable request body")
			return
		}

		validationErr := validateOperands(body, requiredNames, optionalNames)
		if validationErr != nil {
			httpjson.WriteError(w, http.StatusBadRequest, validationErr.Error())
			return
		}

		// The body was consumed above, so the next handler gets a fresh reader over the same bytes.
		r.Body = io.NopCloser(bytes.NewReader(body))
		next.ServeHTTP(w, r)
	})
}

func validateOperands(body []byte, requiredNames, optionalNames []string) error {
	var fields map[string]json.RawMessage

	unmarshalErr := json.Unmarshal(body, &fields)
	if unmarshalErr != nil {
		return errBodyNotObject
	}

	for _, requiredName := range requiredNames {
		rawOperand, isPresent := fields[requiredName]
		if !isPresent {
			return fmt.Errorf("%s is required", requiredName)
		}

		operandErr := validateOperand(requiredName, rawOperand)
		if operandErr != nil {
			return operandErr
		}
	}

	for _, optionalName := range optionalNames {
		rawOperand, isPresent := fields[optionalName]
		isOmitted := !isPresent || string(rawOperand) == "null"
		if isOmitted {
			continue
		}

		operandErr := validateOperand(optionalName, rawOperand)
		if operandErr != nil {
			return operandErr
		}
	}

	return nil
}

func validateOperand(name string, rawOperand json.RawMessage) error {
	if !isNumberLiteral(rawOperand) {
		return fmt.Errorf("%s must be a number", name)
	}

	return nil
}

// isNumberLiteral tells a JSON number from null, strings, booleans, arrays and objects. The body
// is already valid JSON, so the first byte is enough to identify the kind of value.
func isNumberLiteral(rawValue json.RawMessage) bool {
	if len(rawValue) == 0 {
		return false
	}

	firstByte := rawValue[0]
	isDigit := firstByte >= '0' && firstByte <= '9'

	return isDigit || firstByte == '-'
}
