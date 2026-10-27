import type { ReactNode } from "react";

export interface ButtonGridProps {
  /** Accessible name announced when focus enters the group, e.g. "Calculator keys". */
  label: string;
  children: ReactNode;
}

export function ButtonGrid({ label, children }: ButtonGridProps) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-4 gap-2">
      {children}
    </div>
  );
}
