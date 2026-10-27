import { describe, expect, it } from "vitest";
import { joinUrl } from "./url";

describe("joinUrl", () => {
  it("joins an absolute base and a path", () => {
    expect(joinUrl("http://localhost:8080", "/healthz")).toBe(
      "http://localhost:8080/healthz",
    );
  });

  it("does not double the slash between base and path", () => {
    expect(joinUrl("http://localhost:8080/", "/healthz")).toBe(
      "http://localhost:8080/healthz",
    );
  });

  it("adds the missing leading slash to the path", () => {
    expect(joinUrl("http://localhost:8080", "healthz")).toBe(
      "http://localhost:8080/healthz",
    );
  });

  it("returns a same-origin path when the base is empty", () => {
    expect(joinUrl("", "/healthz")).toBe("/healthz");
  });
});
