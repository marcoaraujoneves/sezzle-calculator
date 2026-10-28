import { describe, expect, it } from "vitest";
import {
  INITIAL_STATE,
  answerState,
  appendDecimal,
  appendDigit,
  canAppendDecimal,
  canAppendDigit,
  countDigits,
  formatExpression,
  removeLastDigit,
  selectOperation,
  type CalculatorState,
} from "./calculator";

function typeDigits(state: CalculatorState, digits: string): CalculatorState {
  return [...digits].reduce(appendDigit, state);
}

describe("countDigits", () => {
  it.each([
    ["", 0],
    ["123", 3],
    ["1.5", 2],
    ["0.", 1],
  ])("counts %j as %i digits", (value, want) => {
    expect(countDigits(value)).toBe(want);
  });
});

describe("appendDigit", () => {
  it("accumulates digits into the first input", () => {
    expect(typeDigits(INITIAL_STATE, "123").first).toBe("123");
  });

  it("ignores digits once nine are entered", () => {
    const full = typeDigits(INITIAL_STATE, "1234567890");
    expect(full.first).toBe("123456789");
    expect(canAppendDigit(full)).toBe(false);
  });

  it("does not count the decimal point towards the limit", () => {
    const state = typeDigits(
      appendDecimal(typeDigits(INITIAL_STATE, "1")),
      "23456789",
    );
    expect(state.first).toBe("1.23456789");
    expect(canAppendDigit(state)).toBe(false);
  });
});

describe("appendDecimal", () => {
  it("accepts only one decimal point per input", () => {
    const state = appendDecimal(appendDecimal(typeDigits(INITIAL_STATE, "1")));
    expect(state.first).toBe("1.");
    expect(canAppendDecimal(state)).toBe(false);
  });

  it("is still available when the digit limit is reached", () => {
    const full = typeDigits(INITIAL_STATE, "123456789");
    expect(canAppendDecimal(full)).toBe(true);
  });
});

describe("selectOperation", () => {
  it("moves accumulation to the second input", () => {
    const state = typeDigits(
      selectOperation(typeDigits(INITIAL_STATE, "12"), "addition"),
      "34",
    );
    expect(state).toEqual({
      first: "12",
      second: "34",
      operation: "addition",
      answered: false,
    });
  });

  it("defaults an empty first input to 0", () => {
    const state = selectOperation(INITIAL_STATE, "subtraction");
    expect(state.first).toBe("0");
    expect(formatExpression(state)).toBe("0 −");
  });

  it("starts the second input with its own digit and decimal allowance", () => {
    const afterFirst = appendDecimal(typeDigits(INITIAL_STATE, "123456789"));
    const state = selectOperation(afterFirst, "division");
    expect(canAppendDigit(state)).toBe(true);
    expect(canAppendDecimal(state)).toBe(true);
  });
});

describe("after an answer", () => {
  it("starts a new round when a digit is typed", () => {
    expect(appendDigit(answerState(15), "7")).toEqual({
      ...INITIAL_STATE,
      first: "7",
    });
  });

  it("starts a new round when a decimal point is typed", () => {
    expect(appendDecimal(answerState(15)).first).toBe(".");
  });

  it("keeps digits and decimal enabled even if the answer is full", () => {
    const state = answerState(123456789.5);
    expect(canAppendDigit(state)).toBe(true);
    expect(canAppendDecimal(state)).toBe(true);
  });

  it("uses the answer as the first input when an operation follows", () => {
    const state = typeDigits(
      selectOperation(answerState(15), "subtraction"),
      "5",
    );
    expect(state).toEqual({
      first: "15",
      second: "5",
      operation: "subtraction",
      answered: false,
    });
  });
});

describe("removeLastDigit", () => {
  it("removes the last character of the first input", () => {
    expect(removeLastDigit(typeDigits(INITIAL_STATE, "123")).first).toBe("12");
  });

  it("removes a trailing decimal point so it can be typed again", () => {
    const state = removeLastDigit(
      appendDecimal(typeDigits(INITIAL_STATE, "1")),
    );
    expect(state.first).toBe("1");
    expect(canAppendDecimal(state)).toBe(true);
  });

  it("re-enables digits after the limit was reached", () => {
    const state = removeLastDigit(typeDigits(INITIAL_STATE, "123456789"));
    expect(canAppendDigit(state)).toBe(true);
  });

  it("removes from the second input once an operation is selected", () => {
    const state = typeDigits(
      selectOperation(typeDigits(INITIAL_STATE, "12"), "addition"),
      "34",
    );
    expect(removeLastDigit(state).second).toBe("3");
  });

  it("drops the operation when the second input is empty", () => {
    const state = selectOperation(typeDigits(INITIAL_STATE, "12"), "addition");
    expect(removeLastDigit(state)).toEqual({
      ...INITIAL_STATE,
      first: "12",
    });
  });

  it("resets after an answer", () => {
    expect(removeLastDigit(answerState(15))).toEqual(INITIAL_STATE);
  });

  it("does nothing on an empty calculator", () => {
    expect(removeLastDigit(INITIAL_STATE)).toEqual(INITIAL_STATE);
  });
});

describe("formatExpression", () => {
  it("is empty until an operation is selected", () => {
    expect(formatExpression(typeDigits(INITIAL_STATE, "12"))).toBe("");
  });

  it("shows the first input and the operator symbol", () => {
    const state = selectOperation(typeDigits(INITIAL_STATE, "12"), "division");
    expect(formatExpression(state)).toBe("12 ÷");
  });
});
