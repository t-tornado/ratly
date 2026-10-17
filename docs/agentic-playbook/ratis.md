# Ratis

Ratis is the autonomous issue agent for Ratly. Give it a GitHub issue number — it classifies, implements, and ships a PR with proof. No manual steps.

## How to invoke

Open Claude Code in this repo and say:

```
ratis 42
```

Or:

```
let ratis take issue 42
ship issue 42
ratis fix 42
```

Ratis needs an issue number. If you don't provide one, it asks once — then stops.

## What ratis does

### Phase 1 — Intake

Ratis reads the issue from GitHub, applies doability criteria, and either:

- **Classifies as doable** → writes a task spec to `.agent-runs/issue-<N>/task.json`, shows it to you, and waits for confirmation before touching any code.
- **Classifies as not-doable** → posts a comment on the GitHub issue explaining which criterion failed, then stops.

You review and confirm the task spec before implementation starts. This is the one human checkpoint.

### Phase 2 — Worktree

Creates an isolated git worktree at `worktrees/<branch>` branched from `main`. All implementation work happens inside this worktree.

### Phase 3 — Implement

Executes each step from the task spec in order. After each step it runs the `verify` command and writes a proof file. If any verify fails, ratis stops and shows you the exact output. Nothing is committed until all steps and acceptance checks pass.

### Phase 4 — PR

Runs quality gates (build, tests, guards). If all pass, pushes the branch and opens a PR on GitHub with:
- Summary of changes
- Gate report (pass/fail per gate)
- Step-by-step proof (expandable)
- `Closes #<N>` so the issue auto-closes on merge

## Doability criteria

Ratis classifies an issue as doable only when **all four** conditions hold:

| Criterion | Requirement |
|-----------|-------------|
| **Scope** | Code-only change, 1–3 files or a clear repeatable pattern, unambiguous done state |
| **Verifiability** | Confirmed by tests passing, build passing, or a specific output — no subjective judgement |
| **Context** | All needed context is in the codebase — no tribal knowledge, no external credentials |
| **Risk** | Does not touch auth or security-critical paths, reversible by reverting the PR |

If any condition fails, ratis posts a comment on the issue and stops. See [writing-issues.md](./writing-issues.md) to learn how to write issues that pass all four.

## Hard gates

Ratis will not proceed past any of these:

- Issue not found on GitHub
- Scope cannot be located in codebase
- No implementation steps derived
- Any step missing a `verify` command
- No acceptance criteria
- Branch name does not match `<type>/<desc>` format
- Worktree creation fails
- Any step verify exits non-zero
- Any acceptance check fails
- Any quality gate (build/test) fails
- PR body missing `Closes #<N>`

These are not warnings — ratis stops, shows the exact error, and waits.

## Resuming a stopped run

Ratis does not re-run completed phases. If it stopped in Phase 3, fix the issue and re-invoke. It reads the existing `task.json` and picks up from the failed phase.

If `task.json` is missing, run intake first:

```
intake issue 42
```

## Artifacts

| Path | What it is |
|------|-----------|
| `.agent-runs/issue-<N>/task.json` | Task spec (classification, steps, acceptance) |
| `.agent-runs/issue-<N>/step-<id>.json` | Proof for each implementation step |
| `.agent-runs/issue-<N>/acceptance.json` | Acceptance run result |
