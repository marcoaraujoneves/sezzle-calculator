import type { LucideIcon } from "lucide-react";
import { VARIANT_CLASSES } from "@/constants/button";
import { cn } from "@/lib/utils";
import type { ButtonVariant } from "@/types/button";

export interface ButtonProps {
  /** Text shown on the key when it has no icon, e.g. "7". */
  label: string;
  /** Spoken name of the key, e.g. "Divide". Symbols are read poorly by screen readers. */
  ariaLabel: string;
  /** Replaces the label with a symbol drawn as an icon. */
  icon?: LucideIcon;
  variant?: ButtonVariant;
  /** Makes the key span every column of the grid. */
  wide?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  label,
  ariaLabel,
  icon: Icon,
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
        "flex h-14 cursor-pointer items-center justify-center rounded-pill border border-transparent text-key font-medium transition duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16",
        VARIANT_CLASSES[variant],
        wide && "col-span-3",
      )}
    >
      {Icon ? (
        <Icon aria-hidden="true" className="size-6" strokeWidth={2} />
      ) : (
        label
      )}
    </button>
  );
}
