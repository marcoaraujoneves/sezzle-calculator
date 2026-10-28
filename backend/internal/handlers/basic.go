package handlers

import "net/http"

type basicRequest struct {
	Operation   string  `json:"operation"`
	FirstInput  float64 `json:"first_input"`
	SecondInput float64 `json:"second_input"`
}

// BasicCalculations serves the four arithmetic operations on two operands.
var BasicCalculations http.HandlerFunc = calculationHandler(func(request basicRequest) (float64, error) {
	return CalculateBasic(request.Operation, request.FirstInput, request.SecondInput)
})

func CalculateBasic(operation string, firstOperand, secondOperand float64) (float64, error) {
	switch operation {
	case OperationAddition:
		return ensureRepresentable(firstOperand + secondOperand)

	case OperationSubtraction:
		return ensureRepresentable(firstOperand - secondOperand)

	case OperationMultiplication:
		return ensureRepresentable(firstOperand * secondOperand)

	case OperationDivision:
		return divide(firstOperand, secondOperand)

	default:
		return 0, ErrUnknownOperation
	}
}

func divide(dividend, divisor float64) (float64, error) {
	if divisor == 0 {
		return 0, ErrDivisionByZero
	}

	return ensureRepresentable(dividend / divisor)
}
