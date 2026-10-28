import { describe, expect, it } from "vitest";
import { INITIAL_STATE } from "@/constants/calculator";
import type { CalculatorState } from "@/types/calculator";
import { prepareBasicCalculation } from "./basic-calculations";

function stateWith(overrides: Partial<CalculatorState>): CalculatorState {
  return { ...INITIAL_STATE, ...overrides };
}

describe("prepareBasicCalculation", () => {
  it.each([
    ["addition", "12.5", "3", 12.5, 3],
    ["subtraction", "5", "-7", 5, -7],
    ["multiplication", ".5", "4.", 0.5, 4],
    ["division", "-9", "3", -9, 3],
  ] as const)(
    "builds the %s payload with numeric operands",
    (operation, first, second, wantFirst, wantSecond) => {
      const state = stateWith({ operation, first, second });

      expect(prepareBasicCalculation(state)).toEqual({
        ok: true,
        payload: {
          operation,
          first_input: wantFirst,
          second_input: wantSecond,
        },
      });
    },
  );

  it("accepts an answer in the first input", () => {
    const state = stateWith({
      operation: "addition",
      first: "-2.5",
      second: "1",
      answered: false,
    });

    expect(prepareBasicCalculation(state)).toMatchObject({
      ok: true,
      payload: { first_input: -2.5 },
    });
  });

  it("asks for an operation when none is selected", () => {
    const state = stateWith({ first: "5", second: "" });

    expect(prepareBasicCalculation(state)).toEqual({
      ok: false,
      error: "Select an operation",
    });
  });

  it.each([
    ["an empty first input", "", "2", "First input is required"],
    ["an empty second input", "1", "", "Second input is required"],
    ["a lone sign", "1", "-", "Second input is not a valid number"],
    [
      "a first input over the digit limit",
      "1234567890",
      "1",
      "First input must have at most 9 digits",
    ],
  ])("reports %s", (_name, first, second, want) => {
    const state = stateWith({ operation: "addition", first, second });

    expect(prepareBasicCalculation(state)).toEqual({ ok: false, error: want });
  });

  it.each(["0", "0.", "0.00", "-0"])("rejects dividing by %j", (second) => {
    const state = stateWith({ operation: "division", first: "1", second });

    expect(prepareBasicCalculation(state)).toEqual({
      ok: false,
      error: "Division by zero is not allowed",
    });
  });

  it("does not validate advanced operations as basic ones", () => {
    const state = stateWith({
      operation: "percentage",
      first: "20",
      second: "150",
    });

    expect(prepareBasicCalculation(state)).toEqual({
      ok: false,
      error: "Select an operation",
    });
  });
});
