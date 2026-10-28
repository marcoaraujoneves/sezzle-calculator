import { Button } from "@/components/base/Button";
import { ButtonGrid } from "@/components/base/ButtonGrid";
import { KEYS } from "@/constants/keypad";
import { isKeyDisabled, resolveKeyAction } from "@/lib/keypad";
import type { Calculator } from "@/types/calculator";

export interface KeypadProps {
  calculator: Calculator;
}

export function Keypad({ calculator }: KeypadProps) {
  return (
    <ButtonGrid label="Calculator keys">
      {KEYS.map((key) => (
        <Button
          key={key.id}
          label={key.label}
          ariaLabel={key.ariaLabel}
          variant={key.variant}
          wide={key.wide}
          disabled={isKeyDisabled(key, calculator)}
          onClick={resolveKeyAction(key, calculator)}
        />
      ))}
    </ButtonGrid>
  );
}
