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
      className="rounded-lg bg-neutral-900 p-4 text-right text-white"
    >
      <p
        aria-label="Expression"
        className="h-6 truncate text-sm text-neutral-400"
      >
        {expression}
      </p>
      <output
        aria-label="Current value"
        className="block truncate text-4xl font-semibold"
      >
        {value}
      </output>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
