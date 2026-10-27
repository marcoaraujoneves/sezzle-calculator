# Prompts used to build the project

The lines below are automatically appended, summarizing the prompts used to build the project. The following format must be used by the agent:

```
## Prompt #[PROMPT_INDEX] - [TASK]

**Developer:**

**Agent:**
[COPY_OF_THE_DEVELOPERS_PROMPT]

> [SUMARY_OF_THE_AGENT_WORK]
```

The idea is having a backtrack of the project, so its important to understand each portion of the work as a task, and any steering performed in the middle of a task must be included in the work summary. Do NOT consider answers/refinements a new prompt index, but something to summarize in the quote block

---

## PROMPT #1 - Agents Setup

**Developer:**

Check the @PROMPTS.md file, there's a sample of how we should persist this conversation. The first entry will be the setup of the repo and agents steering.

- Create a backend and a frontend folders. The first will have only a Go package for a calculator microservice. The latter, a React SPA with TypeScript, shadcn/ui, Tailwind CSS, vite and vitest, built from the `bun create vite` and the TS template.
- We should create a .claude folder and initialize the work with a CLAUDE.md file containing a few directions for the chosen stack, starting with extremely minimal guidance.

**Agent:**

> Created `backend/` with only a Go module (`go mod init`) and a `doc.go` declaring package `calculator`. Scaffolded `frontend/` with `bun create vite --template react-ts`, then added Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (`shadcn init`, which added a `Button` and `cn` util), an `@` path alias, and Vitest with a `test` script. Steering: I had started installing jsdom and Testing Library, but the developer asked to limit Vitest to unit tests of functions and keep components presentational, so those were dropped, Vitest runs in the `node` environment and only matches `src/**/*.test.ts`. TypeScript 7 rejects `baseUrl`, so the alias uses `paths` only. Added `.claude/CLAUDE.md` with minimal stack guidance (Go, bun/React/shadcn, the Vitest scope rule and the PROMPTS.md logging convention). `bun run build` passes; there are no tests yet.
>
> Follow-up in the same prompt: the developer asked for a `/healthz` endpoint, a cleaned-up frontend showing only its result in a `<pre>`, and a Dockerfile running both services. Backend: `NewHandler()` in package `calculator` serves `GET /healthz` returning `{"status":"ok"}` (table-driven test included), plus `cmd/server/main.go`, which listens on `$PORT` (default 8080) and optionally serves a static directory from `$STATIC_DIR`. Frontend: removed the Vite demo (`App.css`, assets, `icons.svg`); `App` only renders a `<pre>` with the result of `useHealth()`, which wraps the plain `fetchHealth` function (unit-tested with Vitest using a stubbed `fetch`); the Vite dev server proxies `/healthz` to `:8080`. Dockerfile: multi-stage build (bun builds the SPA, Go builds the server, distroless runtime) where the single Go process serves both the API and the built SPA, so one container runs both services. Steering: the developer rejected the Go module path I had invented and asked for it to be just `sezzle-calculator`, so `go.mod` and the imports were updated. Go and Vitest tests and the frontend build pass; the Docker image was not built because Docker was not checked/run.
