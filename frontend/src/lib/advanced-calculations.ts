import { EXPONENTIATION, PERCENTAGE } from "@/constants/operations";
import { toCalculationInput } from "@/lib/calculator";
import {
  validateAdvancedCalculation,
  validateExponentiation,
  validatePercentage,
} from "@/schemas/advanced-calculations";
import type { CalculatorState } from "@/types/calculator";
import type {
  AdvancedOperation,
  SelectableOperation,
} from "@/types/operations";
import type {
  AdvancedCalculationPayload,
  ExponentiationPayload,
  PercentagePayload,
} from "@/types/payloads";
import type { ValidationResult } from "@/types/validation";

type BinaryAdvancedOperation = typeof EXPONENTIATION | typeof PERCENTAGE;

// These operations wait for a second input like the basic ones, but the backend serves them as advanced.
export function isBinaryAdvancedOperation(
  operation: SelectableOperation | null,
): operation is BinaryAdvancedOperation {
  return operation === EXPONENTIATION || operation === PERCENTAGE;
}

export function prepareUnaryCalculation(
  operation: AdvancedOperation,
  state: CalculatorState,
): ValidationResult<AdvancedCalculationPayload> {
  return validateAdvancedCalculation({
    operation,
    first_input: state.first,
  });
}

export function prepareBinaryAdvancedCalculation(
  state: CalculatorState,
): ValidationResult<ExponentiationPayload | PercentagePayload> {
  const input = toCalculationInput(state);

  if (state.operation === PERCENTAGE) {
    return validatePercentage(input);
  }

  return validateExponentiation(input);
}
