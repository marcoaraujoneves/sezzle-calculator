import type { ButtonVariant } from "@/types/button";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  digit: "bg-white text-neutral-900 hover:bg-neutral-100",
  operator: "bg-amber-500 text-white hover:bg-amber-400",
  function: "bg-neutral-300 text-neutral-900 hover:bg-neutral-200",
  equals: "bg-emerald-600 text-white hover:bg-emerald-500",
};
