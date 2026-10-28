# Calculator

A full-stack calculator: a React single-page app that performs every calculation on a Go microservice.

- **Live demo:** <https://sezzle.marcoaraujo.dev/>. It is deployed through [Render](https://render.com) and re-deployed automatically after each commit.
- **[WRITEUP.md](WRITEUP.md)** describes how the project was built and the technical rationale behind it.
- **[PROMPTS.md](PROMPTS.md)** lists the prompts used with the AI tooling, with a summary of what the agent did for each.

## Features

- Addition, subtraction, multiplication and division.
- Exponentiation, square root and percentage.
- Keyboard and numpad support, a loading state while the API answers, and friendly error messages.
- Responsive layout, from phones to desktops.

## Repository layout

| Path         | Contents                                                            |
| ------------ | ------------------------------------------------------------------- |
| `backend/`   | Go calculator service (standard library only)                       |
| `frontend/`  | React + TypeScript SPA (Vite, Tailwind CSS, shadcn/ui, zod, Vitest) |
| `Dockerfile` | Builds both and serves the SPA and the API from one container       |

## Requirements

- **Docker:** nothing else, or
- **Go** 1.27 or newer and **[Bun](https://bun.sh)** to run the two halves locally.

## Running with Docker

From the repository root:

```bash
docker build -t calculator .
docker run --rm -p 8080:8080 calculator
```

Open <http://localhost:8080>. The Go server serves the built SPA and the API on the same port, so no extra configuration is needed.

## Running locally

Start the backend:

```bash
cd backend
go run ./cmd/server
```

It listens on port `8080`. Then start the frontend in another terminal:

```bash
cd frontend
bun install
bun run dev
```

Open the URL Vite prints (<http://localhost:5173>). `frontend/.env.development` points the SPA at `http://localhost:8080`, and the backend must allow that origin:

```bash
CORS_ALLOWED_ORIGIN=http://localhost:5173 go run ./cmd/server
```

### Configuration

| Variable              | Where    | Default | Purpose                                                          |
| --------------------- | -------- | ------- | ---------------------------------------------------------------- |
| `PORT`                | backend  | `8080`  | Port the server listens on                                       |
| `CORS_ALLOWED_ORIGIN` | backend  | unset   | Origin allowed to call the API when the SPA is on another origin |
| `STATIC_DIR`          | backend  | unset   | Directory with the built SPA to serve at `/` (set in the image)  |
| `VITE_API_URL`        | frontend | empty   | API base URL; empty means same origin                            |

## Tests

```bash
# Backend, with the coverage report
cd backend
go test -race -cover ./...
go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out

# Frontend
cd frontend
bun run test
```

Other checks: `gofmt -l .` and `go vet ./...` in `backend/`; `bun run lint` and `bunx tsc -b` in `frontend/`.

## API

All requests and responses are JSON. A successful calculation answers `200` with `{ "result": <number> }`; a failure answers with `{ "error": "<message>" }`.

| Method | Path                     | Operations                                              |
| ------ | ------------------------ | ------------------------------------------------------- |
| `GET`  | `/healthz`               | Health check, answers `{ "status": "ok" }`              |
| `POST` | `/basic-calculations`    | `addition`, `subtraction`, `multiplication`, `division` |
| `POST` | `/advanced-calculations` | `square_root`, `exponentiation`, `percentage`           |

Body fields: `operation`, `first_input` and, except for `square_root`, `second_input`. Operands must be JSON numbers.

```bash
curl -X POST http://localhost:8080/basic-calculations \
  -d '{"operation":"addition","first_input":120,"second_input":12}'
# {"result":132}

curl -X POST http://localhost:8080/advanced-calculations \
  -d '{"operation":"square_root","first_input":144}'
# {"result":12}

curl -X POST http://localhost:8080/advanced-calculations \
  -d '{"operation":"exponentiation","first_input":2,"second_input":10}'
# {"result":1024}

# 20% of 150: the first input is the rate and the second the base
curl -X POST http://localhost:8080/advanced-calculations \
  -d '{"operation":"percentage","first_input":20,"second_input":150}'
# {"result":30}
```

### Errors

| Status | Cause                                                                         | Example `error`                                   |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `400`  | Division by zero                                                              | `division by zero`                                |
| `400`  | Square root of a negative number                                              | `square root of a negative number is not allowed` |
| `400`  | Non-integer exponent                                                          | `second_input must be an integer`                 |
| `400`  | Result outside the `float64` range (overflow)                                 | `result is too large to be represented`           |
| `400`  | Missing second operand, unknown operation, or an operand that is not a number | `second_input is required`                        |
| `405`  | Wrong HTTP method                                                             | `method not allowed`                              |
| `413`  | Body larger than 1 KiB                                                        | `request body too large`                          |

```bash
curl -X POST http://localhost:8080/basic-calculations \
  -d '{"operation":"division","first_input":1,"second_input":0}'
# 400 {"error":"division by zero"}
```

## Design decisions and assumptions

- **The backend owns the business rules.** Division by zero, negative square roots, integer exponents and overflow are decided by the API. The SPA only checks that an operation is selected and that each input parses as a number, then shows the backend's answer as a friendly message.
- **Two endpoints, by kind of operation.** Basic and advanced operations are split to keep each handler and its validation small. A shared `calculationHandler` decodes and answers every calculation, and `internal/httpjson` writes every response.
- **`float64` everywhere.** Answers are fed back as operands, so there is no digit limit on the API; only the request body size is bounded. The SPA caps typing at 15 digits, the range where a `float64` round-trips exactly, and shows long answers in scientific notation. Every operation that can overflow goes through `ensureRepresentable`, so `+Inf` is never encoded.
- **Standard library first on the backend.** `net/http`, table-driven tests, and no framework.
- **Presentational components on the frontend.** Components only render; logic lives in pure functions under `lib/`, which are unit-tested with Vitest. Constants, types, zod schemas and HTTP services each have their own folder.
- **One container.** The Dockerfile builds the SPA and the server, and the server serves both, which avoids CORS in production.
- **Percentage reads as "rate of base".** `20 % 150` means 20% of 150.
- **Out of scope.** Authentication, persistence, observability and end-to-end tests were left out given the size of the assignment. [WRITEUP.md](WRITEUP.md) discusses what a production setup would add.
