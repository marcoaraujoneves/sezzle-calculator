import { describe, expect, it, vi } from "vitest";
import {
  KEY_ID_BY_KEYBOARD_KEY,
  KEY_ID_BY_NUMPAD_CODE,
} from "@/constants/keyboard";
import { KEYS } from "@/constants/keypad";
import type { Calculator } from "@/types/calculator";
import type { KeyboardInput } from "@/types/keyboard";
import { resolveKeyboardAction, resolveKeyboardKey } from "./keyboard";

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

function typed(key: string): KeyboardInput {
  return { key, code: "" };
}

function numpad(code: string, key: string): KeyboardInput {
  return { key, code };
}

describe("keyboard maps", () => {
  it("point every keyboard key and numpad code to a defined keypad key", () => {
    const keyIds = new Set(KEYS.map((key) => key.id));
    const mappedKeyIds = [
      ...Object.values(KEY_ID_BY_KEYBOARD_KEY),
      ...Object.values(KEY_ID_BY_NUMPAD_CODE),
    ];

    expect(mappedKeyIds.every((keyId) => keyIds.has(keyId))).toBe(true);
  });
});

describe("resolveKeyboardKey", () => {
  it.each([
    ["5", "5"],
    [".", "decimal"],
    [",", "decimal"],
    ["+", "add"],
    ["-", "subtract"],
    ["*", "multiply"],
    ["/", "divide"],
    ["^", "power"],
    ["%", "percent"],
    ["Enter", "equals"],
    ["=", "equals"],
    ["Backspace", "backspace"],
    ["Escape", "clear"],
  ])("maps %j to the %s key", (keyboardKey, keyId) => {
    expect(resolveKeyboardKey(typed(keyboardKey))?.id).toBe(keyId);
  });

  it.each([
    ["Numpad0", "0", "0"],
    ["Numpad7", "7", "7"],
    ["Numpad1", "End", "1"],
    ["Numpad2", "ArrowDown", "2"],
    ["Numpad5", "Clear", "5"],
    ["NumpadDecimal", "Delete", "decimal"],
    ["NumpadAdd", "+", "add"],
    ["NumpadSubtract", "-", "subtract"],
    ["NumpadMultiply", "*", "multiply"],
    ["NumpadDivide", "/", "divide"],
    ["NumpadEnter", "Enter", "equals"],
  ])("maps the %s code (key %j) to the %s key", (code, key, keyId) => {
    expect(resolveKeyboardKey(numpad(code, key))?.id).toBe(keyId);
  });

  it.each(["a", "Tab", "F5", "", "constructor", "toString"])(
    "ignores %j",
    (keyboardKey) => {
      expect(
        resolveKeyboardKey({ key: keyboardKey, code: keyboardKey }),
      ).toBeUndefined();
    },
  );
});

describe("resolveKeyboardAction", () => {
  it("types the digit of the pressed key", () => {
    const calculator = createCalculator();

    resolveKeyboardAction(typed("7"), calculator)?.();

    expect(calculator.onDigit).toHaveBeenCalledExactlyOnceWith("7");
  });

  it("types the digit of a numpad key even when NumLock is off", () => {
    const calculator = createCalculator();

    resolveKeyboardAction(numpad("Numpad1", "End"), calculator)?.();

    expect(calculator.onDigit).toHaveBeenCalledExactlyOnceWith("1");
  });

  it("selects the operation of the pressed key", () => {
    const calculator = createCalculator();

    resolveKeyboardAction(typed("/"), calculator)?.();

    expect(calculator.onOperation).toHaveBeenCalledExactlyOnceWith("division");
  });

  it("runs the calculation on Enter", () => {
    const calculator = createCalculator();

    resolveKeyboardAction(typed("Enter"), calculator)?.();

    expect(calculator.onEquals).toHaveBeenCalledOnce();
  });

  it("returns nothing for an unmapped key", () => {
    expect(
      resolveKeyboardAction(typed("a"), createCalculator()),
    ).toBeUndefined();
  });

  it("returns nothing for a digit when digits are blocked", () => {
    const calculator = createCalculator({ digitsDisabled: true });

    expect(resolveKeyboardAction(typed("1"), calculator)).toBeUndefined();
  });

  it("returns nothing for the decimal point when it is blocked", () => {
    const calculator = createCalculator({ decimalDisabled: true });

    expect(resolveKeyboardAction(typed("."), calculator)).toBeUndefined();
  });

  it.each(["1", "+", "Enter", "Backspace", "Escape"])(
    "returns nothing for %j while loading",
    (keyboardKey) => {
      const calculator = createCalculator({ isLoading: true });

      expect(
        resolveKeyboardAction(typed(keyboardKey), calculator),
      ).toBeUndefined();
    },
  );
});
