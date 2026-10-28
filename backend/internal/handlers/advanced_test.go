package handlers_test

import (
	"errors"
	"math"
	"testing"

	"sezzle-calculator/internal/handlers"
)

// ptr builds the optional second_input, where nil means the field was absent.
func ptr(value float64) *float64 {
	return &value
}

func TestCalculateAdvanced(t *testing.T) {
	const maxOperand = 999999999

	tests := []struct {
		name      string
		operation string
		input     float64
		second    *float64
		want      float64
		wantErr   error
	}{
		{"square root of a perfect square", handlers.OperationSquareRoot, 144, nil, 12, nil},
		{"square root of a decimal", handlers.OperationSquareRoot, 6.25, nil, 2.5, nil},
		{"square root of a fraction", handlers.OperationSquareRoot, 0.25, nil, 0.5, nil},
		{"square root of one", handlers.OperationSquareRoot, 1, nil, 1, nil},
		{"square root of zero", handlers.OperationSquareRoot, 0, nil, 0, nil},
		{"square root ignores a second input", handlers.OperationSquareRoot, 9, ptr(2), 3, nil},
		{"square root of a negative number", handlers.OperationSquareRoot, -4, nil, 0, handlers.ErrNegativeSquareRoot},
		{"square root of a negative decimal", handlers.OperationSquareRoot, -0.5, nil, 0, handlers.ErrNegativeSquareRoot},
		{"square root of the largest nine-digit operand", handlers.OperationSquareRoot, maxOperand, nil, 31622.776585872405, nil},
		{"square root of the largest float", handlers.OperationSquareRoot, math.MaxFloat64, nil, 1.3407807929942596e154, nil},
		{"square root of the smallest float", handlers.OperationSquareRoot, math.SmallestNonzeroFloat64, nil, 2.2227587494850775e-162, nil},

		{"power of an integer", handlers.OperationExponentiation, 3, ptr(2), 9, nil},
		{"power of a decimal base", handlers.OperationExponentiation, 1.5, ptr(2), 2.25, nil},
		{"power of a negative base", handlers.OperationExponentiation, -3, ptr(2), 9, nil},
		{"power of a negative base and odd exponent", handlers.OperationExponentiation, -3, ptr(3), -27, nil},
		{"power with a zero exponent", handlers.OperationExponentiation, 7, ptr(0), 1, nil},
		{"zero to the zero", handlers.OperationExponentiation, 0, ptr(0), 1, nil},
		{"zero to a positive power", handlers.OperationExponentiation, 0, ptr(2), 0, nil},
		{"power with a negative exponent", handlers.OperationExponentiation, 2, ptr(-2), 0.25, nil},
		{"power with a decimal exponent", handlers.OperationExponentiation, 4, ptr(0.5), 0, handlers.ErrExponentNotInteger},
		{"power with a negative decimal exponent", handlers.OperationExponentiation, 4, ptr(-0.5), 0, handlers.ErrExponentNotInteger},
		{"power without an exponent", handlers.OperationExponentiation, 4, nil, 0, handlers.ErrSecondInputRequired},
		{"power overflowing", handlers.OperationExponentiation, 10, ptr(1000), 0, handlers.ErrResultNotRepresented},
		{"negative base overflowing to negative infinity", handlers.OperationExponentiation, -10, ptr(1001), 0, handlers.ErrResultNotRepresented},
		{"negative base overflowing to positive infinity", handlers.OperationExponentiation, -10, ptr(1000), 0, handlers.ErrResultNotRepresented},
		{"zero to a negative power", handlers.OperationExponentiation, 0, ptr(-2), 0, handlers.ErrResultNotRepresented},
		{"power underflowing to zero", handlers.OperationExponentiation, 10, ptr(-1000), 0, nil},

		// Exponents are not bounded, so they can go far beyond what float64 can hold.
		{"two to the largest representable power", handlers.OperationExponentiation, 2, ptr(1023), math.Ldexp(1, 1023), nil},
		{"two to the first overflowing power", handlers.OperationExponentiation, 2, ptr(1024), 0, handlers.ErrResultNotRepresented},
		{"two to the smallest representable power", handlers.OperationExponentiation, 2, ptr(-1074), math.SmallestNonzeroFloat64, nil},
		{"two to the first underflowing power", handlers.OperationExponentiation, 2, ptr(-1075), 0, nil},
		{"largest base squared", handlers.OperationExponentiation, maxOperand, ptr(2), 9.99999998e17, nil},
		{"largest base to the largest exponent", handlers.OperationExponentiation, maxOperand, ptr(maxOperand), 0, handlers.ErrResultNotRepresented},
		{"one to the largest exponent", handlers.OperationExponentiation, 1, ptr(maxOperand), 1, nil},
		{"minus one to an odd exponent", handlers.OperationExponentiation, -1, ptr(maxOperand), -1, nil},
		{"minus one to an even exponent", handlers.OperationExponentiation, -1, ptr(maxOperand - 1), 1, nil},
		{"minus one to a huge even exponent", handlers.OperationExponentiation, -1, ptr(1e300), 1, nil},
		{"minus one to the power of minus one", handlers.OperationExponentiation, -1, ptr(-1), -1, nil},
		{"fraction to the largest exponent underflows", handlers.OperationExponentiation, 0.5, ptr(maxOperand), 0, nil},
		{"largest float to one", handlers.OperationExponentiation, math.MaxFloat64, ptr(1), math.MaxFloat64, nil},

		{"percentage of a number", handlers.OperationPercentage, 20, ptr(150), 30, nil},
		{"percentage with a decimal rate", handlers.OperationPercentage, 12.5, ptr(80), 10, nil},
		{"percentage above one hundred", handlers.OperationPercentage, 150, ptr(80), 120, nil},
		{"negative percentage", handlers.OperationPercentage, -10, ptr(80), -8, nil},
		{"percentage of a negative number", handlers.OperationPercentage, 10, ptr(-2), -0.2, nil},
		{"percentage of zero", handlers.OperationPercentage, 50, ptr(0), 0, nil},
		{"zero percent", handlers.OperationPercentage, 0, ptr(150), 0, nil},
		{"percentage without a base", handlers.OperationPercentage, 20, nil, 0, handlers.ErrSecondInputRequired},
		{"percentage of the largest nine-digit base", handlers.OperationPercentage, 50, ptr(maxOperand), 499999999.5, nil},
		{"percentage overflowing", handlers.OperationPercentage, math.MaxFloat64, ptr(1000), 0, handlers.ErrResultNotRepresented},
		{"percentage overflowing negatively", handlers.OperationPercentage, math.MaxFloat64, ptr(-1000), 0, handlers.ErrResultNotRepresented},

		{"unknown operation", "cube_root", 8, nil, 0, handlers.ErrUnknownOperation},
		{"empty operation", "", 8, nil, 0, handlers.ErrUnknownOperation},
		{"basic operations are not advanced", handlers.OperationAddition, 8, ptr(2), 0, handlers.ErrUnknownOperation},
		{"operation names are case sensitive", "Square_Root", 8, nil, 0, handlers.ErrUnknownOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := handlers.CalculateAdvanced(tt.operation, tt.input, tt.second)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v, want %v", err, tt.wantErr)
			}

			if got != tt.want {
				t.Errorf("result = %v, want %v", got, tt.want)
			}
		})
	}
}
