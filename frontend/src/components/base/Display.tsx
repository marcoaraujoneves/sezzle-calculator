import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DisplayProps {
  /** The pending expression, e.g. "12 +". Empty when nothing is pending. */
  expression: string;
  /** The number currently entered or the last result. */
  value: string;
  /** Sentence read aloud by screen readers whenever it changes, e.g. "Result: 15". */
  announcement: string;
  /** Dims the value and shows a spinner while the backend is answering. */
  isLoading?: boolean;
}

export function Display({
  expression,
  value,
  announcement,
  isLoading = false,
}: DisplayProps) {
  return (
    <section
      aria-label="Display"
      aria-busy={isLoading}
      className="rounded-2xl bg-black/25 px-5 py-4 text-right text-white ring-1 ring-lavender/10 ring-inset"
    >
      <div className="flex h-6 items-center justify-between gap-3">
        <Loader2
          aria-hidden="true"
          className={cn(
            "size-4 animate-spin text-mint",
            !isLoading && "invisible",
          )}
        />
        <p
          aria-label="Expression"
          className="truncate text-sm font-medium text-lavender/60"
        >
          {expression}
        </p>
      </div>
      <output
        aria-label="Current value"
        className={cn(
          "block truncate text-display font-bold transition-opacity",
          isLoading && "opacity-40",
        )}
      >
        {value}
      </output>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
