import { cn } from "@/lib/utils";

export type ButtonVariant = "digit" | "operator" | "function" | "equals";

export interface ButtonProps {
  /** Text shown on the key, e.g. "÷". */
  label: string;
  /** Spoken name of the key, e.g. "Divide". Symbols are read poorly by screen readers. */
  ariaLabel: string;
  variant?: ButtonVariant;
  /** Makes the key span every column of the grid. */
  wide?: boolean;
  disabled?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  digit: "bg-white text-neutral-900 hover:bg-neutral-100",
  operator: "bg-amber-500 text-white hover:bg-amber-400",
  function: "bg-neutral-300 text-neutral-900 hover:bg-neutral-200",
  equals: "bg-emerald-600 text-white hover:bg-emerald-500",
};

export function Button({
  label,
  ariaLabel,
  variant = "digit",
  wide = false,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        "h-16 rounded-lg text-xl font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50",
        VARIANT_CLASSES[variant],
        wide && "col-span-full",
      )}
    >
      {label}
    </button>
  );
}
