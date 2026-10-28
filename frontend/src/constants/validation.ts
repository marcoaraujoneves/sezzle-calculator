// Answers are fed back as inputs, so the sign and the exponent notation JavaScript uses for very
// large and very small numbers (1e+21, 5e-324) must be accepted.
export const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/;

// Only what the SPA must know before sending; the backend is the source of truth for the rest.
export const VALIDATION_MESSAGES = {
  selectOperation: "Select an operation first.",
} as const;
