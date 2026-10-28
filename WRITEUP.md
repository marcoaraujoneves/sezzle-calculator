# Project Write Up

Hello, in this file I will describe the process for building this project, and try to maintain a repository of the technical rationale.

## Prompts persistence

I foresee I'll often clear the context or compact it along the way, since maintaining long conversations tend to worsen the output due to the model "attention", especially with the scope involving two different stacks (React and Go). Therefore, I chose to create a `PROMPTS.md` file with a template for the agent to follow and store a high-level summary of our conversation that allows backtracking the project execution.

## Project stack and initialization

I chose to maintain the suggested stack, and use the agents to setup the boilerplate I had in mind, mostly for React, since Go has most of what is necessary in the standard library.
Also, I'll deliver that with the Dockerfile, so the first step will be to build a minimal React shell that `GET`s the Go's `/healthz` endpoint and prints the result to the screen, running from the Docker container.

## Building the Frontend

The React UI is straightforward, we only need a grid of buttons, with the display and centralize that in the viewport when in desktop, extending to the viewport dimensions when on mobile. I chose to use `shadcn/ui` since its one of the most used libraries for speeding up the development of high-quality web components, having its core built with Base UI/Radix UI that ships accessible, customizable headless components.

The visuals for now will be minimal, until we finish the functionality.

**Note:** During that step, I noticed the agent used Vite's server proxy, so I took the change to replace it with a direct fetch to the Go server, which would be more suitable for production.

## First operations with Go

For the steps above, the Go server was already initialized, so handling operations will just build on top of that. I chose to create one endpoint for basic operators and other for advanced, just to exercise having multiple paths:

- `POST /basic-calculation` with `{ "operation": "sum", "first_input": 120, "second_input": 12 }`
- `POST /basic-calculation` with `{ "operation": "subtraction", "first_input": 120, "second_input": 12 }`
- `POST /basic-calculation` with `{ "operation": "multiplication", "first_input": 120, "second_input": 12 }`
- `POST /basic-calculation` with `{ "operation": "division", "first_input": 120, "second_input": 12 }`

To mimick normal calculators, I chose to clamp the digits size to 9, so this will be part of the validation. We also have some limitations on operating with different types in Go, so we must convert them to have consistent types. The operations themselves were simple, with only division requiring special treatment. I have't clamped the output, and will handle that in the UI.

The next step was integrating the basic operations with React by creating a new service. First, no validations on the client-side, so I got to see errors coming from Go and handle that gracefully. Then, a validation layer was included on the React as well, using Zod.

## Starting with the bonus operations

These will require a different validation for each:

- Square root: Can't accept negative numbers, and only have one operand
- Exponentiation: Can't accept decimals in the exponent
- Percentage: Don't have restrictions

I started with the square root to validate the new endpoint, and then extended to the exponentiation, and then percentage.

## Hardening

The first point was gracefully handling numbers that contained more than 9 digits, truncating decimals, and using the scientific notation for larger numbers.

The next, improving the code quality. On a greenfield project, the model output is generally not good in terms of practices, structure, separation of concerns, etc. We can solve this by both enforcing with CLAUDE.md and skills for writing the code, which can be great if we already have the shape in mind or want to follow some standard, or by just adding minimal guidance upfront and then steering the agent towards a better shape once we have the complete functionality, so we already know the components, services, types, etc., that must move around, persisting the resulting shape to CLAUDE.md and skills afterwards.

After completing this step for the frontend, I found a bug regarding the first point: the agent created the optimized representation of overflowing numbers, but these can't be reused as `Ans` for the backend. I'll get back to that after also refactoring the backend.

The backend refacor involved, besides code quality, a hardening around the type constraints for the range of representable numbers.

I decided to refactor on the limits of digits to prevent quickly reaching a blocked UX, since the backend and JSON payloads can handle larger inputs.
