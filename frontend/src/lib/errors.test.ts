import { describe, expect, it } from "vitest";
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  OPERAND_ERROR_MESSAGE,
} from "@/constants/error-messages";
import { errorMessage, friendlyErrorMessage, httpErrorMessage } from "./errors";

describe("friendlyErrorMessage", () => {
  it.each([
    ["division by zero", "Can't divide by zero."],
    [
      "square root of a negative number is not allowed",
      "Can't take the square root of a negative number.",
    ],
    ["second_input must be an integer", "The exponent must be a whole number."],
    ["second_input is required", "Enter the second number first."],
    [
      "result is too large to be represented",
      "The result is too large to be calculated.",
    ],
    ["unknown operation", "That operation isn't supported."],
    ["request body too large", "That number is too long to be calculated."],
    ["first_input is required", OPERAND_ERROR_MESSAGE],
    ["first_input must be a number", OPERAND_ERROR_MESSAGE],
    ["second_input must be a number", OPERAND_ERROR_MESSAGE],
  ])("translates %j", (apiMessage, friendlyMessage) => {
    expect(friendlyErrorMessage(new Error(apiMessage))).toBe(friendlyMessage);
  });

  it.each([
    "internal error",
    "method not allowed",
    "unreadable request body",
    "body must be a JSON object",
    "basic-calculations responded with 502",
    "",
    "constructor",
  ])("hides the technical message %j", (apiMessage) => {
    expect(friendlyErrorMessage(new Error(apiMessage))).toBe(
      GENERIC_ERROR_MESSAGE,
    );
  });

  it("explains a request that never got an answer", () => {
    expect(friendlyErrorMessage(new TypeError("Failed to fetch"))).toBe(
      NETWORK_ERROR_MESSAGE,
    );
  });

  it("hides anything that is not an Error", () => {
    expect(friendlyErrorMessage("boom")).toBe(GENERIC_ERROR_MESSAGE);
  });
});

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
