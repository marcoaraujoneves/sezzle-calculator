export const MAX_DIGITS = 9;

export const OPERATIONS = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
] as const;

export type Operation = (typeof OPERATIONS)[number];

// Advanced operations take a single operand and run as soon as their key is clicked.
export const ADVANCED_OPERATIONS = ["square_root"] as const;

export type AdvancedOperation = (typeof ADVANCED_OPERATIONS)[number];

// Exponentiation is typed like a basic operation but is served by the advanced endpoint.
export const EXPONENTIATION = "exponentiation";

// Percentage is typed like a basic operation but is served by the advanced endpoint.
export const PERCENTAGE = "percentage";

export type SelectableOperation =
  Operation | typeof EXPONENTIATION | typeof PERCENTAGE;

export interface CalculatorState {
  first: string;
  second: string;
  operation: SelectableOperation | null;
  // The first input holds a previous answer, which only an operation may reuse.
  answered: boolean;
}

export const INITIAL_STATE: CalculatorState = {
  first: "",
  second: "",
  operation: null,
  answered: false,
};

export function answerState(result: number): CalculatorState {
  return { ...INITIAL_STATE, first: String(result), answered: true };
}

// Typing after an answer starts a new round instead of extending the answer.
function inputTarget(state: CalculatorState): CalculatorState {
  return state.answered ? INITIAL_STATE : state;
}

export const OPERATION_SYMBOLS: Record<SelectableOperation, string> = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: "÷",
  exponentiation: "^",
  percentage: "%",
};

export function activeInput(state: CalculatorState): string {
  return state.operation === null ? state.first : state.second;
}

function withActiveInput(
  state: CalculatorState,
  value: string,
): CalculatorState {
  return state.operation === null
    ? { ...state, first: value }
    : { ...state, second: value };
}

// The sign and decimal point are part of the number but not of the backend's digit limit.
export function countDigits(value: string): number {
  return value.replace(/[-.]/g, "").length;
}

export function canAppendDigit(state: CalculatorState): boolean {
  return countDigits(activeInput(inputTarget(state))) < MAX_DIGITS;
}

export function canAppendDecimal(state: CalculatorState): boolean {
  return !activeInput(inputTarget(state)).includes(".");
}

export function appendDigit(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  if (!canAppendDigit(state)) return state;
  const target = inputTarget(state);
  return withActiveInput(target, activeInput(target) + digit);
}

export function appendDecimal(state: CalculatorState): CalculatorState {
  if (!canAppendDecimal(state)) return state;
  const target = inputTarget(state);
  return withActiveInput(target, `${activeInput(target)}.`);
}

// Flips the active input in place, answer included, so a result can be negated and reused.
export function toggleSign(state: CalculatorState): CalculatorState {
  const value = activeInput(state);
  return withActiveInput(
    state,
    value.startsWith("-") ? value.slice(1) : `-${value}`,
  );
}

export function selectOperation(
  state: CalculatorState,
  operation: SelectableOperation,
): CalculatorState {
  // Minus on an empty calculator is a sign, since "0 − n" is never what typing "-n" means.
  if (
    operation === "subtraction" &&
    state.operation === null &&
    state.first === "" &&
    !state.answered
  ) {
    return { ...state, first: "-" };
  }

  // Likewise, minus right after an operator signs the second input instead of replacing the operator.
  if (
    operation === "subtraction" &&
    state.operation !== null &&
    state.second === ""
  ) {
    return { ...state, second: "-" };
  }

  // The display already shows 0 while nothing is typed, so the first input must be 0 too.
  return { ...state, first: state.first || "0", operation, answered: false };
}

export function removeLastDigit(state: CalculatorState): CalculatorState {
  if (state.answered) return INITIAL_STATE;
  if (state.operation !== null && state.second === "") {
    return { ...state, operation: null };
  }
  return withActiveInput(state, activeInput(state).slice(0, -1));
}

export function formatExpression(state: CalculatorState): string {
  if (state.operation === null) return "";
  return `${formatNumber(state.first)} ${OPERATION_SYMBOLS[state.operation]}`;
}

const SCIENTIFIC_DECIMALS = 3;

// Drops the zeros left at the end once the fraction is cut to maxLength digits.
function truncateFraction(fraction: string, maxLength: number): string {
  return fraction.slice(0, maxLength).replace(/0+$/, "");
}

// Engineering notation keeps the exponent a multiple of 3, so 10000000000 reads "10 × 10^9".
function toScientific(digits: string, exponent: number): string {
  const power = Math.floor(exponent / 3) * 3;
  const integerLength = exponent - power + 1;
  const integer = digits.padEnd(integerLength, "0").slice(0, integerLength);
  const fraction = truncateFraction(
    digits.slice(integerLength),
    SCIENTIFIC_DECIMALS,
  );
  return `${integer}${fraction && `.${fraction}`} × 10^${power}`;
}

// Typed input and short answers are shown as they are, since "2." must stay "2." while typing.
// Anything else can only be a backend answer, which is shortened to fit MAX_DIGITS.
export function formatNumber(raw: string): string {
  if (countDigits(raw) <= MAX_DIGITS && !raw.includes("e")) return raw;

  const value = Number(raw);
  const sign = value < 0 ? "-" : "";
  const [mantissa, exponentText] = Math.abs(value).toExponential().split("e");
  const digits = mantissa.replace(".", "");
  const exponent = Number(exponentText);

  if (exponent >= MAX_DIGITS) return sign + toScientific(digits, exponent);

  const integerLength = Math.max(exponent + 1, 1);
  const integer =
    exponent >= 0
      ? digits.padEnd(integerLength, "0").slice(0, integerLength)
      : "0";
  const fraction = truncateFraction(
    exponent >= 0
      ? digits.slice(integerLength)
      : "0".repeat(-exponent - 1) + digits,
    MAX_DIGITS - integerLength,
  );

  // Truncating would show 0 for a tiny answer, so it stays in scientific notation.
  if (integer === "0" && fraction === "") {
    return sign + toScientific(digits, exponent);
  }
  return `${sign}${integer}${fraction && `.${fraction}`}`;
}
