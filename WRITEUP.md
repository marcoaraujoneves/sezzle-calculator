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
