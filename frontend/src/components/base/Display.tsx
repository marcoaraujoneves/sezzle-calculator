export interface DisplayProps {
  /** The pending expression, e.g. "12 +". Empty when nothing is pending. */
  expression: string;
  /** The number currently entered or the last result. */
  value: string;
  /** Sentence read aloud by screen readers whenever it changes, e.g. "Result: 15". */
  announcement: string;
}

export function Display({ expression, value, announcement }: DisplayProps) {
  return (
    <section
      aria-label="Display"
      className="rounded-2xl bg-black/25 px-5 py-4 text-right text-white ring-1 ring-lavender/10 ring-inset"
    >
      <p
        aria-label="Expression"
        className="h-6 truncate text-sm font-medium text-lavender/60"
      >
        {expression}
      </p>
      <output
        aria-label="Current value"
        className="block truncate text-display font-bold"
      >
        {value}
      </output>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
