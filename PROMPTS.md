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

## PROMPT #2 - Calculator UI

**Developer:**

Lets now create the calculator UI. We must build the Buttons, ButtonsGrid, and other necessary UI base elements in src/components/base folder. The styling is not important now. Take into consideration these instructions:

- Include accessibility tags like aria-label, announcement, semantic HTML tags, proper usage of <header>, <main>, <footer>
- Each component must have its properties typed in an `interface` in the component file, never use assertions
- Include the buttons for all operations in @ASSESSMENT.md, but no actions for now
- Responsiveness: you must draft the UI as a mobile-sized calculator centralized in the screen. As the viewport shrinks, only the empty container space will reduce. On mobile viewports, the calculator should fill in the width.

**Agent:**

> Added `Button`, `ButtonGrid` and `Display` under `src/components/base/`, each with a props `interface` and no type assertions, plus `src/components/Keypad.tsx`, which builds the keys from a typed list: digits, decimal point, clear, backspace, equals and all seven operations from the assessment (add, subtract, multiply, divide, power, square root, percent). The buttons have no handlers yet. `Button` takes a required `ariaLabel` so symbols such as "÷" are spoken as "Divide"; `ButtonGrid` is a labelled `role="group"`; `Display` renders the expression and an `<output>` plus a visually hidden `role="status"` line for announcements. `App` now wraps the display and keypad in `<header>`, `<main>` and `<footer>`, inside a `max-w-sm` column centred on the screen that fills the width and height on phones. It replaced the `useHealth` probe in `App`, so the hook is currently unused. Steering: I started reading several config files to learn the conventions, and the developer interrupted because I was reading more than necessary, so I limited myself to `App.tsx` and the `components/ui` listing. The developer then asked that lint and prettier run after each batch of writes and that this be recorded in `CLAUDE.md`, so I added that rule under Workflow and ran `bunx prettier --write src` and `bun run lint` (prettier reformatted the new files and several existing ones; the only lint warning is in the shadcn `ui/button.tsx`). Two refinements followed in the same task. First, the developer asked to drop the `cn` npm package in favour of `clsx` plus `tailwind-merge`, so `src/lib/utils.ts` now defines `cn` from those two and the shadcn and base buttons use it. Second, the developer asked to refactor `useHealth` around two folders: `src/services/` holds the code that talks to the Go API (`services/health.ts` performs the `/healthz` request and returns a typed `HealthResponse`), and `src/lib/` holds only pure helper functions that receive all their input and return their output, each with unit tests (`formatHealth`, `httpErrorMessage`, `errorMessage`). The hook composes them. The old `fetchHealth` test that stubbed `fetch` was replaced by tests of the pure helpers, so the request itself is no longer unit-tested. A third refinement: the developer did not want the Vite proxy, so the browser now calls the Go service directly. The proxy was removed from `vite.config.ts`; `services/config.ts` reads `VITE_API_URL` (set to `http://localhost:8080` in `frontend/.env.development` and empty in production builds, where the Go server also serves the SPA and relative URLs stay same-origin); a pure `joinUrl` helper in `lib/url.ts` builds the request URL. Because the origins now differ, the backend gained a `WithCORS` middleware (`backend/cors.go`, table-driven tests) that only allows the origin in the `CORS_ALLOWED_ORIGIN` environment variable, answers preflights itself, and is disabled when the variable is empty. The existing `TestHealthz` fails because `healthz` returns `not-ok`; that was already the case on disk and was left untouched.
