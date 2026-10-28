package handlers

import "errors"

const (
	OperationAddition       = "addition"
	OperationSubtraction    = "subtraction"
	OperationMultiplication = "multiplication"
	OperationDivision       = "division"

	OperationSquareRoot     = "square_root"
	OperationExponentiation = "exponentiation"
	OperationPercentage     = "percentage"
)

var (
	ErrUnknownOperation     = errors.New("unknown operation")
	ErrDivisionByZero       = errors.New("division by zero")
	ErrNegativeSquareRoot   = errors.New("square root of a negative number is not allowed")
	ErrSecondInputRequired  = errors.New("second_input is required")
	ErrExponentNotInteger   = errors.New("second_input must be an integer")
	ErrResultNotRepresented = errors.New("result is too large to be represented")
)
