import type { CalculatorState } from "@/types/calculator";

export const MAX_DIGITS = 9;

export const SCIENTIFIC_DECIMALS = 3;

export const INITIAL_STATE: CalculatorState = {
  first: "",
  second: "",
  operation: null,
  answered: false,
};
