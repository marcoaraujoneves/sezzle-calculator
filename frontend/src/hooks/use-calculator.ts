import { useState } from "react";
import { toast } from "sonner";
import { INITIAL_STATE } from "@/constants/calculator";
import {
  isBinaryAdvancedOperation,
  prepareBinaryAdvancedCalculation,
  prepareUnaryCalculation,
} from "@/lib/advanced-calculations";
import { prepareBasicCalculation } from "@/lib/basic-calculations";
import {
  activeInput,
  answerState,
  appendDecimal,
  appendDigit,
  canAppendDecimal,
  canAppendDigit,
  removeLastDigit,
  selectOperation,
  toggleSign,
} from "@/lib/calculator";
import { friendlyErrorMessage } from "@/lib/errors";
import { formatExpression, formatNumber } from "@/lib/formatting";
import { calculateAdvanced } from "@/services/advanced-calculations";
import { calculate } from "@/services/basic-calculations";
import type { Calculator } from "@/types/calculator";
import type { AdvancedOperation } from "@/types/operations";
import type { ValidationResult } from "@/types/validation";

export function useCalculator(): Calculator {
  const [state, setState] = useState(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  async function runRequest(request: () => Promise<number>) {
    setIsLoading(true);

    try {
      const result = await request();

      setState(answerState(result));
    } catch (error: unknown) {
      toast.error(friendlyErrorMessage(error));
      setState(INITIAL_STATE);
    } finally {
      setIsLoading(false);
    }
  }

  async function submit<Payload>(
    validation: ValidationResult<Payload>,
    send: (payload: Payload) => Promise<number>,
  ) {
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    await runRequest(() => send(validation.payload));
  }

  async function runAdvancedOperation(operation: AdvancedOperation) {
    const validation = prepareUnaryCalculation(operation, state);

    await submit(validation, calculateAdvanced);
  }

  async function runEquals() {
    if (isBinaryAdvancedOperation(state.operation)) {
      const validation = prepareBinaryAdvancedCalculation(state);

      await submit(validation, calculateAdvanced);

      return;
    }

    const validation = prepareBasicCalculation(state);

    await submit(validation, calculate);
  }

  return {
    expression: formatExpression(state),
    value: formatNumber(activeInput(state)) || "0",
    isLoading,
    digitsDisabled: !canAppendDigit(state),
    decimalDisabled: !canAppendDecimal(state),
    onDigit: (digit) => setState((current) => appendDigit(current, digit)),
    onDecimal: () => setState(appendDecimal),
    onToggleSign: () => setState(toggleSign),
    onOperation: (operation) =>
      setState((current) => selectOperation(current, operation)),
    onAdvancedOperation: (operation) => void runAdvancedOperation(operation),
    onEquals: () => void runEquals(),
    onClear: () => setState(INITIAL_STATE),
    onBackspace: () => setState(removeLastDigit),
  };
}
