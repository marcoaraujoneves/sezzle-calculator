import { describe, expect, it } from "vitest";
import { z } from "zod";
import { firstIssue, operandSchema } from "./operations";

describe("operandSchema", () => {
  const schema = operandSchema("Operand");

  it.each([
    ["0", 0],
    ["7", 7],
    ["-5", -5],
    ["2.25", 2.25],
    [".25", 0.25],
    ["-.25", -0.25],
    ["5.", 5],
    ["0.0", 0],
    ["007", 7],
    ["123456789", 123456789],
    ["-123456789", -123456789],
    ["1.23456789", 1.23456789],
    ["-12345678.9", -12345678.9],
    [".12345678", 0.12345678],
    ["123456789012345", 123456789012345],
    ["0.30000000000000004", 0.1 + 0.2],
    ["999999998000000000", 999999998000000000],
    ["1e+21", 1e21],
    ["-1e+21", -1e21],
    ["1e-7", 1e-7],
    ["1.5e+300", 1.5e300],
    ["1.7976931348623157e+308", Number.MAX_VALUE],
    ["5e-324", Number.MIN_VALUE],
  ])("accepts %j as %d", (input, want) => {
    expect(schema.parse(input)).toBe(want);
  });

  it.each([
    ["an empty string", "", "Operand is required"],
    ["a lone sign", "-", "Operand is not a valid number"],
    ["a lone decimal point", ".", "Operand is not a valid number"],
    ["a signed decimal point", "-.", "Operand is not a valid number"],
    ["a plus sign", "+5", "Operand is not a valid number"],
    ["a double sign", "--5", "Operand is not a valid number"],
    ["two decimal points", "1.2.3", "Operand is not a valid number"],
    ["a comma separator", "1,5", "Operand is not a valid number"],
    ["leading whitespace", " 5", "Operand is not a valid number"],
    ["trailing whitespace", "5 ", "Operand is not a valid number"],
    ["an exponent marker alone", "e5", "Operand is not a valid number"],
    ["an exponent without digits", "1e", "Operand is not a valid number"],
    ["an exponent with only a sign", "1e+", "Operand is not a valid number"],
    ["a decimal exponent", "1e1.5", "Operand is not a valid number"],
    ["a capital exponent marker", "1E5", "Operand is not a valid number"],
    ["Infinity", "Infinity", "Operand is not a valid number"],
    ["NaN", "NaN", "Operand is not a valid number"],
    ["letters", "abc", "Operand is not a valid number"],
  ])("rejects %s", (_name, input, want) => {
    const result = schema.safeParse(input);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(want);
  });

  it("names the field in every message", () => {
    const named = operandSchema("Exponent");

    expect(named.safeParse("").error?.issues[0].message).toBe(
      "Exponent is required",
    );
  });

  it("rejects non-string values", () => {
    expect(schema.safeParse(5).success).toBe(false);
    expect(schema.safeParse(null).success).toBe(false);
    expect(schema.safeParse(undefined).success).toBe(false);
  });
});

describe("firstIssue", () => {
  const schema = z.object({ name: z.string().min(1, "Name is required") });

  it("wraps the parsed data of a successful parse", () => {
    expect(firstIssue(schema.safeParse({ name: "Ada" }))).toEqual({
      ok: true,
      payload: { name: "Ada" },
    });
  });

  it("reports only the first issue of a failed parse", () => {
    const failing = z.object({
      first: z.string().min(1, "First is required"),
      second: z.string().min(1, "Second is required"),
    });

    expect(firstIssue(failing.safeParse({ first: "", second: "" }))).toEqual({
      ok: false,
      error: "First is required",
    });
  });
});
