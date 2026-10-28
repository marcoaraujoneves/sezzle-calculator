import { describe, expect, it } from "vitest";
import { INITIAL_STATE } from "@/constants/calculator";
import type { CalculatorState } from "@/types/calculator";
import {
  isBinaryAdvancedOperation,
  prepareBinaryAdvancedCalculation,
  prepareUnaryCalculation,
} from "./advanced-calculations";

function stateWith(overrides: Partial<CalculatorState>): CalculatorState {
  return { ...INITIAL_STATE, ...overrides };
}

describe("isBinaryAdvancedOperation", () => {
  it.each([
    ["exponentiation", true],
    ["percentage", true],
    ["addition", false],
    ["subtraction", false],
    ["multiplication", false],
    ["division", false],
    [null, false],
  ] as const)("returns %j for %s", (operation, want) => {
    expect(isBinaryAdvancedOperation(operation)).toBe(want);
  });
});

describe("prepareUnaryCalculation", () => {
  it.each([
    ["16", 16],
    ["2.25", 2.25],
    [".25", 0.25],
    ["0", 0],
    ["123456789", 123456789],
  ])("builds the square root payload for %j", (first, want) => {
    expect(
      prepareUnaryCalculation("square_root", stateWith({ first })),
    ).toEqual({
      ok: true,
      payload: { operation: "square_root", first_input: want },
    });
  });

  it("uses the answer of the previous round", () => {
    const state = stateWith({ first: "49", answered: true });

    expect(prepareUnaryCalculation("square_root", state)).toMatchObject({
      ok: true,
      payload: { first_input: 49 },
    });
  });

  it("ignores a pending second input", () => {
    const state = stateWith({
      first: "9",
      second: "abc",
      operation: "addition",
    });

    expect(prepareUnaryCalculation("square_root", state)).toMatchObject({
      ok: true,
      payload: { first_input: 9 },
    });
  });

  it.each([
    ["an empty calculator", "", "First input is required"],
    ["a lone sign", "-", "First input is not a valid number"],
    ["ten digits", "1234567890", "First input must have at most 9 digits"],
    [
      "a negative number",
      "-4",
      "Square root of a negative number is not allowed",
    ],
    [
      "a negative decimal",
      "-0.25",
      "Square root of a negative number is not allowed",
    ],
  ])("rejects %s", (_name, first, want) => {
    expect(
      prepareUnaryCalculation("square_root", stateWith({ first })),
    ).toEqual({ ok: false, error: want });
  });
});

describe("prepareBinaryAdvancedCalculation", () => {
  it.each([
    ["percentage", "20", "150", 20, 150],
    ["percentage", "12.5", "-80", 12.5, -80],
    ["exponentiation", "2", "10", 2, 10],
    ["exponentiation", "-3", "3", -3, 3],
    ["exponentiation", "2", "-2", 2, -2],
  ] as const)(
    "builds the %s payload for %j and %j",
    (operation, first, second, wantFirst, wantSecond) => {
      const state = stateWith({ operation, first, second });

      expect(prepareBinaryAdvancedCalculation(state)).toEqual({
        ok: true,
        payload: {
          operation,
          first_input: wantFirst,
          second_input: wantSecond,
        },
      });
    },
  );

  it.each([
    ["percentage", "", "150", "First input is required"],
    ["percentage", "20", "", "Second input is required"],
    ["exponentiation", "2", "", "Second input is required"],
    ["exponentiation", "2", "1.5", "Exponent must be an integer"],
    ["exponentiation", "0", "-1", "Result is too large to be represented"],
    [
      "exponentiation",
      "999999999",
      "999999999",
      "Result is too large to be represented",
    ],
  ] as const)("rejects %s with %j and %j", (operation, first, second, want) => {
    const state = stateWith({ operation, first, second });

    expect(prepareBinaryAdvancedCalculation(state)).toEqual({
      ok: false,
      error: want,
    });
  });

  it("applies percentage rules to percentage only", () => {
    const state = stateWith({
      operation: "percentage",
      first: "2",
      second: "1.5",
    });

    expect(prepareBinaryAdvancedCalculation(state).ok).toBe(true);
  });

  it("asks for an operation when a basic one is selected", () => {
    const state = stateWith({
      operation: "addition",
      first: "1",
      second: "2",
    });

    expect(prepareBinaryAdvancedCalculation(state)).toEqual({
      ok: false,
      error: "Select an operation",
    });
  });
});
