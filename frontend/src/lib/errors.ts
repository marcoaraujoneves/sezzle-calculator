import {
  API_OPERAND_ERROR_PATTERN,
  FRIENDLY_MESSAGE_BY_API_ERROR,
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  OPERAND_ERROR_MESSAGE,
} from "@/constants/error-messages";

export function httpErrorMessage(endpoint: string, status: number): string {
  return `${endpoint} responded with ${status}`;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// fetch rejects with a TypeError when the request never got an answer.
export function friendlyErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return NETWORK_ERROR_MESSAGE;
  }

  const message = errorMessage(error);

  if (Object.hasOwn(FRIENDLY_MESSAGE_BY_API_ERROR, message)) {
    return FRIENDLY_MESSAGE_BY_API_ERROR[message];
  }

  if (API_OPERAND_ERROR_PATTERN.test(message)) {
    return OPERAND_ERROR_MESSAGE;
  }

  return GENERIC_ERROR_MESSAGE;
}
