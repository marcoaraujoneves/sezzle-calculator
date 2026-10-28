import { toCalculationInput } from "@/lib/calculator";
import { validateBasicCalculation } from "@/schemas/basic-calculations";
import type { CalculatorState } from "@/types/calculator";
import type { BasicCalculationPayload } from "@/types/payloads";
import type { ValidationResult } from "@/types/validation";

export function prepareBasicCalculation(
  state: CalculatorState,
): ValidationResult<BasicCalculationPayload> {
  return validateBasicCalculation(toCalculationInput(state));
}
