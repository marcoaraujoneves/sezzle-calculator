import { describe, expect, it, vi } from "vitest";
import { KEYS } from "@/constants/keypad";
import type { Calculator } from "@/types/calculator";
import type { KeyDefinition } from "@/types/keypad";
import { isDigitKey, isKeyDisabled, resolveKeyAction } from "./keypad";

function createCalculator(overrides: Partial<Calculator> = {}): Calculator {
  return {
    expression: "",
    value: "0",
    isLoading: false,
    digitsDisabled: false,
    decimalDisabled: false,
    onDigit: vi.fn(),
    onDecimal: vi.fn(),
    onToggleSign: vi.fn(),
    onOperation: vi.fn(),
    onAdvancedOperation: vi.fn(),
    onEquals: vi.fn(),
    onClear: vi.fn(),
    onBackspace: vi.fn(),
    ...overrides,
  };
}

function keyById(id: string): KeyDefinition {
  const key = KEYS.find((candidate) => candidate.id === id);

  if (!key) {
    throw new Error(`unknown key ${id}`);
  }

  return key;
}

describe("isDigitKey", () => {
  it.each(["0", "5", "9"])("recognizes %j as a digit", (id) => {
    expect(isDigitKey(keyById(id))).toBe(true);
  });

  it.each(["decimal", "add", "equals", "sqrt"])(
    "does not recognize %j as a digit",
    (id) => {
      expect(isDigitKey(keyById(id))).toBe(false);
    },
  );

  it("does not accept multi-character ids", () => {
    const key: KeyDefinition = {
      id: "12",
      label: "12",
      ariaLabel: "12",
      variant: "digit",
    };

    expect(isDigitKey(key)).toBe(false);
  });
});

describe("isKeyDisabled", () => {
  it("disables every digit when digits are blocked", () => {
    const calculator = createCalculator({ digitsDisabled: true });
    const digitKeys = KEYS.filter(isDigitKey);

    expect(digitKeys).toHaveLength(10);
    expect(digitKeys.every((key) => isKeyDisabled(key, calculator))).toBe(true);
  });

  it("disables the decimal key only when the decimal is blocked", () => {
    const decimal = keyById("decimal");

    expect(
      isKeyDisabled(decimal, createCalculator({ decimalDisabled: true })),
    ).toBe(true);
    expect(isKeyDisabled(decimal, createCalculator())).toBe(false);
  });

  it("disables every key while a calculation is loading", () => {
    const calculator = createCalculator({ isLoading: true });

    expect(KEYS.every((key) => isKeyDisabled(key, calculator))).toBe(true);
  });

  it("keeps the decimal enabled when only digits are blocked", () => {
    const calculator = createCalculator({ digitsDisabled: true });

    expect(isKeyDisabled(keyById("decimal"), calculator)).toBe(false);
  });

  it.each(["clear", "backspace", "add", "sqrt", "equals", "sign", "percent"])(
    "never disables %j",
    (id) => {
      const calculator = createCalculator({
        digitsDisabled: true,
        decimalDisabled: true,
      });

      expect(isKeyDisabled(keyById(id), calculator)).toBe(false);
    },
  );
});

describe("resolveKeyAction", () => {
  it("sends the digit of the pressed key", () => {
    const calculator = createCalculator();

    resolveKeyAction(keyById("7"), calculator)?.();

    expect(calculator.onDigit).toHaveBeenCalledExactlyOnceWith("7");
  });

  it.each([
    ["add", "addition"],
    ["subtract", "subtraction"],
    ["multiply", "multiplication"],
    ["divide", "division"],
    ["power", "exponentiation"],
    ["percent", "percentage"],
  ])("selects the operation of the %s key", (id, operation) => {
    const calculator = createCalculator();

    resolveKeyAction(keyById(id), calculator)?.();

    expect(calculator.onOperation).toHaveBeenCalledExactlyOnceWith(operation);
  });

  it("runs the advanced operation of the square root key", () => {
    const calculator = createCalculator();

    resolveKeyAction(keyById("sqrt"), calculator)?.();

    expect(calculator.onAdvancedOperation).toHaveBeenCalledExactlyOnceWith(
      "square_root",
    );
    expect(calculator.onOperation).not.toHaveBeenCalled();
  });

  it.each([
    ["decimal", "onDecimal"],
    ["sign", "onToggleSign"],
    ["clear", "onClear"],
    ["backspace", "onBackspace"],
    ["equals", "onEquals"],
  ] as const)("wires the %s key to %s", (id, handler) => {
    const calculator = createCalculator();

    resolveKeyAction(keyById(id), calculator)?.();

    expect(calculator[handler]).toHaveBeenCalledOnce();
  });

  it("returns nothing for an unknown key", () => {
    const key: KeyDefinition = {
      id: "unknown",
      label: "?",
      ariaLabel: "Unknown",
      variant: "function",
    };

    expect(resolveKeyAction(key, createCalculator())).toBeUndefined();
  });

  it("gives every defined key an action", () => {
    const calculator = createCalculator();

    expect(KEYS.every((key) => resolveKeyAction(key, calculator))).toBe(true);
  });
});
