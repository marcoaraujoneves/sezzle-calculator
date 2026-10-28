import { describe, expect, it } from "vitest";
import { INITIAL_STATE } from "@/constants/calculator";
import type { CalculatorState } from "@/types/calculator";
import { answerState, appendDigit, selectOperation } from "./calculator";
import { formatExpression, formatNumber } from "./formatting";

function typeDigits(state: CalculatorState, digits: string): CalculatorState {
  return [...digits].reduce(appendDigit, state);
}

describe("formatNumber", () => {
  it.each([
    ["", ""],
    ["-", "-"],
    ["2.", "2."],
    [".", "."],
    ["0", "0"],
    ["0.50", "0.50"],
    ["007", "007"],
    ["123456789", "123456789"],
    ["12345678.9", "12345678.9"],
    ["-12.5", "-12.5"],
    ["-123456789", "-123456789"],
  ])("leaves %j as typed", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it.each([
    ["10000000000", "10 × 10^9"],
    ["-10000000000", "-10 × 10^9"],
    ["1000000000", "1 × 10^9"],
    ["1234567890", "1.234 × 10^9"],
    ["123456789012", "123.456 × 10^9"],
    ["12345678901234", "12.345 × 10^12"],
    ["12000000000000", "12 × 10^12"],
    ["12000900000000", "12 × 10^12"],
    ["1e+21", "1 × 10^21"],
    ["-1e+21", "-1 × 10^21"],
    ["1.5e+300", "1.5 × 10^300"],
    ["1e+9", "1 × 10^9"],
  ])("writes the large answer %j in scientific notation", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it.each([
    ["9.12345678912", "9.12345678"],
    ["-9.12345678912", "-9.12345678"],
    ["123456789.987", "123456789"],
    ["12345.6789123", "12345.6789"],
    ["0.30000000000000004", "0.3"],
    ["1.00000000012", "1"],
    ["2.1000000000", "2.1"],
    ["0.123456789", "0.12345678"],
    ["0.000012345678912", "0.00001234"],
    ["1e-7", "0.0000001"],
  ])("truncates the long answer %j to %j", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it.each([
    ["1e-12", "1 × 10^-12"],
    ["-1e-12", "-1 × 10^-12"],
    ["1.5e-10", "150 × 10^-12"],
    ["0.0000000001234", "123.4 × 10^-12"],
    ["0.00000000012345678", "123.456 × 10^-12"],
  ])("keeps the tiny answer %j in scientific notation", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it("never drops the sign of a truncated answer", () => {
    expect(formatNumber("-0.30000000000000004")).toBe("-0.3");
  });
});

describe("formatExpression", () => {
  it("is empty until an operation is selected", () => {
    expect(formatExpression(typeDigits(INITIAL_STATE, "12"))).toBe("");
    expect(formatExpression(INITIAL_STATE)).toBe("");
  });

  it.each([
    ["addition", "12 +"],
    ["subtraction", "12 −"],
    ["multiplication", "12 ×"],
    ["division", "12 ÷"],
    ["exponentiation", "12 ^"],
    ["percentage", "12 %"],
  ] as const)("shows the first input and the %s symbol", (operation, want) => {
    const state = selectOperation(typeDigits(INITIAL_STATE, "12"), operation);

    expect(formatExpression(state)).toBe(want);
  });

  it("shows 0 when the operation was picked on an empty calculator", () => {
    expect(formatExpression(selectOperation(INITIAL_STATE, "addition"))).toBe(
      "0 +",
    );
  });

  it("keeps a typed decimal point", () => {
    const state = selectOperation(typeDigits(INITIAL_STATE, "2"), "addition");

    expect(formatExpression({ ...state, first: "2." })).toBe("2. +");
  });

  it("shortens a long answer used as the first input", () => {
    const state = selectOperation(answerState(10000000000), "addition");

    expect(formatExpression(state)).toBe("10 × 10^9 +");
  });

  it("truncates a long decimal answer used as the first input", () => {
    const state = selectOperation(answerState(1 / 3), "multiplication");

    expect(formatExpression(state)).toBe("0.33333333 ×");
  });
});
