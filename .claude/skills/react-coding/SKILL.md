---
name: react-coding
description: Coding conventions for the React + TypeScript frontend in this repo. Use whenever writing, refactoring, or reviewing code under frontend/src, including components, hooks, lib functions, schemas, constants, types, services, and their tests.
---

# React coding guide

Applies to `frontend/src/`. The short rules live in `.claude/CLAUDE.md`; this file gives the reasoning and patterns behind them.

## Where code goes

| Folder        | Holds                                                         | Never holds                      |
| ------------- | ------------------------------------------------------------- | -------------------------------- |
| `constants/`  | Static values, lookup tables, regexes, messages, endpoints    | Functions, logic                 |
| `types/`      | Shared interfaces and unions, derived types                   | Runtime values                   |
| `schemas/`    | zod schemas and `validate*` wrappers                          | Calculator state logic           |
| `lib/`        | Pure functions: state transitions, formatting, preparation    | React, fetch, toasts             |
| `services/`   | `fetch` calls, one function per endpoint                      | Validation, state                |
| `hooks/`      | Glue: state, calling lib and services, side effects like toast | Business rules                   |
| `components/` | Markup and styling, props in, events out                      | Logic, constants, shared types   |

Decision rule: if a component or hook needs an `if` that isn't about rendering, it belongs in `lib/`. If a file declares a `const` object or array at module level, it belongs in `constants/`.

## Constants

- One file per logical entity, named for it: `keypad.ts`, `operations.ts`, `button.ts`, `config.ts`.
- Group related values into one object (`VALIDATION_MESSAGES`, `KEY_ID`) rather than many loose exports.
- Derive types from constants (`(typeof OPERATIONS)[number]`) and put them in `types/` so the list is written once.
- Constants may `import type` from `types/`; `types/` may `import type` from constants and schemas. Keep it type-only to avoid runtime cycles.
- Use a constant for any string that two files must agree on (endpoint names, key ids, messages).

## Types

- Move a type to `types/<entity>.ts` when it is shared, derived from a schema, or more than a few fields.
- A component's own props interface stays next to the component.
- Prefer `interface` for object shapes, `type` for unions and derived types. Always `import type`.
- Share input shapes instead of repeating inline object types (`UnaryCalculationInput`, `BinaryCalculationInput`).

## Functions

- Name for meaning. Booleans read as questions: `isCalculatorEmpty`, `hasIntegerPart`, `isAwaitingSecondInput`. Extract a named boolean when a condition has more than one clause.
- One level of abstraction per function. If a body mixes parsing, deciding and formatting, split it.
- Blank lines separate clusters: guards, derivations, the return.
- Always braces and a line break for `if`:

```ts
// Avoid
if (!canAppendDigit(state)) return state;

// Prefer
if (!canAppendDigit(state)) {
  return state;
}
```

- Early returns for guards; avoid `else` after a `return`.
- A ternary is fine for choosing one value. Use `if` once either branch needs more than one expression.
- Keep functions pure and return new state; never mutate arguments.

## Async

- Never hide a promise inside an argument. Await into a named variable first:

```ts
// Avoid
setState(answerState(await request()));

// Prefer
const result = await request();
setState(answerState(result));
```

- Call async handlers from event props with `void`: `onEquals: () => void runEquals()`.
- Catch at the boundary that can recover (the hook), not in every service.
- TypeScript does not narrow through aliased property checks such as `const failed = body.result === undefined`. Destructure first, then check the local.

## Schemas and validation

- Shared pieces (`operandSchema`, `firstIssue`, the missing-operation error) live in `schemas/operations.ts`; the rest is split by endpoint family.
- Messages come from `VALIDATION_MESSAGES`, except those that interpolate a field name.
- Each `validate*` returns `ValidationResult<T>`; callers branch on `ok`, they do not catch.
- The hook sends nothing to the backend unless validation passed.

## Hooks

- A hook wires state to lib functions and services and exposes a typed interface (`Calculator` in `types/calculator.ts`).
- Avoid repeating a validate-then-send block: use one generic helper (`submit(validation, send)`).
- Name inner handlers distinctly from the exposed ones (`runEquals` vs `onEquals`).

## Components

- Presentational: props in, JSX out. No `useState` for domain data, no business conditions.
- Look-ups such as "which handler does this key trigger" are `lib/` functions (`resolveKeyAction`, `isKeyDisabled`).
- Class maps like `VARIANT_CLASSES` are constants; compose with `cn()`.
- Keep accessibility: an `ariaLabel` for symbol-only controls, `role="group"` with a label, a `role="status"` live region.

## Tests

Vitest, functions only, no DOM or component tests. Files are colocated as `<name>.test.ts`.

- Table-driven with `it.each`; the test title uses `%j` / `%s` so a failure names its case.
- Cover for every function: the happy path, each boundary (digit limit exactly met and exceeded, zero, empty), invalid input (empty, lone sign or decimal point, exponent notation, whitespace), decimals (leading `.5`, trailing `5.`, long fractions) and negative values (including `-0`).
- Assert the whole result with `toEqual`, not only a field, unless the field is the point of the test.
- Build states with small helpers (`typeDigits`, `stateWith`) so a test reads as a scenario.
- Fakes: `vi.fn()` for handlers. Never mock the module under test.
- A test for a constants file checks invariants (unique ids, every mapping has a key), not values.

## Comments

Comment WHY, never HOW, and only for business rules that aren't obvious (the 9 digit limit, why minus acts as a sign, why percentage goes through the advanced endpoint). No TODOs. If a comment explains what the code does, rename or extract instead.

## Workflow after edits

From `frontend/`: `bun run lint`, `bunx prettier --write src`, `bun run test`, `bunx tsc -b`. Fix everything lint reports. The existing `only-export-components` warning in `components/ui/button.tsx` comes from shadcn and is expected.
