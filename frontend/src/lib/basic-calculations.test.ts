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
      error: "Select an operation first.",
    });
  });

  it.each([
    ["an empty first input", "", "2", "Enter the first number."],
    ["an empty second input", "1", "", "Enter the second number."],
    ["a lone sign", "1", "-", "Enter a valid second number."],
    ["a lone decimal point", ".", "2", "Enter a valid first number."],
  ])("reports %s", (_name, first, second, want) => {
    const state = stateWith({ operation: "addition", first, second });

    expect(prepareBasicCalculation(state)).toEqual({ ok: false, error: want });
  });

  it.each(["0", "0.", "0.00", "-0"])(
    "leaves dividing by %j to the backend",
    (second) => {
      const state = stateWith({ operation: "division", first: "1", second });

      expect(prepareBasicCalculation(state).ok).toBe(true);
    },
  );

  it.each([
    ["0.30000000000000004", 0.30000000000000004],
    ["999999998000000000", 999999998000000000],
    ["1e+21", 1e21],
    ["-1.7976931348623157e+308", -Number.MAX_VALUE],
    ["5e-324", Number.MIN_VALUE],
  ])("sends the previous answer %j as it is", (first, want) => {
    const state = stateWith({ operation: "addition", first, second: "1" });

    expect(prepareBasicCalculation(state)).toMatchObject({
      ok: true,
      payload: { first_input: want },
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
      error: "Select an operation first.",
    });
  });
});
