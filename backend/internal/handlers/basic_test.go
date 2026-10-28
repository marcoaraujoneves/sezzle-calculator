package handlers_test

import (
	"errors"
	"math"
	"testing"

	"sezzle-calculator/internal/handlers"
)

func TestCalculateBasic(t *testing.T) {
	const maxOperand = 999999999

	tests := []struct {
		name      string
		operation string
		first     float64
		second    float64
		want      float64
		wantErr   error
	}{
		{"addition", handlers.OperationAddition, 2, 3, 5, nil},
		{"addition of negatives", handlers.OperationAddition, -2, -3, -5, nil},
		{"addition cancelling out", handlers.OperationAddition, 5, -5, 0, nil},
		{"subtraction", handlers.OperationSubtraction, 2, 3, -1, nil},
		{"subtraction of negatives", handlers.OperationSubtraction, -2, -3, 1, nil},
		{"multiplication", handlers.OperationMultiplication, 4, 2.5, 10, nil},
		{"multiplication by zero", handlers.OperationMultiplication, 123456789, 0, 0, nil},
		{"multiplication of negatives", handlers.OperationMultiplication, -4, -2.5, 10, nil},
		{"multiplication of opposite signs", handlers.OperationMultiplication, -4, 2.5, -10, nil},
		{"division", handlers.OperationDivision, 9, 4, 2.25, nil},
		{"division of negatives", handlers.OperationDivision, -9, -4, 2.25, nil},
		{"zero divided by a number", handlers.OperationDivision, 0, 5, 0, nil},
		{"division by zero", handlers.OperationDivision, 1, 0, 0, handlers.ErrDivisionByZero},
		{"zero divided by zero", handlers.OperationDivision, 0, 0, 0, handlers.ErrDivisionByZero},
		{"division by negative zero", handlers.OperationDivision, 1, math.Copysign(0, -1), 0, handlers.ErrDivisionByZero},
		{"unknown operation", "power", 2, 3, 0, handlers.ErrUnknownOperation},
		{"empty operation", "", 2, 3, 0, handlers.ErrUnknownOperation},
		{"operation names are case sensitive", "Addition", 2, 3, 0, handlers.ErrUnknownOperation},

		// Nine-digit operands are the largest the API accepts; their products no longer fit the 53
		// bits of float64 precision, so the result is the nearest representable value.
		{"largest operands added", handlers.OperationAddition, maxOperand, maxOperand, 1999999998, nil},
		{"largest operands subtracted", handlers.OperationSubtraction, -maxOperand, maxOperand, -1999999998, nil},
		{"largest operands multiplied", handlers.OperationMultiplication, maxOperand, maxOperand, 9.99999998e17, nil},
		{"smallest nine-digit decimal divided", handlers.OperationDivision, 1, 99999999.9, 1.0000000010000000e-8, nil},

		// Float rounding is part of the contract: the service returns the float64 result as is.
		{"binary fractions are inexact", handlers.OperationAddition, 0.1, 0.2, 0.30000000000000004, nil},
		{"integer sums above 2^53 lose the last bit", handlers.OperationAddition, 9007199254740992, 1, 9007199254740992, nil},

		// A decimal literal such as 1e308 passes the nine-digit limit, so overflow must be handled.
		{"addition overflowing", handlers.OperationAddition, math.MaxFloat64, math.MaxFloat64, 0, handlers.ErrResultNotRepresented},
		{"addition overflowing negatively", handlers.OperationAddition, -math.MaxFloat64, -math.MaxFloat64, 0, handlers.ErrResultNotRepresented},
		{"subtraction overflowing", handlers.OperationSubtraction, math.MaxFloat64, -math.MaxFloat64, 0, handlers.ErrResultNotRepresented},
		{"multiplication overflowing", handlers.OperationMultiplication, math.MaxFloat64, 2, 0, handlers.ErrResultNotRepresented},
		{"multiplication overflowing negatively", handlers.OperationMultiplication, math.MaxFloat64, -2, 0, handlers.ErrResultNotRepresented},
		{"division overflowing", handlers.OperationDivision, math.MaxFloat64, 0.5, 0, handlers.ErrResultNotRepresented},
		{"division by the smallest float overflowing", handlers.OperationDivision, 1, math.SmallestNonzeroFloat64, 0, handlers.ErrResultNotRepresented},
		{"largest float is representable", handlers.OperationAddition, math.MaxFloat64, 0, math.MaxFloat64, nil},
		{"addition below the float precision is absorbed", handlers.OperationAddition, math.MaxFloat64, 1, math.MaxFloat64, nil},
		{"multiplication underflowing to zero", handlers.OperationMultiplication, math.SmallestNonzeroFloat64, 0.5, 0, nil},
		{"division underflowing to zero", handlers.OperationDivision, math.SmallestNonzeroFloat64, 2, 0, nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := handlers.CalculateBasic(tt.operation, tt.first, tt.second)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v, want %v", err, tt.wantErr)
			}

			if got != tt.want {
				t.Errorf("result = %v, want %v", got, tt.want)
			}
		})
	}
}
