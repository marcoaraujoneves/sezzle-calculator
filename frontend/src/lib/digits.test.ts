import { describe, expect, it } from "vitest";
import { countDigits } from "./digits";

describe("countDigits", () => {
  it.each([
    ["", 0],
    ["123", 3],
    ["1.5", 2],
    ["0.", 1],
    [".5", 1],
    ["-12.5", 3],
    ["-", 0],
    [".", 0],
    ["-.", 0],
    ["0.000", 4],
    ["123456789", 9],
    ["1234567890", 10],
    ["-1234.5678", 8],
  ])("counts %j as %i digits", (value, want) => {
    expect(countDigits(value)).toBe(want);
  });
});
