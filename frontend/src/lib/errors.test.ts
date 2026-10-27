import { describe, expect, it } from "vitest";
import { errorMessage, httpErrorMessage } from "./errors";

describe("httpErrorMessage", () => {
  it("names the endpoint and the status", () => {
    expect(httpErrorMessage("healthz", 503)).toBe("healthz responded with 503");
  });
});

describe("errorMessage", () => {
  it("returns the message of an Error", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("stringifies anything that is not an Error", () => {
    expect(errorMessage("plain text")).toBe("plain text");
    expect(errorMessage(404)).toBe("404");
  });
});
