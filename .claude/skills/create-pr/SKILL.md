---
name: create-pr
description: Run all pre-PR quality gates (build, tests, guards, types), collect results
  into a gate report, and create a GitHub PR with the gate output embedded. Use when
  the user says "create pr", "open pr", "pr time", "ship it", or wants to push and
  open a pull request.
---

# Create PR

## Prerequisites

- On a feature branch (not `main`)
- All changes committed (clean working tree)
- Task has a `RUN_DIR` with step verification JSON files (if task-driven)

## Constants

| Name | Value |
|------|-------|
| `UI_FILTER` | `--filter @ratly/ui` |
| `SERVER_FILTER` | `--filter @ratly/server` |

## Steps

### Step 1: Pre-flight

1. Run `git status` — confirm working tree is clean. If dirty, STOP and tell the user to commit first.
2. Run `git branch --show-current` — confirm not on `main`. If on main, STOP.
3. Run `git log main..HEAD --oneline` — collect commit list for the PR body.
4. Determine which apps are affected:
   - `git diff main...HEAD --name-only` — scan paths
   - If `apps/ui/` changed → UI gates apply
   - If `apps/server/` changed → server gates apply
   - If both → both gates apply

### Step 2: Run Gates

Run all applicable gates. Collect results into a gate report structure:

```json
{
  "gates": [
    { "name": "<gate>", "command": "<cmd>", "status": "pass" | "fail", "output": "<summary>" }
  ]
}
```

**UI gates** (if UI changed):

| Gate | Command | Pass condition |
|------|---------|----------------|
| Build | `pnpm --filter @ratly/ui build` | Exit code 0 |
| Tests | `pnpm --filter @ratly/ui test` | Exit code 0 |
| Guards | `pnpm --filter @ratly/ui test:guards` | Exit code 0 |

**Server gates** (if server changed):

| Gate | Command | Pass condition |
|------|---------|----------------|
| Build | `pnpm --filter @ratly/server build` | Exit code 0 |
| Tests | `pnpm --filter @ratly/server test` | Exit code 0 |

Run independent gates in parallel where possible.

### Step 3: Collect Task Gate (if applicable)

If the current task has a `RUN_DIR` (check for `.agent-runs/issue-<N>/task.json` matching the branch, or ask the user):

1. Glob all `RUN_DIR/step-*.json` files
2. Read each step JSON and collect into an acceptance criteria table:

```markdown
| Step | Name | Status | Checks passed | Detail |
|------|------|--------|---------------|--------|
| 1 | Custom Errors | pass | 5/5 | All exports verified |
| 2 | Shared Types | pass | 4/4 | — |
```

If any step has `"status": "fail"`, STOP. Tell the user which step failed and what check failed. Do not create the PR.

3. If `RUN_DIR/screenshots.json` exists:
   - Read it: `{ "sha": "<SCREENSHOTS_SHA>", "files": [...] }`
   - Run `gh repo view --json owner,name` to get `owner` and `repo`
   - Build raw URL for each file: `https://raw.githubusercontent.com/<owner>/<repo>/<SCREENSHOTS_SHA>/<file>`
   - Collect into a screenshots map: `{ criterion → url }`

### Step 4: Gate Check

- If ALL gates pass → proceed to Step 5
- If ANY gate fails → STOP. Show which gate failed with its output. Do not create the PR.

### Step 5: Push and Create PR

1. Push branch: `git push -u origin <branch>`

2. Build the PR body using this template:

```markdown
## Summary

<1-3 bullet points describing what this PR does, derived from commit messages>

## Gate Report

### Quality Gates

| Gate | Command | Status |
|------|---------|--------|
| UI Build | `pnpm --filter @ratly/ui build` | pass |
| UI Tests | `pnpm --filter @ratly/ui test` | pass |
| UI Guards | `pnpm --filter @ratly/ui test:guards` | pass |

### Acceptance Criteria

<Every criterion from task.json.acceptance listed verbatim, with pass/fail status>

| # | Criterion | Status |
|---|-----------|--------|
| 1 | <verbatim criterion text from issue> | ✅ pass |
| 2 | ... | ✅ pass |

<details>
<summary>Step verification details</summary>

<for each step JSON file, render the checks array as a checklist>

**Step N — <name>**
- [x] <check description>
- [x] <check description>

</details>

## Screenshots

<Only present if RUN_DIR/screenshots.json exists. One row per screenshot criterion.>

| Criterion | Preview |
|-----------|---------|
| <criterion text> | ![<slug>](<raw.githubusercontent.com URL using SCREENSHOTS_SHA>) |

<If no screenshots: omit this section entirely.>

## Test Plan

<bulleted checklist of manual verification steps>
```

3. Create PR:
   ```bash
   gh pr create --title "<title>" --body "<body>"
   ```
   - Title: derived from branch name, under 70 chars
   - Use HEREDOC for body to preserve formatting

### Step 6: Report

- Show the PR URL to the user
- Show gate summary: N/N passed

## Rules

- Never create a PR with failing gates
- Never create a PR from a dirty working tree
- Never create a PR on main
- Never skip the gate report in the PR body
- If no task gate exists, still run quality gates and include them
- Always push before creating the PR
- Gate output is the proof — include it, don't summarize it away
