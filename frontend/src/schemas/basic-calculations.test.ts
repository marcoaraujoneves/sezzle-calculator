import { describe, expect, it } from "vitest";
import { validateBasicCalculation } from "./basic-calculations";

describe("validateBasicCalculation", () => {
  it.each([
    ["addition", "12.5", "3", 12.5, 3],
    ["subtraction", "5", "7", 5, 7],
    ["multiplication", "-4", "2.5", -4, 2.5],
    ["division", "1", "3", 1, 3],
  ])("accepts %s", (operation, first, second, wantFirst, wantSecond) => {
    expect(
      validateBasicCalculation({
        operation,
        first_input: first,
        second_input: second,
      }),
    ).toEqual({
      ok: true,
      payload: {
        operation,
        first_input: wantFirst,
        second_input: wantSecond,
      },
    });
  });

  it.each([
    ["a negative number", "-5", -5],
    ["a leading decimal point", ".5", 0.5],
    ["a trailing decimal point", "5.", 5],
    ["nine digits", "123456789", 123456789],
    ["nine digits with decimals", "1.23456789", 1.23456789],
    ["a negative decimal", "-12345678.9", -12345678.9],
  ])("converts %s into a number", (_name, input, want) => {
    const result = validateBasicCalculation({
      operation: "subtraction",
      first_input: input,
      second_input: "1",
    });

    expect(result).toMatchObject({ ok: true, payload: { first_input: want } });
  });

  it.each([
    ["no operation", null, "1", "2", "Select an operation"],
    ["an unknown operation", "power", "1", "2", "Select an operation"],
    ["an advanced operation", "square_root", "1", "2", "Select an operation"],
    ["an empty first input", "addition", "", "2", "First input is required"],
    ["an empty second input", "addition", "1", "", "Second input is required"],
    [
      "a lone decimal point",
      "addition",
      ".",
      "2",
      "First input is not a valid number",
    ],
    ["a lone sign", "addition", "1", "-", "Second input is not a valid number"],
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
      "ten digits with a decimal point",
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
    [
      "division by negative zero",
      "division",
      "1",
      "-0",
      "Division by zero is not allowed",
    ],
    [
      "division by a bare decimal zero",
      "division",
      "1",
      "0.",
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

  it("reports the first input before the second one", () => {
    expect(
      validateBasicCalculation({
        operation: "addition",
        first_input: "",
        second_input: "",
      }),
    ).toEqual({ ok: false, error: "First input is required" });
  });

  it.each([
    ["division", "0", "5"],
    ["multiplication", "5", "0"],
    ["addition", "0", "0"],
    ["subtraction", "0", "0"],
    ["division", "1", "0.000001"],
  ])("allows zero in %s of %j and %j", (operation, first, second) => {
    expect(
      validateBasicCalculation({
        operation,
        first_input: first,
        second_input: second,
      }).ok,
    ).toBe(true);
  });
});
