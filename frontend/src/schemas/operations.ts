import { z } from "zod";
import { NUMBER_PATTERN, VALIDATION_MESSAGES } from "@/constants/validation";
import type { ValidationResult } from "@/types/validation";

export const missingOperationError = {
  error: VALIDATION_MESSAGES.selectOperation,
};

export function operandSchema(field: string) {
  return z
    .string()
    .min(1, `${field} is required`)
    .regex(NUMBER_PATTERN, `${field} is not a valid number`)
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
