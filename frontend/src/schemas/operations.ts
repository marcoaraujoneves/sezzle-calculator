import { z } from "zod";
import { NUMBER_PATTERN, VALIDATION_MESSAGES } from "@/constants/validation";
import type { ValidationResult } from "@/types/validation";

export const missingOperationError = {
  error: VALIDATION_MESSAGES.selectOperation,
};

export function operandSchema(field: string) {
  return z
    .string()
    .min(1, `Enter the ${field}.`)
    .regex(NUMBER_PATTERN, `Enter a valid ${field}.`)
    .transform(Number);
}

export function firstIssue<T>(
  parsed: z.ZodSafeParseResult<T>,
): ValidationResult<T> {
  if (parsed.success) {
    return { ok: true, payload: parsed.data };
  }

  return { ok: false, error: parsed.error.issues[0].message };
}
