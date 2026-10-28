package handlers

import (
	"math"
	"net/http"
)

type advancedRequest struct {
	Operation  string  `json:"operation"`
	FirstInput float64 `json:"first_input"`
	// A pointer tells an absent second_input apart from an explicit 0, which is a valid exponent.
	SecondInput *float64 `json:"second_input"`
}

// AdvancedCalculations serves the operations on one operand (square root) and on two operands
// where the second is optional at the type level (exponentiation, percentage).
var AdvancedCalculations http.HandlerFunc = calculationHandler(func(request advancedRequest) (float64, error) {
	return CalculateAdvanced(request.Operation, request.FirstInput, request.SecondInput)
})

func CalculateAdvanced(operation string, firstOperand float64, secondOperand *float64) (float64, error) {
	switch operation {
	case OperationSquareRoot:
		return squareRoot(firstOperand)

	case OperationExponentiation:
		return exponentiate(firstOperand, secondOperand)

	case OperationPercentage:
		return percentage(firstOperand, secondOperand)

	default:
		return 0, ErrUnknownOperation
	}
}

func squareRoot(radicand float64) (float64, error) {
	if radicand < 0 {
		return 0, ErrNegativeSquareRoot
	}

	return math.Sqrt(radicand), nil
}

// The exponent must be an integer so a negative base never yields a complex result.
func exponentiate(base float64, exponent *float64) (float64, error) {
	if exponent == nil {
		return 0, ErrSecondInputRequired
	}

	isIntegerExponent := *exponent == math.Trunc(*exponent)
	if !isIntegerExponent {
		return 0, ErrExponentNotInteger
	}

	// A zero base with a negative exponent is also Inf, which ensureRepresentable rejects.
	return ensureRepresentable(math.Pow(base, *exponent))
}

// The first input is the rate and the second the base, so "20 % 150" reads as 20% of 150.
func percentage(rate float64, base *float64) (float64, error) {
	if base == nil {
		return 0, ErrSecondInputRequired
	}

	return ensureRepresentable(rate / 100 * *base)
}
