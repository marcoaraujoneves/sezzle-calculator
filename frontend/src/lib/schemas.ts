import { z } from "zod";
import { MAX_DIGITS, OPERATIONS, countDigits } from "@/lib/calculator";

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

export type ValidationResult =
  { ok: true; payload: BasicCalculationPayload } | { ok: false; error: string };

export function validateBasicCalculation(input: {
  operation: string | null;
  first_input: string;
  second_input: string;
}): ValidationResult {
  const parsed = basicCalculationSchema.safeParse(input);
  if (parsed.success) return { ok: true, payload: parsed.data };
  return { ok: false, error: parsed.error.issues[0].message };
}
