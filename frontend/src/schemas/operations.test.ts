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
    ["exponent notation", "1e+21", "Operand is not a valid number"],
    ["letters", "abc", "Operand is not a valid number"],
    ["ten digits", "1234567890", "Operand must have at most 9 digits"],
    [
      "a signed ten digits",
      "-1234567890",
      "Operand must have at most 9 digits",
    ],
    [
      "ten digits split by a decimal point",
      "1234567.890",
      "Operand must have at most 9 digits",
    ],
    ["ten decimals", "0.123456789", "Operand must have at most 9 digits"],
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
