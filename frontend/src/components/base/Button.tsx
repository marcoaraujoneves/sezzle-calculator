import { VARIANT_CLASSES } from "@/constants/button";
import { cn } from "@/lib/utils";
import type { ButtonVariant } from "@/types/button";

export interface ButtonProps {
  /** Text shown on the key, e.g. "÷". */
  label: string;
  /** Spoken name of the key, e.g. "Divide". Symbols are read poorly by screen readers. */
  ariaLabel: string;
  variant?: ButtonVariant;
  /** Makes the key span every column of the grid. */
  wide?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  label,
  ariaLabel,
  variant = "digit",
  wide = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-16 rounded-lg text-xl font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50",
        VARIANT_CLASSES[variant],
        wide && "col-span-3",
      )}
    >
      {label}
    </button>
  );
}
