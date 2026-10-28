import { describe, expect, it } from "vitest";
import {
  validateAdvancedCalculation,
  validateExponentiation,
  validatePercentage,
} from "./advanced-calculations";

describe("validateAdvancedCalculation", () => {
  it.each([
    ["16", 16],
    ["2.25", 2.25],
    [".25", 0.25],
    ["0.0001", 0.0001],
    ["0", 0],
    ["-0", -0],
    ["123456789012345", 123456789012345],
    ["0.30000000000000004", 0.1 + 0.2],
    ["1e+21", 1e21],
    ["5e-324", Number.MIN_VALUE],
    ["-4", -4],
    ["-0.00000001", -0.00000001],
  ])("accepts the square root of %j", (input, want) => {
    expect(
      validateAdvancedCalculation({
        operation: "square_root",
        first_input: input,
      }),
    ).toEqual({
      ok: true,
      payload: { operation: "square_root", first_input: want },
    });
  });

  it.each([
    ["no operation", null, "4", "Select an operation"],
    ["a basic operation", "addition", "4", "Select an operation"],
    ["a binary advanced operation", "percentage", "4", "Select an operation"],
    ["an empty input", "square_root", "", "First input is required"],
    [
      "a lone decimal point",
      "square_root",
      ".",
      "First input is not a valid number",
    ],
    ["a lone sign", "square_root", "-", "First input is not a valid number"],
    [
      "an exponent without digits",
      "square_root",
      "1e+",
      "First input is not a valid number",
    ],
  ])("rejects %s", (_name, operation, first, want) => {
    expect(
      validateAdvancedCalculation({ operation, first_input: first }),
    ).toEqual({ ok: false, error: want });
  });
});

describe("validateExponentiation", () => {
  it.each([
    ["2", "10", 2, 10],
    ["-3", "2", -3, 2],
    ["-2", "3", -2, 3],
    ["2.5", "2", 2.5, 2],
    ["2", "-2", 2, -2],
    ["7", "0", 7, 0],
    ["0", "0", 0, 0],
    ["0", "5", 0, 5],
    ["1", "999999999", 1, 999999999],
    ["5", "2.", 5, 2],
    ["5", "2.0", 5, 2],
    ["10", "308", 10, 308],
    ["2", "1023", 2, 1023],
    ["2", "1.5", 2, 1.5],
    ["0", "-2", 0, -2],
    ["999999999", "999999999", 999999999, 999999999],
    ["10", "309", 10, 309],
    ["1e+21", "2", 1e21, 2],
  ])("accepts %j to the power %j", (first, second, wantFirst, wantSecond) => {
    expect(
      validateExponentiation({
        operation: "exponentiation",
        first_input: first,
        second_input: second,
      }),
    ).toEqual({
      ok: true,
      payload: {
        operation: "exponentiation",
        first_input: wantFirst,
        second_input: wantSecond,
      },
    });
  });

  it.each([
    ["no operation", null, "2", "3", "Select an operation"],
    ["another operation", "addition", "2", "3", "Select an operation"],
    ["an empty base", "exponentiation", "", "3", "First input is required"],
    [
      "an empty exponent",
      "exponentiation",
      "2",
      "",
      "Second input is required",
    ],
    [
      "a lone sign as exponent",
      "exponentiation",
      "2",
      "-",
      "Second input is not a valid number",
    ],
  ])("rejects %s", (_name, operation, first, second, want) => {
    expect(
      validateExponentiation({
        operation,
        first_input: first,
        second_input: second,
      }),
    ).toEqual({ ok: false, error: want });
  });
});

describe("validatePercentage", () => {
  it.each([
    ["20", "150", 20, 150],
    ["12.5", "80", 12.5, 80],
    ["33.333333", "3", 33.333333, 3],
    ["-10", "80", -10, 80],
    ["150", "-2", 150, -2],
    ["-5", "-5", -5, -5],
    ["0", "0", 0, 0],
    ["0.5", ".5", 0.5, 0.5],
    ["5", "2.", 5, 2],
    ["123456789012345", "123456789012345", 123456789012345, 123456789012345],
    ["0.30000000000000004", "1e+21", 0.1 + 0.2, 1e21],
  ])("accepts %j percent of %j", (first, second, wantFirst, wantSecond) => {
    expect(
      validatePercentage({
        operation: "percentage",
        first_input: first,
        second_input: second,
      }),
    ).toEqual({
      ok: true,
      payload: {
        operation: "percentage",
        first_input: wantFirst,
        second_input: wantSecond,
      },
    });
  });

  it.each([
    ["no operation", null, "20", "150", "Select an operation"],
    ["another operation", "addition", "20", "150", "Select an operation"],
    ["exponentiation", "exponentiation", "20", "150", "Select an operation"],
    ["an empty rate", "percentage", "", "150", "First input is required"],
    ["an empty base", "percentage", "20", "", "Second input is required"],
    [
      "a lone decimal point as base",
      "percentage",
      "20",
      ".",
      "Second input is not a valid number",
    ],
    [
      "a lone sign as rate",
      "percentage",
      "-",
      "150",
      "First input is not a valid number",
    ],
    [
      "an exponent without digits as base",
      "percentage",
      "20",
      "1e",
      "Second input is not a valid number",
    ],
  ])("rejects %s", (_name, operation, first, second, want) => {
    expect(
      validatePercentage({
        operation,
        first_input: first,
        second_input: second,
      }),
    ).toEqual({ ok: false, error: want });
  });
});
