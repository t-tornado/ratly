# Agentic Playbook

Ratly uses a set of Claude Code skills and an autonomous issue agent called **ratis**. This playbook tells you what's automated, how to trigger it, and how to write work so agents can act on it.

## What's automated

| What you want                   | How to do it                               |
| ------------------------------- | ------------------------------------------ |
| Ship a GitHub issue end-to-end  | [Use ratis](./ratis.md)                    |
| Write an issue ratis can act on | [Issue writing guide](./writing-issues.md) |
| Look up all available skills    | [Skills reference](./skills.md)            |

## The agent system

```
GitHub Issue
     │
     ▼
  intake          ← classifies issue, produces task spec
     │
     ▼
 worktree         ← isolated branch from main
     │
     ▼
 implement        ← executes steps, verifies each one
     │
     ▼
  create-pr       ← runs gates, ships PR with proof
```

Ratis orchestrates this entire chain. Individual skills can also be triggered standalone.

## What agents cannot do

- Auth or security-critical changes
- Infrastructure or deployment changes
- Design decisions or cross-team coordination
- Anything requiring credentials not in the codebase
- Issues with vague or unverifiable acceptance criteria

When ratis cannot act, it posts a comment on the issue explaining why and stops. A human takes it from there.

## Where things live

| Path              | What it is                                   |
| ----------------- | -------------------------------------------- |
| `.claude/skills/` | Skill definitions (runtime, not for editing) |
| `.claude/rules/`  | Coding, branching, and structure rules       |
| `.agent-runs/`    | Output from agent runs (gitignored)          |
| `docs/agents/`    | This playbook                                |
