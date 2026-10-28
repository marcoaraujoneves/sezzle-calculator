package handlers_test

import (
	"errors"
	"testing"

	"sezzle-calculator/internal/handlers"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation string
		first     float64
		second    float64
		want      float64
		wantErr   error
	}{
		{"addition", "addition", 2, 3, 5, nil},
		{"subtraction", "subtraction", 2, 3, -1, nil},
		{"multiplication", "multiplication", 4, 2.5, 10, nil},
		{"division", "division", 9, 4, 2.25, nil},
		{"division by zero", "division", 1, 0, 0, handlers.ErrDivisionByZero},
		{"zero divided by a number", "division", 0, 5, 0, nil},
		{"unknown operation", "power", 2, 3, 0, handlers.ErrUnknownOperation},
		{"empty operation", "", 2, 3, 0, handlers.ErrUnknownOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := handlers.Calculate(tt.operation, tt.first, tt.second)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v, want %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("result = %v, want %v", got, tt.want)
			}
		})
	}
}
