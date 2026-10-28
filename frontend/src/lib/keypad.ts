import {
  ADVANCED_OPERATION_BY_KEY,
  DIGIT_KEY_PATTERN,
  KEY_ID,
  OPERATION_BY_KEY,
} from "@/constants/keypad";
import type { Calculator } from "@/types/calculator";
import type { KeyDefinition } from "@/types/keypad";

export function isDigitKey(key: KeyDefinition): boolean {
  return DIGIT_KEY_PATTERN.test(key.id);
}

export function isKeyDisabled(
  key: KeyDefinition,
  calculator: Calculator,
): boolean {
  if (calculator.isLoading) {
    return true;
  }

  if (isDigitKey(key)) {
    return calculator.digitsDisabled;
  }

  return key.id === KEY_ID.decimal && calculator.decimalDisabled;
}

export function resolveKeyAction(
  key: KeyDefinition,
  calculator: Calculator,
): (() => void) | undefined {
  const operation = OPERATION_BY_KEY[key.id];
  const advancedOperation = ADVANCED_OPERATION_BY_KEY[key.id];

  if (isDigitKey(key)) {
    return () => calculator.onDigit(key.id);
  }

  if (operation) {
    return () => calculator.onOperation(operation);
  }

  if (advancedOperation) {
    return () => calculator.onAdvancedOperation(advancedOperation);
  }

  const actionByKeyId: Partial<Record<string, () => void>> = {
    [KEY_ID.decimal]: calculator.onDecimal,
    [KEY_ID.sign]: calculator.onToggleSign,
    [KEY_ID.clear]: calculator.onClear,
    [KEY_ID.backspace]: calculator.onBackspace,
    [KEY_ID.equals]: calculator.onEquals,
  };

  return actionByKeyId[key.id];
}
