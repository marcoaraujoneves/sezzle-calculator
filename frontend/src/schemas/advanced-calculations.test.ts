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
    ["123456789", 123456789],
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
      "exponent notation",
      "square_root",
      "1e+21",
      "First input is not a valid number",
    ],
    [
      "ten digits",
      "square_root",
      "1234567890",
      "First input must have at most 9 digits",
    ],
    [
      "a negative number",
      "square_root",
      "-4",
      "Square root of a negative number is not allowed",
    ],
    [
      "a negative decimal",
      "square_root",
      "-0.5",
      "Square root of a negative number is not allowed",
    ],
    [
      "the smallest negative decimal",
      "square_root",
      "-0.00000001",
      "Square root of a negative number is not allowed",
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
    [
      "a ten digit base",
      "exponentiation",
      "1234567890",
      "2",
      "First input must have at most 9 digits",
    ],
    [
      "a ten digit exponent",
      "exponentiation",
      "2",
      "1234567890",
      "Second input must have at most 9 digits",
    ],
    [
      "a decimal exponent",
      "exponentiation",
      "2",
      "1.5",
      "Exponent must be an integer",
    ],
    [
      "a negative decimal exponent",
      "exponentiation",
      "2",
      "-0.5",
      "Exponent must be an integer",
    ],
    [
      "a tiny decimal exponent",
      "exponentiation",
      "2",
      "0.000001",
      "Exponent must be an integer",
    ],
    [
      "an overflowing positive result",
      "exponentiation",
      "999999999",
      "999999999",
      "Result is too large to be represented",
    ],
    [
      "an overflowing negative result",
      "exponentiation",
      "-999999999",
      "999999999",
      "Result is too large to be represented",
    ],
    [
      "the first power past the float limit",
      "exponentiation",
      "10",
      "309",
      "Result is too large to be represented",
    ],
    [
      "two to the 1024th",
      "exponentiation",
      "2",
      "1024",
      "Result is too large to be represented",
    ],
    [
      "zero to a negative power",
      "exponentiation",
      "0",
      "-2",
      "Result is too large to be represented",
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
    ["123456789", "123456789", 123456789, 123456789],
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
      "a ten digit rate",
      "percentage",
      "1234567890",
      "150",
      "First input must have at most 9 digits",
    ],
    [
      "a ten digit base",
      "percentage",
      "20",
      "1234567890",
      "Second input must have at most 9 digits",
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
