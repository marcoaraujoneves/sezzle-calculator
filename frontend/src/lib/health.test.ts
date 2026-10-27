import { describe, expect, it } from "vitest";
import { formatHealth } from "./health";

describe("formatHealth", () => {
  it("pretty-prints the body with two-space indentation", () => {
    expect(formatHealth({ status: "ok" })).toBe('{\n  "status": "ok"\n}');
  });
});
