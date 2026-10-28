import { z } from "zod";
import { OPERATIONS } from "@/constants/operations";
import {
  firstIssue,
  missingOperationError,
  operandSchema,
} from "@/schemas/operations";
import type { BasicCalculationPayload } from "@/types/payloads";
import type {
  BinaryCalculationInput,
  ValidationResult,
} from "@/types/validation";

export const basicCalculationSchema = z.object({
  operation: z.enum(OPERATIONS, missingOperationError),
  first_input: operandSchema("First input"),
  second_input: operandSchema("Second input"),
});

export function validateBasicCalculation(
  input: BinaryCalculationInput,
): ValidationResult<BasicCalculationPayload> {
  return firstIssue(basicCalculationSchema.safeParse(input));
}
