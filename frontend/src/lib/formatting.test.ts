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
    ["10000000000", "10000000000"],
    ["2.1000000000", "2.1000000000"],
    ["123456789012345", "123456789012345"],
    ["-123456789012345", "-123456789012345"],
    ["1234567.12345678", "1234567.12345678"],
  ])("leaves %j as typed", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it.each([
    ["1000000000000000", "1 × 10^15"],
    ["-1000000000000000", "-1 × 10^15"],
    ["10000000000000000", "10 × 10^15"],
    ["123456789012345678", "123.456 × 10^15"],
    ["1234567890123456789", "1.234 × 10^18"],
    ["999999998000000000", "999.999 × 10^15"],
    ["1e+21", "1 × 10^21"],
    ["-1e+21", "-1 × 10^21"],
    ["1.5e+300", "1.5 × 10^300"],
    ["1.7976931348623157e+308", "179.769 × 10^306"],
  ])("writes the large answer %j in scientific notation", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it.each([
    ["1e+9", "1000000000"],
    ["9.12345678912345678", "9.12345678912345"],
    ["-9.12345678912345678", "-9.12345678912345"],
    ["0.30000000000000004", "0.3"],
    ["1.00000000000000012", "1"],
    ["0.000012345678912", "0.00001234567891"],
    ["1e-7", "0.0000001"],
    ["1e-12", "0.000000000001"],
  ])("truncates the long answer %j to %j", (raw, want) => {
    expect(formatNumber(raw)).toBe(want);
  });

  it.each([
    ["1e-15", "1 × 10^-15"],
    ["-1e-15", "-1 × 10^-15"],
    ["1.5e-16", "150 × 10^-18"],
    ["0.000000000000001", "1 × 10^-15"],
    ["5e-324", "5 × 10^-324"],
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
    const state = selectOperation(answerState(1e16), "addition");

    expect(formatExpression(state)).toBe("10 × 10^15 +");
  });

  it("truncates a long decimal answer used as the first input", () => {
    const state = selectOperation(answerState(1 / 3), "multiplication");

    expect(formatExpression(state)).toBe("0.33333333333333 ×");
  });
});
