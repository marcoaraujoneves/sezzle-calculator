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

## Comments

Only comment code that's non-obvious and that need clarification related with the business logic, never explain what do code does. We write WHY, never HOW. Don't leave TODO comments.
