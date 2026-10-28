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
  ])("rejects %s", (_name, first, want) => {
    expect(
      prepareUnaryCalculation("square_root", stateWith({ first })),
    ).toEqual({ ok: false, error: want });
  });

  it.each(["-4", "-0.25"])(
    "leaves the square root of %j to the backend",
    (first) => {
      expect(
        prepareUnaryCalculation("square_root", stateWith({ first })).ok,
      ).toBe(true);
    },
  );

  it.each([
    ["0.30000000000000004", 0.30000000000000004],
    ["1e+21", 1e21],
    ["5e-324", Number.MIN_VALUE],
  ])("sends the previous answer %j as it is", (first, want) => {
    expect(
      prepareUnaryCalculation("square_root", stateWith({ first })),
    ).toMatchObject({ ok: true, payload: { first_input: want } });
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
  ] as const)("rejects %s with %j and %j", (operation, first, second, want) => {
    const state = stateWith({ operation, first, second });

    expect(prepareBinaryAdvancedCalculation(state)).toEqual({
      ok: false,
      error: want,
    });
  });

  it.each([
    ["2", "1.5"],
    ["0", "-1"],
    ["999999999", "999999999"],
  ])("leaves exponentiation of %j by %j to the backend", (first, second) => {
    const state = stateWith({ operation: "exponentiation", first, second });

    expect(prepareBinaryAdvancedCalculation(state).ok).toBe(true);
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
