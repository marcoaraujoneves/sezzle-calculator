import type { CalculatorState } from "@/types/calculator";

// Any decimal with up to 15 significant digits survives a float64 round trip, so what the user
// types is exactly what the backend calculates. It also keeps typed operands far below 1e308.
export const MAX_DIGITS = 15;

export const SCIENTIFIC_DECIMALS = 3;

export const INITIAL_STATE: CalculatorState = {
  first: "",
  second: "",
  operation: null,
  answered: false,
};
