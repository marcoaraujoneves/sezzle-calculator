import { useEffect } from "react";
import { resolveKeyboardAction } from "@/lib/keyboard";
import type { Calculator } from "@/types/calculator";

export function useKeyboard(calculator: Calculator) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const hasShortcutModifier =
        event.ctrlKey || event.metaKey || event.altKey;

      if (hasShortcutModifier || event.repeat) {
        return;
      }

      const action = resolveKeyboardAction(event, calculator);

      if (!action) {
        return;
      }

      // Stops Enter from also clicking the focused key.
      event.preventDefault();
      action();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calculator]);
}
