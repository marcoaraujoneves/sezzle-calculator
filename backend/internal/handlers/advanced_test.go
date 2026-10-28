package handlers_test

import (
	"errors"
	"testing"

	"sezzle-calculator/internal/handlers"
)

func TestCalculateAdvanced(t *testing.T) {
	tests := []struct {
		name      string
		operation string
		input     float64
		want      float64
		wantErr   error
	}{
		{"square root of a perfect square", "square_root", 144, 12, nil},
		{"square root of a decimal", "square_root", 6.25, 2.5, nil},
		{"square root of a fraction", "square_root", 0.25, 0.5, nil},
		{"square root of zero", "square_root", 0, 0, nil},
		{"square root of a negative number", "square_root", -4, 0, handlers.ErrNegativeSquareRoot},
		{"square root of a negative decimal", "square_root", -0.5, 0, handlers.ErrNegativeSquareRoot},
		{"unknown operation", "cube_root", 8, 0, handlers.ErrUnknownOperation},
		{"empty operation", "", 8, 0, handlers.ErrUnknownOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := handlers.CalculateAdvanced(tt.operation, tt.input)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v, want %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("result = %v, want %v", got, tt.want)
			}
		})
	}
}
