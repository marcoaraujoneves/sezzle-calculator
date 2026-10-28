import { describe, expect, it } from "vitest";
import { ADVANCED_OPERATION_BY_KEY, KEYS, OPERATION_BY_KEY } from "./keypad";

describe("KEYS", () => {
  it("has unique ids", () => {
    const ids = KEYS.map((key) => key.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a label and a spoken name for every key", () => {
    expect(KEYS.every((key) => key.label !== "" && key.ariaLabel !== "")).toBe(
      true,
    );
  });

  it("fills the four-column grid", () => {
    const cells = KEYS.reduce((total, key) => total + (key.wide ? 3 : 1), 0);

    expect(cells % 4).toBe(0);
  });

  it("has a key for every operation mapping", () => {
    const ids = new Set(KEYS.map((key) => key.id));
    const mappedIds = [
      ...Object.keys(OPERATION_BY_KEY),
      ...Object.keys(ADVANCED_OPERATION_BY_KEY),
    ];

    expect(mappedIds.every((id) => ids.has(id))).toBe(true);
  });

  it("maps each key to at most one kind of operation", () => {
    const overlapping = Object.keys(OPERATION_BY_KEY).filter(
      (id) => id in ADVANCED_OPERATION_BY_KEY,
    );

    expect(overlapping).toEqual([]);
  });
});
