import type { ButtonVariant } from "@/types/button";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  digit: "bg-lavender/10 text-lavender hover:bg-lavender/20",
  function: "border-lavender/20 text-lavender hover:bg-lavender/10",
  operator: "bg-lavender text-ink hover:bg-white shadow-key",
  equals:
    "bg-brand-gradient text-white shadow-cta hover:brightness-110 font-bold",
};
