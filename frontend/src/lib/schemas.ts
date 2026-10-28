import { z } from "zod";
import {
  ADVANCED_OPERATIONS,
  EXPONENTIATION,
  MAX_DIGITS,
  OPERATIONS,
  PERCENTAGE,
  countDigits,
} from "@/lib/calculator";

// Signed answers are fed back as inputs, so the sign is accepted but never counted.
const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

function operandSchema(field: string) {
  return z
    .string()
    .min(1, `${field} is required`)
    .regex(NUMBER_PATTERN, `${field} is not a valid number`)
    .refine(
      (value) => countDigits(value.replace("-", "")) <= MAX_DIGITS,
      `${field} must have at most ${MAX_DIGITS} digits`,
    )
    .transform(Number);
}

export const basicCalculationSchema = z
  .object({
    operation: z.enum(OPERATIONS, { error: "Select an operation" }),
    first_input: operandSchema("First input"),
    second_input: operandSchema("Second input"),
  })
  .refine(
    ({ operation, second_input }) =>
      operation !== "division" || second_input !== 0,
    { message: "Division by zero is not allowed", path: ["second_input"] },
  );

export type BasicCalculationPayload = z.output<typeof basicCalculationSchema>;

export const advancedCalculationSchema = z
  .object({
    operation: z.enum(ADVANCED_OPERATIONS, { error: "Select an operation" }),
    first_input: operandSchema("First input"),
  })
  .refine(
    ({ operation, first_input }) =>
      operation !== "square_root" || first_input >= 0,
    {
      message: "Square root of a negative number is not allowed",
      path: ["first_input"],
    },
  );

export type AdvancedCalculationPayload = z.output<
  typeof advancedCalculationSchema
>;

export const exponentiationSchema = z
  .object({
    operation: z.literal(EXPONENTIATION, { error: "Select an operation" }),
    first_input: operandSchema("First input"),
    second_input: operandSchema("Second input"),
  })
  .refine(({ second_input }) => Number.isInteger(second_input), {
    message: "Exponent must be an integer",
    path: ["second_input"],
  })
  // Overflow and a zero base with a negative exponent are infinite, which the backend cannot return.
  .refine(
    ({ first_input, second_input }) =>
      Number.isFinite(first_input ** second_input),
    {
      message: "Result is too large to be represented",
      path: ["second_input"],
    },
  );

export type ExponentiationPayload = z.output<typeof exponentiationSchema>;

export const percentageSchema = z.object({
  operation: z.literal(PERCENTAGE, { error: "Select an operation" }),
  first_input: operandSchema("First input"),
  second_input: operandSchema("Second input"),
});

export type PercentagePayload = z.output<typeof percentageSchema>;

export type ValidationResult<T> =
  { ok: true; payload: T } | { ok: false; error: string };

function firstIssue<T>(parsed: z.ZodSafeParseResult<T>): ValidationResult<T> {
  if (parsed.success) return { ok: true, payload: parsed.data };
  return { ok: false, error: parsed.error.issues[0].message };
}

export function validateBasicCalculation(input: {
  operation: string | null;
  first_input: string;
  second_input: string;
}): ValidationResult<BasicCalculationPayload> {
  return firstIssue(basicCalculationSchema.safeParse(input));
}

export function validateAdvancedCalculation(input: {
  operation: string | null;
  first_input: string;
}): ValidationResult<AdvancedCalculationPayload> {
  return firstIssue(advancedCalculationSchema.safeParse(input));
}

export function validateExponentiation(input: {
  operation: string | null;
  first_input: string;
  second_input: string;
}): ValidationResult<ExponentiationPayload> {
  return firstIssue(exponentiationSchema.safeParse(input));
}

export function validatePercentage(input: {
  operation: string | null;
  first_input: string;
  second_input: string;
}): ValidationResult<PercentagePayload> {
  return firstIssue(percentageSchema.safeParse(input));
}
