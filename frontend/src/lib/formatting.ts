import { MAX_DIGITS, SCIENTIFIC_DECIMALS } from "@/constants/calculator";
import { OPERATION_SYMBOLS } from "@/constants/operation-symbols";
import { countDigits } from "@/lib/digits";
import type { CalculatorState } from "@/types/calculator";

// Drops the zeros left at the end once the fraction is cut to maxLength digits.
function truncateFraction(fraction: string, maxLength: number): string {
  return fraction.slice(0, maxLength).replace(/0+$/, "");
}

function leadingDigits(digits: string, length: number): string {
  return digits.padEnd(length, "0").slice(0, length);
}

function joinParts(integer: string, fraction: string): string {
  return fraction === "" ? integer : `${integer}.${fraction}`;
}

// Engineering notation keeps the exponent a multiple of 3, so 10000000000 reads "10 × 10^9".
function toScientific(digits: string, exponent: number): string {
  const power = Math.floor(exponent / 3) * 3;
  const integerLength = exponent - power + 1;

  const integer = leadingDigits(digits, integerLength);
  const fraction = truncateFraction(
    digits.slice(integerLength),
    SCIENTIFIC_DECIMALS,
  );

  return `${joinParts(integer, fraction)} × 10^${power}`;
}

// Typed input and short answers are shown as they are, since "2." must stay "2." while typing.
// Anything else can only be a backend answer, which is shortened to fit MAX_DIGITS.
export function formatNumber(raw: string): string {
  const isShownAsTyped = countDigits(raw) <= MAX_DIGITS && !raw.includes("e");

  if (isShownAsTyped) {
    return raw;
  }

  const value = Number(raw);
  const sign = value < 0 ? "-" : "";
  const [mantissa, exponentText] = Math.abs(value).toExponential().split("e");
  const significantDigits = mantissa.replace(".", "");
  const exponent = Number(exponentText);

  if (exponent >= MAX_DIGITS) {
    return sign + toScientific(significantDigits, exponent);
  }

  const hasIntegerPart = exponent >= 0;
  const integerLength = Math.max(exponent + 1, 1);
  const integer = hasIntegerPart
    ? leadingDigits(significantDigits, integerLength)
    : "0";
  const fractionDigits = hasIntegerPart
    ? significantDigits.slice(integerLength)
    : "0".repeat(-exponent - 1) + significantDigits;
  const fraction = truncateFraction(fractionDigits, MAX_DIGITS - integerLength);

  // Truncating would show 0 for a tiny answer, so it stays in scientific notation.
  if (integer === "0" && fraction === "") {
    return sign + toScientific(significantDigits, exponent);
  }

  return sign + joinParts(integer, fraction);
}

export function formatExpression(state: CalculatorState): string {
  if (state.operation === null) {
    return "";
  }

  const symbol = OPERATION_SYMBOLS[state.operation];

  return `${formatNumber(state.first)} ${symbol}`;
}
