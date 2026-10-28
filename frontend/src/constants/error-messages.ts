export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const NETWORK_ERROR_MESSAGE =
  "Can't reach the calculator service. Check your connection and try again.";

// Keyed by the messages the backend answers with; they are API-facing, so the wording shown to
// people is decided here instead.
export const FRIENDLY_MESSAGE_BY_API_ERROR: Readonly<Record<string, string>> = {
  "division by zero": "Can't divide by zero.",
  "square root of a negative number is not allowed":
    "Can't take the square root of a negative number.",
  "second_input must be an integer": "The exponent must be a whole number.",
  "second_input is required": "Enter the second number first.",
  "result is too large to be represented":
    "The result is too large to be calculated.",
  "unknown operation": "That operation isn't supported.",
  "request body too large": "That number is too long to be calculated.",
};

// The backend names the offending field; people see "number" instead.
export const API_OPERAND_ERROR_PATTERN =
  /^(first_input|second_input) (is required|must be a number)$/;

export const OPERAND_ERROR_MESSAGE = "Enter a valid number.";
