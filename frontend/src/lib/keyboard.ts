import {
  KEY_ID_BY_KEYBOARD_KEY,
  KEY_ID_BY_NUMPAD_CODE,
} from "@/constants/keyboard";
import { KEYS } from "@/constants/keypad";
import { isKeyDisabled, resolveKeyAction } from "@/lib/keypad";
import type { Calculator } from "@/types/calculator";
import type { KeyDefinition } from "@/types/keypad";
import type { KeyboardInput } from "@/types/keyboard";

function lookup(
  keyIdByInput: Readonly<Record<string, string>>,
  input: string,
): string | undefined {
  return Object.hasOwn(keyIdByInput, input) ? keyIdByInput[input] : undefined;
}

export function resolveKeyboardKey({
  key,
  code,
}: KeyboardInput): KeyDefinition | undefined {
  const keyId =
    lookup(KEY_ID_BY_NUMPAD_CODE, code) ?? lookup(KEY_ID_BY_KEYBOARD_KEY, key);

  return KEYS.find((candidate) => candidate.id === keyId);
}

export function resolveKeyboardAction(
  input: KeyboardInput,
  calculator: Calculator,
): (() => void) | undefined {
  const key = resolveKeyboardKey(input);

  if (!key || isKeyDisabled(key, calculator)) {
    return undefined;
  }

  return resolveKeyAction(key, calculator);
}
