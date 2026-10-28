# Project

Calculator full-stack assessment (see `ASSESSMENT.md`). `backend/` is a Go calculator microservice; `frontend/` is a React SPA.

## Workflow

- After each task, append an entry to `PROMPTS.md` using the format described there. Steering and refinements within a task go in that entry's summary, not a new index.

- After finishing each batch of writes to `frontend/`, run `bun run lint` and `bunx prettier --write src` from `frontend/`, and fix what lint reports before moving on.

## Backend (`backend/`)

- Go, standard library first; idiomatic and small.
- Table-driven tests (`go test ./...`).

## Frontend (`frontend/`)

- React + TypeScript, Vite, Tailwind CSS, shadcn/ui; use `bun` as the package manager.
- Keep components presentational; put logic in plain functions.
- Vitest is for unit-testing functions only (no component or DOM tests). Run with `bun run test`.
- Add UI primitives with `bunx --bun shadcn@latest add <component>`.
- For anything beyond the rules here, load the `react-coding` skill before writing or refactoring frontend code.

### Structure (`frontend/src/`)

- `constants/`: one file per logical entity (`keypad.ts`, `operations.ts`, `config.ts`). No constants inside component, hook, or lib files.
- `types/`: shared or non-trivial types, one file per entity. Components and hooks only declare their own small props interface.
- `schemas/`: zod schemas and their `validate*` functions. `operations.ts` holds what is shared; the rest is split by endpoint (`basic-calculations.ts`, `advanced-calculations.ts`).
- `lib/`: pure functions only, split by concern (state, formatting, preparing each kind of calculation).
- `services/`: HTTP calls. `hooks/`: wiring of state, lib and services. `components/`: markup.
- Every `lib/` and `schemas/` file has a colocated `*.test.ts` covering boundaries, invalid input, and decimals.

### Code style

- DRY and separation of concerns: one reason to change per file; extract a function or constant the second time something repeats.
- Name variables and functions for what they mean (`currentInput`, `isAwaitingSecondInput`), never `x`, `tmp`, `res`.
- Always use braces and a new line for `if`; no single-line `if (...) return`.
- Separate clusters of statements (guards, derivations, return) with a blank line.
- Await into a named variable; never nest `await` inside an argument, as in `fn(await promise())`.
- Types use `import type` and live in `types/`; derive them from constants or schemas instead of repeating literals.

## Comments

Only comment code that's non-obvious and that need clarification related with the business logic, never explain what do code does. We write WHY, never HOW. Don't leave TODO comments.
