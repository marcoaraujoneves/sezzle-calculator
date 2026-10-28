import { useState } from "react";
import { toast } from "sonner";
import {
  INITIAL_STATE,
  activeInput,
  answerState,
  appendDecimal,
  appendDigit,
  canAppendDecimal,
  canAppendDigit,
  formatExpression,
  removeLastDigit,
  selectOperation,
  toggleSign,
  type AdvancedOperation,
  type Operation,
} from "@/lib/calculator";
import { errorMessage } from "@/lib/errors";
import {
  validateAdvancedCalculation,
  validateBasicCalculation,
} from "@/lib/schemas";
import { calculateAdvanced } from "@/services/advanced-calculations";
import { calculate } from "@/services/basic-calculations";

export interface Calculator {
  expression: string;
  value: string;
  digitsDisabled: boolean;
  decimalDisabled: boolean;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onToggleSign: () => void;
  onOperation: (operation: Operation) => void;
  onAdvancedOperation: (operation: AdvancedOperation) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
}

export function useCalculator(): Calculator {
  const [state, setState] = useState(INITIAL_STATE);

  async function onAdvancedOperation(operation: AdvancedOperation) {
    const validation = validateAdvancedCalculation({
      operation,
      first_input: state.first,
    });
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    try {
      setState(answerState(await calculateAdvanced(validation.payload)));
    } catch (error: unknown) {
      toast.error(errorMessage(error));
      setState(INITIAL_STATE);
    }
  }

  async function onEquals() {
    const validation = validateBasicCalculation({
      operation: state.operation,
      first_input: state.first,
      second_input: state.second,
    });
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    try {
      setState(answerState(await calculate(validation.payload)));
    } catch (error: unknown) {
      toast.error(errorMessage(error));
      setState(INITIAL_STATE);
    }
  }

  return {
    expression: formatExpression(state),
    value: activeInput(state) || "0",
    digitsDisabled: !canAppendDigit(state),
    decimalDisabled: !canAppendDecimal(state),
    onDigit: (digit) => setState((current) => appendDigit(current, digit)),
    onDecimal: () => setState(appendDecimal),
    onToggleSign: () => setState(toggleSign),
    onOperation: (operation) =>
      setState((current) => selectOperation(current, operation)),
    onAdvancedOperation: (operation) => void onAdvancedOperation(operation),
    onEquals: () => void onEquals(),
    onClear: () => setState(INITIAL_STATE),
    onBackspace: () => setState(removeLastDigit),
  };
}
