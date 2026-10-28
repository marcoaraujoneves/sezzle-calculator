import type {
  AdvancedOperation,
  SelectableOperation,
} from "@/types/operations";
import type { KeyDefinition } from "@/types/keypad";

export const DIGIT_KEY_PATTERN = /^\d$/;

export const KEY_ID = {
  clear: "clear",
  backspace: "backspace",
  decimal: "decimal",
  sign: "sign",
  equals: "equals",
} as const;

export const OPERATION_BY_KEY: Partial<Record<string, SelectableOperation>> = {
  add: "addition",
  subtract: "subtraction",
  multiply: "multiplication",
  divide: "division",
  power: "exponentiation",
  percent: "percentage",
};

export const ADVANCED_OPERATION_BY_KEY: Partial<
  Record<string, AdvancedOperation>
> = {
  sqrt: "square_root",
};

export const KEYS: readonly KeyDefinition[] = [
  { id: KEY_ID.clear, label: "C", ariaLabel: "Clear", variant: "function" },
  {
    id: KEY_ID.backspace,
    label: "⌫",
    ariaLabel: "Backspace",
    variant: "function",
  },
  { id: "sqrt", label: "√", ariaLabel: "Square root", variant: "function" },
  { id: "divide", label: "÷", ariaLabel: "Divide", variant: "operator" },

  { id: "7", label: "7", ariaLabel: "7", variant: "digit" },
  { id: "8", label: "8", ariaLabel: "8", variant: "digit" },
  { id: "9", label: "9", ariaLabel: "9", variant: "digit" },
  { id: "multiply", label: "×", ariaLabel: "Multiply", variant: "operator" },

  { id: "4", label: "4", ariaLabel: "4", variant: "digit" },
  { id: "5", label: "5", ariaLabel: "5", variant: "digit" },
  { id: "6", label: "6", ariaLabel: "6", variant: "digit" },
  { id: "subtract", label: "−", ariaLabel: "Subtract", variant: "operator" },

  { id: "1", label: "1", ariaLabel: "1", variant: "digit" },
  { id: "2", label: "2", ariaLabel: "2", variant: "digit" },
  { id: "3", label: "3", ariaLabel: "3", variant: "digit" },
  { id: "add", label: "+", ariaLabel: "Add", variant: "operator" },

  { id: "percent", label: "%", ariaLabel: "Percent", variant: "function" },
  { id: "0", label: "0", ariaLabel: "0", variant: "digit" },
  {
    id: KEY_ID.decimal,
    label: ".",
    ariaLabel: "Decimal point",
    variant: "digit",
  },
  { id: "power", label: "xʸ", ariaLabel: "Power", variant: "operator" },

  {
    id: KEY_ID.sign,
    label: "±",
    ariaLabel: "Toggle sign",
    variant: "function",
  },
  {
    id: KEY_ID.equals,
    label: "=",
    ariaLabel: "Equals",
    variant: "equals",
    wide: true,
  },
];
