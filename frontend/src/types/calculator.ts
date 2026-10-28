import type {
  AdvancedOperation,
  SelectableOperation,
} from "@/types/operations";

export interface CalculatorState {
  first: string;
  second: string;
  operation: SelectableOperation | null;
  // The first input holds a previous answer, which only an operation may reuse.
  answered: boolean;
}

export interface Calculator {
  expression: string;
  value: string;
  isLoading: boolean;
  digitsDisabled: boolean;
  decimalDisabled: boolean;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onToggleSign: () => void;
  onOperation: (operation: SelectableOperation) => void;
  onAdvancedOperation: (operation: AdvancedOperation) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
}
