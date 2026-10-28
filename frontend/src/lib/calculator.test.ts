import { describe, expect, it } from "vitest";
import { INITIAL_STATE } from "@/constants/calculator";
import type { CalculatorState } from "@/types/calculator";
import {
  activeInput,
  answerState,
  appendDecimal,
  appendDigit,
  canAppendDecimal,
  canAppendDigit,
  removeLastDigit,
  selectOperation,
  toCalculationInput,
  toggleSign,
} from "./calculator";

function typeDigits(state: CalculatorState, digits: string): CalculatorState {
  return [...digits].reduce(appendDigit, state);
}

describe("answerState", () => {
  it.each([
    [15, "15"],
    [-5, "-5"],
    [0.1, "0.1"],
    [0, "0"],
    [1e21, "1e+21"],
    [1e-7, "1e-7"],
  ])("stores %d as the raw answer %j", (result, want) => {
    expect(answerState(result)).toEqual({
      ...INITIAL_STATE,
      first: want,
      answered: true,
    });
  });
});

describe("activeInput", () => {
  it("is the first input until an operation is selected", () => {
    expect(activeInput(typeDigits(INITIAL_STATE, "12"))).toBe("12");
  });

  it("is the second input once an operation is selected", () => {
    const state = typeDigits(
      selectOperation(typeDigits(INITIAL_STATE, "12"), "addition"),
      "3",
    );

    expect(activeInput(state)).toBe("3");
  });

  it("is empty on a fresh calculator", () => {
    expect(activeInput(INITIAL_STATE)).toBe("");
  });
});

describe("toCalculationInput", () => {
  it("maps the state onto the backend field names", () => {
    const state = typeDigits(
      selectOperation(typeDigits(INITIAL_STATE, "12"), "division"),
      "4",
    );

    expect(toCalculationInput(state)).toEqual({
      operation: "division",
      first_input: "12",
      second_input: "4",
    });
  });

  it("keeps a missing operation as null", () => {
    expect(toCalculationInput(INITIAL_STATE)).toEqual({
      operation: null,
      first_input: "",
      second_input: "",
    });
  });

  it("keeps the raw answer as the first input", () => {
    expect(toCalculationInput(answerState(-2.5)).first_input).toBe("-2.5");
  });
});

describe("appendDigit", () => {
  it("accumulates digits into the first input", () => {
    expect(typeDigits(INITIAL_STATE, "123").first).toBe("123");
  });

  it("keeps leading zeros as typed", () => {
    expect(typeDigits(INITIAL_STATE, "007").first).toBe("007");
  });

  it("accepts the fifteenth digit", () => {
    const state = typeDigits(INITIAL_STATE, "12345678901234");

    expect(canAppendDigit(state)).toBe(true);
    expect(appendDigit(state, "5").first).toBe("123456789012345");
  });

  it("ignores digits once fifteen are entered", () => {
    const full = typeDigits(INITIAL_STATE, "1234567890123456");

    expect(full.first).toBe("123456789012345");
    expect(canAppendDigit(full)).toBe(false);
  });

  it("returns the very same state when the limit blocks the digit", () => {
    const full = typeDigits(INITIAL_STATE, "123456789012345");

    expect(appendDigit(full, "0")).toBe(full);
  });

  it("does not count the decimal point towards the limit", () => {
    const withDecimal = appendDecimal(typeDigits(INITIAL_STATE, "1"));
    const state = typeDigits(withDecimal, "23456789012345");

    expect(state.first).toBe("1.23456789012345");
    expect(canAppendDigit(state)).toBe(false);
  });

  it("limits the second input on its own", () => {
    const afterFirst = selectOperation(
      typeDigits(INITIAL_STATE, "123456789012345"),
      "addition",
    );
    const state = typeDigits(afterFirst, "1234567890123456");

    expect(state.first).toBe("123456789012345");
    expect(state.second).toBe("123456789012345");
  });

  it("starts a new input after a long answer instead of limiting it", () => {
    const state = appendDigit(answerState(0.1 + 0.2), "5");

    expect(state.first).toBe("5");
  });
});

describe("appendDecimal", () => {
  it("accepts only one decimal point per input", () => {
    const state = appendDecimal(appendDecimal(typeDigits(INITIAL_STATE, "1")));

    expect(state.first).toBe("1.");
    expect(canAppendDecimal(state)).toBe(false);
  });

  it("starts a fraction from an empty input", () => {
    expect(typeDigits(appendDecimal(INITIAL_STATE), "5").first).toBe(".5");
  });

  it("is still available when the digit limit is reached", () => {
    const full = typeDigits(INITIAL_STATE, "123456789012345");

    expect(canAppendDecimal(full)).toBe(true);
    expect(appendDecimal(full).first).toBe("123456789012345.");
  });

  it("goes after a sign", () => {
    expect(appendDecimal(toggleSign(INITIAL_STATE)).first).toBe("-.");
  });

  it("is allowed again in the second input", () => {
    const afterFirst = selectOperation(
      appendDecimal(typeDigits(INITIAL_STATE, "1")),
      "addition",
    );

    expect(canAppendDecimal(afterFirst)).toBe(true);
    expect(appendDecimal(afterFirst).second).toBe(".");
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
    const state = selectOperation(INITIAL_STATE, "addition");

    expect(state.first).toBe("0");
    expect(state.operation).toBe("addition");
  });

  it.each([
    "addition",
    "multiplication",
    "division",
    "exponentiation",
  ] as const)(
    "does not treat %s on an empty calculator as a sign",
    (operation) => {
      expect(selectOperation(INITIAL_STATE, operation).first).toBe("0");
    },
  );

  it("treats minus on an empty first input as a sign", () => {
    const state = typeDigits(
      selectOperation(INITIAL_STATE, "subtraction"),
      "25",
    );

    expect(state).toEqual({ ...INITIAL_STATE, first: "-25" });
  });

  it("treats minus after a first input as subtraction", () => {
    const state = selectOperation(
      typeDigits(INITIAL_STATE, "5"),
      "subtraction",
    );

    expect(state.operation).toBe("subtraction");
    expect(state.first).toBe("5");
  });

  it("treats minus after an answer as subtraction", () => {
    const state = selectOperation(answerState(7), "subtraction");

    expect(state.operation).toBe("subtraction");
    expect(state.first).toBe("7");
  });

  it("types a sign into the empty second input when minus follows an operator", () => {
    const afterOperator = selectOperation(
      typeDigits(INITIAL_STATE, "2"),
      "exponentiation",
    );
    const state = typeDigits(
      selectOperation(afterOperator, "subtraction"),
      "3",
    );

    expect(state.operation).toBe("exponentiation");
    expect(state.second).toBe("-3");
  });

  it("replaces the operator with minus once the second input has digits", () => {
    const afterSecond = typeDigits(
      selectOperation(typeDigits(INITIAL_STATE, "2"), "addition"),
      "3",
    );
    const state = selectOperation(afterSecond, "subtraction");

    expect(state.operation).toBe("subtraction");
    expect(state.second).toBe("3");
  });

  it("still replaces the operator with other operations", () => {
    const afterOperator = selectOperation(
      typeDigits(INITIAL_STATE, "2"),
      "addition",
    );

    expect(selectOperation(afterOperator, "division").operation).toBe(
      "division",
    );
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

  it("keeps digits enabled for an answer in exponent notation", () => {
    expect(canAppendDigit(answerState(1e21))).toBe(true);
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

describe("toggleSign", () => {
  it("negates the first input and back", () => {
    const negative = toggleSign(typeDigits(INITIAL_STATE, "5"));

    expect(negative.first).toBe("-5");
    expect(toggleSign(negative).first).toBe("5");
  });

  it("negates a decimal input", () => {
    const state = toggleSign(appendDecimal(typeDigits(INITIAL_STATE, "5")));

    expect(state.first).toBe("-5.");
  });

  it("starts a negative number from an empty input", () => {
    const state = typeDigits(toggleSign(INITIAL_STATE), "5");

    expect(state.first).toBe("-5");
  });

  it("negates the second input once an operation is selected", () => {
    const state = toggleSign(
      typeDigits(
        selectOperation(typeDigits(INITIAL_STATE, "8"), "addition"),
        "3",
      ),
    );

    expect(state.first).toBe("8");
    expect(state.second).toBe("-3");
  });

  it("does not count the sign toward the digit limit", () => {
    const state = typeDigits(toggleSign(INITIAL_STATE), "123456789012345");

    expect(state.first).toBe("-123456789012345");
    expect(canAppendDigit(state)).toBe(false);
  });

  it("negates an answer and keeps it reusable", () => {
    expect(toggleSign(answerState(5))).toEqual(answerState(-5));
    expect(toggleSign(answerState(-5))).toEqual(answerState(5));
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

  it("removes a lone sign", () => {
    expect(removeLastDigit(toggleSign(INITIAL_STATE)).first).toBe("");
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

    expect(removeLastDigit(state)).toEqual({ ...INITIAL_STATE, first: "12" });
  });

  it("removes a lone sign of the second input before the operation", () => {
    const afterOperator = selectOperation(
      typeDigits(INITIAL_STATE, "2"),
      "addition",
    );
    const signed = selectOperation(afterOperator, "subtraction");
    const state = removeLastDigit(signed);

    expect(state.second).toBe("");
    expect(state.operation).toBe("addition");
  });

  it("resets after an answer", () => {
    expect(removeLastDigit(answerState(15))).toEqual(INITIAL_STATE);
  });

  it("does nothing on an empty calculator", () => {
    expect(removeLastDigit(INITIAL_STATE)).toEqual(INITIAL_STATE);
  });
});
