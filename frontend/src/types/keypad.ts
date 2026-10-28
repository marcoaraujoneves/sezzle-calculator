import type { ButtonVariant } from "@/types/button";

export interface KeyDefinition {
  id: string;
  label: string;
  ariaLabel: string;
  variant: ButtonVariant;
  wide?: boolean;
}
