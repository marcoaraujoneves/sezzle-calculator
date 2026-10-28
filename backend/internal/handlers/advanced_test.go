package handlers_test

import (
	"errors"
	"math"
	"testing"

	"sezzle-calculator/internal/handlers"
)

func TestCalculateAdvanced(t *testing.T) {
	two, zero, negTwo, half := 2.0, 0.0, -2.0, 0.5
	huge := 1000.0
	oneFifty, eighty := 150.0, 80.0

	tests := []struct {
		name      string
		operation string
		input     float64
		second    *float64
		want      float64
		wantErr   error
	}{
		{"square root of a perfect square", "square_root", 144, nil, 12, nil},
		{"square root of a decimal", "square_root", 6.25, nil, 2.5, nil},
		{"square root of a fraction", "square_root", 0.25, nil, 0.5, nil},
		{"square root of zero", "square_root", 0, nil, 0, nil},
		{"square root of a negative number", "square_root", -4, nil, 0, handlers.ErrNegativeSquareRoot},
		{"square root of a negative decimal", "square_root", -0.5, nil, 0, handlers.ErrNegativeSquareRoot},
		{"power of an integer", "exponentiation", 3, &two, 9, nil},
		{"power of a decimal base", "exponentiation", 1.5, &two, 2.25, nil},
		{"power of a negative base", "exponentiation", -3, &two, 9, nil},
		{"power with a zero exponent", "exponentiation", 7, &zero, 1, nil},
		{"power with a negative exponent", "exponentiation", 2, &negTwo, 0.25, nil},
		{"power with a decimal exponent", "exponentiation", 4, &half, 0, handlers.ErrExponentNotInteger},
		{"power without an exponent", "exponentiation", 4, nil, 0, handlers.ErrSecondInputRequired},
		{"power overflowing", "exponentiation", 10, &huge, 0, handlers.ErrResultNotRepresented},
		{"zero to a negative power", "exponentiation", 0, &negTwo, 0, handlers.ErrResultNotRepresented},
		{"percentage of a number", "percentage", 20, &oneFifty, 30, nil},
		{"percentage with a decimal rate", "percentage", 12.5, &eighty, 10, nil},
		{"percentage above one hundred", "percentage", 150, &eighty, 120, nil},
		{"negative percentage", "percentage", -10, &eighty, -8, nil},
		{"percentage of a negative number", "percentage", 10, &negTwo, -0.2, nil},
		{"percentage of zero", "percentage", 50, &zero, 0, nil},
		{"percentage without a base", "percentage", 20, nil, 0, handlers.ErrSecondInputRequired},
		{"percentage overflowing", "percentage", math.MaxFloat64, &huge, 0, handlers.ErrResultNotRepresented},
		{"unknown operation", "cube_root", 8, nil, 0, handlers.ErrUnknownOperation},
		{"empty operation", "", 8, nil, 0, handlers.ErrUnknownOperation},
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
