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
    ["fifteen digits", "123456789012345", 123456789012345],
    ["fifteen digits with decimals", "1.23456789012345", 1.23456789012345],
    ["a negative decimal", "-12345678.9", -12345678.9],
    ["an answer with seventeen digits", "0.30000000000000004", 0.1 + 0.2],
    [
      "an answer with eighteen digits",
      "999999998000000000",
      999999998000000000,
    ],
    ["a large exponent answer", "1e+21", 1e21],
    ["a negative large answer", "-1.7976931348623157e+308", -Number.MAX_VALUE],
    ["a tiny exponent answer", "1e-7", 1e-7],
    ["the smallest positive answer", "5e-324", Number.MIN_VALUE],
  ])("converts %s into a number", (_name, input, want) => {
    const result = validateBasicCalculation({
      operation: "subtraction",
      first_input: input,
      second_input: "1",
    });

    expect(result).toMatchObject({ ok: true, payload: { first_input: want } });
  });

  it.each([
    ["no operation", null, "1", "2", "Select an operation first."],
    ["an unknown operation", "power", "1", "2", "Select an operation first."],
    [
      "an advanced operation",
      "square_root",
      "1",
      "2",
      "Select an operation first.",
    ],
    ["an empty first input", "addition", "", "2", "Enter the first number."],
    ["an empty second input", "addition", "1", "", "Enter the second number."],
    [
      "a lone decimal point",
      "addition",
      ".",
      "2",
      "Enter a valid first number.",
    ],
    ["a lone sign", "addition", "1", "-", "Enter a valid second number."],
    [
      "an exponent without digits",
      "addition",
      "1e",
      "2",
      "Enter a valid first number.",
    ],
    [
      "an exponent without a mantissa",
      "addition",
      "1",
      "e+5",
      "Enter a valid second number.",
    ],
    [
      "a decimal exponent",
      "addition",
      "1e2.5",
      "2",
      "Enter a valid first number.",
    ],
    [
      "a capital exponent marker",
      "addition",
      "1E5",
      "2",
      "Enter a valid first number.",
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
    ).toEqual({ ok: false, error: "Enter the first number." });
  });

  it.each([
    ["division", "0", "5"],
    ["multiplication", "5", "0"],
    ["addition", "0", "0"],
    ["subtraction", "0", "0"],
    ["division", "1", "0.000001"],
    ["division", "1", "0"],
    ["division", "1", "0.0"],
    ["division", "1", "-0"],
    ["division", "1", "0."],
  ])(
    "leaves zero in %s of %j and %j to the backend",
    (operation, first, second) => {
      expect(
        validateBasicCalculation({
          operation,
          first_input: first,
          second_input: second,
        }).ok,
      ).toBe(true);
    },
  );
});
