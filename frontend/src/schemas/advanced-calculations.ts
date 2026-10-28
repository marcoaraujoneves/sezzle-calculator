import { z } from "zod";
import {
  ADVANCED_OPERATIONS,
  EXPONENTIATION,
  PERCENTAGE,
} from "@/constants/operations";
import { VALIDATION_MESSAGES } from "@/constants/validation";
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

export const advancedCalculationSchema = z
  .object({
    operation: z.enum(ADVANCED_OPERATIONS, missingOperationError),
    first_input: operandSchema("First input"),
  })
  .refine(
    ({ operation, first_input }) => {
      return operation !== "square_root" || first_input >= 0;
    },
    {
      message: VALIDATION_MESSAGES.negativeSquareRoot,
      path: ["first_input"],
    },
  );

export const exponentiationSchema = z
  .object({
    operation: z.literal(EXPONENTIATION, missingOperationError),
    first_input: operandSchema("First input"),
    second_input: operandSchema("Second input"),
  })
  .refine(({ second_input }) => Number.isInteger(second_input), {
    message: VALIDATION_MESSAGES.nonIntegerExponent,
    path: ["second_input"],
  })
  // Overflow and a zero base with a negative exponent are infinite, which the backend cannot return.
  .refine(
    ({ first_input, second_input }) => {
      return Number.isFinite(first_input ** second_input);
    },
    {
      message: VALIDATION_MESSAGES.unrepresentableResult,
      path: ["second_input"],
    },
  );

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
