import { INITIAL_STATE, MAX_DIGITS } from "@/constants/calculator";
import { countDigits } from "@/lib/digits";
import type { CalculatorState } from "@/types/calculator";
import type { SelectableOperation } from "@/types/operations";
import type { BinaryCalculationInput } from "@/types/validation";

export function answerState(result: number): CalculatorState {
  return { ...INITIAL_STATE, first: String(result), answered: true };
}

// Typing after an answer starts a new round instead of extending the answer.
function resolveEditableState(state: CalculatorState): CalculatorState {
  return state.answered ? INITIAL_STATE : state;
}

export function activeInput(state: CalculatorState): string {
  return state.operation === null ? state.first : state.second;
}

function withActiveInput(
  state: CalculatorState,
  value: string,
): CalculatorState {
  if (state.operation === null) {
    return { ...state, first: value };
  }

  return { ...state, second: value };
}

export function toCalculationInput(
  state: CalculatorState,
): BinaryCalculationInput {
  return {
    operation: state.operation,
    first_input: state.first,
    second_input: state.second,
  };
}

export function canAppendDigit(state: CalculatorState): boolean {
  const currentInput = activeInput(resolveEditableState(state));

  return countDigits(currentInput) < MAX_DIGITS;
}

export function canAppendDecimal(state: CalculatorState): boolean {
  const currentInput = activeInput(resolveEditableState(state));

  return !currentInput.includes(".");
}

export function appendDigit(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  if (!canAppendDigit(state)) {
    return state;
  }

  const editableState = resolveEditableState(state);
  const currentInput = activeInput(editableState);

  return withActiveInput(editableState, currentInput + digit);
}

export function appendDecimal(state: CalculatorState): CalculatorState {
  if (!canAppendDecimal(state)) {
    return state;
  }

  const editableState = resolveEditableState(state);
  const currentInput = activeInput(editableState);

  return withActiveInput(editableState, `${currentInput}.`);
}

// Flips the active input in place, answer included, so a result can be negated and reused.
export function toggleSign(state: CalculatorState): CalculatorState {
  const currentInput = activeInput(state);

  const isNegative = currentInput.startsWith("-");
  const toggledInput = isNegative ? currentInput.slice(1) : `-${currentInput}`;

  return withActiveInput(state, toggledInput);
}

export function selectOperation(
  state: CalculatorState,
  operation: SelectableOperation,
): CalculatorState {
  const isSubtraction = operation === "subtraction";
  const isCalculatorEmpty =
    state.operation === null && state.first === "" && !state.answered;
  const isAwaitingSecondInput = state.operation !== null && state.second === "";

  // Minus on an empty calculator is a sign, since "0 − n" is never what typing "-n" means.
  if (isSubtraction && isCalculatorEmpty) {
    return { ...state, first: "-" };
  }

  // Likewise, minus right after an operator signs the second input instead of replacing the operator.
  if (isSubtraction && isAwaitingSecondInput) {
    return { ...state, second: "-" };
  }

  // The display already shows 0 while nothing is typed, so the first input must be 0 too.
  return { ...state, first: state.first || "0", operation, answered: false };
}

export function removeLastDigit(state: CalculatorState): CalculatorState {
  if (state.answered) {
    return INITIAL_STATE;
  }

  if (state.operation !== null && state.second === "") {
    return { ...state, operation: null };
  }

  return withActiveInput(state, activeInput(state).slice(0, -1));
}
