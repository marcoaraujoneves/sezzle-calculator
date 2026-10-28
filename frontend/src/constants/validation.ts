// Signed answers are fed back as inputs, so the sign is accepted but never counted.
export const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

export const VALIDATION_MESSAGES = {
  selectOperation: "Select an operation",
  divisionByZero: "Division by zero is not allowed",
  negativeSquareRoot: "Square root of a negative number is not allowed",
  nonIntegerExponent: "Exponent must be an integer",
  unrepresentableResult: "Result is too large to be represented",
} as const;
