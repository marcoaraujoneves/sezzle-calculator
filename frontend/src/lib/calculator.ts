export const MAX_DIGITS = 9;

export const OPERATIONS = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
] as const;

export type Operation = (typeof OPERATIONS)[number];

export interface CalculatorState {
  first: string;
  second: string;
  operation: Operation | null;
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

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: "÷",
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

// The decimal point is part of the number but not of the backend's digit limit.
export function countDigits(value: string): number {
  return value.replace(".", "").length;
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

export function selectOperation(
  state: CalculatorState,
  operation: Operation,
): CalculatorState {
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
  return `${state.first} ${OPERATION_SYMBOLS[state.operation]}`;
}
