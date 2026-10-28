import { describe, expect, it } from "vitest";
import { validateBasicCalculation } from "./schemas";

describe("validateBasicCalculation", () => {
  it("returns the payload with numeric operands", () => {
    expect(
      validateBasicCalculation({
        operation: "addition",
        first_input: "12.5",
        second_input: "3",
      }),
    ).toEqual({
      ok: true,
      payload: { operation: "addition", first_input: 12.5, second_input: 3 },
    });
  });

  it.each([
    ["-5", -5],
    [".5", 0.5],
    ["5.", 5],
    ["123456789", 123456789],
    ["1.23456789", 1.23456789],
    ["-12345678.9", -12345678.9],
  ])("accepts %j", (input, want) => {
    const result = validateBasicCalculation({
      operation: "subtraction",
      first_input: input,
      second_input: "1",
    });
    expect(result).toMatchObject({ ok: true, payload: { first_input: want } });
  });

  it.each([
    ["no operation", null, "1", "2", "Select an operation"],
    ["unknown operation", "power", "1", "2", "Select an operation"],
    ["empty first input", "addition", "", "2", "First input is required"],
    ["empty second input", "addition", "1", "", "Second input is required"],
    [
      "lone decimal point",
      "addition",
      ".",
      "2",
      "First input is not a valid number",
    ],
    [
      "exponent notation",
      "addition",
      "1e+21",
      "2",
      "First input is not a valid number",
    ],
    [
      "ten digits",
      "addition",
      "1",
      "1234567890",
      "Second input must have at most 9 digits",
    ],
    [
      "ten digits with decimal",
      "addition",
      "1234567.890",
      "1",
      "First input must have at most 9 digits",
    ],
    [
      "division by zero",
      "division",
      "1",
      "0",
      "Division by zero is not allowed",
    ],
    [
      "division by 0.0",
      "division",
      "1",
      "0.0",
      "Division by zero is not allowed",
    ],
  ])("rejects %s", (_name, operation, first, second, want) => {
    expect(
      validateBasicCalculation({
        operation,
        first_input: first,
        second_input: second,
      }),
    ).toEqual({ ok: false, error: want });
  });

  it("allows zero as a dividend and as an operand of other operations", () => {
    expect(
      validateBasicCalculation({
        operation: "division",
        first_input: "0",
        second_input: "5",
      }).ok,
    ).toBe(true);
    expect(
      validateBasicCalculation({
        operation: "multiplication",
        first_input: "5",
        second_input: "0",
      }).ok,
    ).toBe(true);
  });
});
