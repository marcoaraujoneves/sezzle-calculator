export type ValidationResult<T> =
  { ok: true; payload: T } | { ok: false; error: string };

export interface UnaryCalculationInput {
  operation: string | null;
  first_input: string;
}

export interface BinaryCalculationInput extends UnaryCalculationInput {
  second_input: string;
}
