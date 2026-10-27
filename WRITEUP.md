# Project Write Up

Hello, in this file I will describe the process for building this project, and try to maintain a repository of the technical rationale.

## Prompts persistence

I foresee I'll often clear the context or compact it along the way, since maintaining long conversations tend to worsen the output due to the model "attention", especially with the scope involving two different stacks (React and Go). Therefore, I chose to create a `PROMPTS.md` file with a template for the agent to follow and store a high-level summary of our conversation that allows backtracking the project execution.
