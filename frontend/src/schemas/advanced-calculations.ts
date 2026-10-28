import { z } from "zod";
import {
  ADVANCED_OPERATIONS,
  EXPONENTIATION,
  PERCENTAGE,
} from "@/constants/operations";
import {
  firstIssue,
  missingOperationError,
  operandSchema,
} from "@/schemas/operations";
import type {
  AdvancedCalculationPayload,
  ExponentiationPayload,
  PercentagePayload,
} from "@/types/payloads";
import type {
  BinaryCalculationInput,
  UnaryCalculationInput,
  ValidationResult,
} from "@/types/validation";

export const advancedCalculationSchema = z.object({
  operation: z.enum(ADVANCED_OPERATIONS, missingOperationError),
  first_input: operandSchema("First input"),
});

export const exponentiationSchema = z.object({
  operation: z.literal(EXPONENTIATION, missingOperationError),
  first_input: operandSchema("First input"),
  second_input: operandSchema("Second input"),
});

export const percentageSchema = z.object({
  operation: z.literal(PERCENTAGE, missingOperationError),
  first_input: operandSchema("First input"),
  second_input: operandSchema("Second input"),
});

export function validateAdvancedCalculation(
  input: UnaryCalculationInput,
): ValidationResult<AdvancedCalculationPayload> {
  return firstIssue(advancedCalculationSchema.safeParse(input));
}

export function validateExponentiation(
  input: BinaryCalculationInput,
): ValidationResult<ExponentiationPayload> {
  return firstIssue(exponentiationSchema.safeParse(input));
}

export function validatePercentage(
  input: BinaryCalculationInput,
): ValidationResult<PercentagePayload> {
  return firstIssue(percentageSchema.safeParse(input));
}
