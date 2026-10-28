export const OPERATIONS = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
] as const;

// Advanced operations take a single operand and run as soon as their key is clicked.
export const ADVANCED_OPERATIONS = ["square_root"] as const;

// Exponentiation is typed like a basic operation but is served by the advanced endpoint.
export const EXPONENTIATION = "exponentiation";

// Percentage is typed like a basic operation but is served by the advanced endpoint.
export const PERCENTAGE = "percentage";
