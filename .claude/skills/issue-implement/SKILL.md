---
name: issue-implement
description: Implement a classified issue from its task spec. Reads task.json produced
  by issue-intake, implements each step in order, verifies each step, and commits.
  Use when asked to "implement issue <N>", "work on issue <N>", or called by ship-issue.
---

# Issue Implement

## Pairs with

| Skill | Role |
|-------|------|
| `issue-intake` | Before — produces `TASK_FILE` this skill reads |
| `commit` | Called in Step 4 to commit the work |
| `create-pr` | After — reads step proof files this skill writes |

## Constants

| Name | Value |
|------|-------|
| `RUN_DIR` | `.agent-runs/issue-<number>` (from `TASK_FILE`) |
| `TASK_FILE` | `.agent-runs/issue-<number>/task.json` |

## Steps

### Step 0: Preflight

1. Confirm `TASK_FILE` exists — if missing, STOP. Tell user to run `issue-intake` first.
2. Read `TASK_FILE`. Extract: `issue.number`, `branch`, `scope`, `steps`, `acceptance`, `classification`.
3. Confirm `classification === "doable"` — if not, STOP. This task was marked not-doable and must not be implemented.
4. Run `git branch --show-current` — confirm it matches `task.json.branch`.
   - If mismatch: STOP. Show current branch and expected branch. Do not proceed.
5. Display to user:
   - Issue title + URL
   - Branch
   - Scope: list of files
   - Steps: numbered list with verify commands
   - Acceptance: checklist

### Step 1: Read Scope

Verify every file listed in `task.json.scope` exists on disk — if any file is missing, STOP. Show the missing path and ask the user to update the scope.

Read every file. Understand existing patterns, types, naming conventions, and exports.
Do not skip this — changes must follow existing code patterns.

### Step 2: Implement Steps

For each step in `task.json.steps`, in order:

1. Make the change described in `step.description`
2. Run the `step.verify` command. Capture exit code and output.
3. Write proof file `RUN_DIR/step-<id>.json`:

```json
{
  "id": 1,
  "name": "<step description>",
  "status": "pass",
  "checks": [
    {
      "description": "<step.verify command>",
      "status": "pass",
      "output": "<captured output or summary>"
    }
  ]
}
```

4. If `step.verify` exits non-zero:
   - Write proof with `"status": "fail"`
   - STOP. Show the failed check and its full output.
   - Do not proceed to the next step.

Before Step 3: verify every `step-<id>.json` file exists in `RUN_DIR` — one per step id in `task.json.steps`. If any is missing, STOP. The step did not complete cleanly.

### Step 3: Run Acceptance

Run each check in `task.json.acceptance` in order. Capture exit code and output for each.

If ALL pass: write `RUN_DIR/acceptance.json`:

```json
{
  "status": "pass",
  "checks": [
    { "description": "...", "status": "pass", "output": "..." }
  ]
}
```

If ANY fail:
- Write `acceptance.json` with `"status": "fail"` and the failing check marked
- STOP. Show which check failed and its full output.

### Step 4: Commit

Call the `commit` skill. All changes from Step 2 are committed together.
If commit fails → STOP. Show the error. Do not proceed to report.

### Step 5: Report

Show:
- Issue title + URL
- N/N steps passed
- N/N acceptance checks passed
- `RUN_DIR`: `<path>` (for `create-pr` reference)

## Rules

- Always read scope files before writing — never modify code you haven't read
- Never skip a step's verify — the output is the proof
- Never proceed past a failing verify or failing acceptance check
- Never call `commit` if any step or acceptance check failed
- Step proof files must exist for every step before reporting done
- Follow all rules in `.claude/rules/coding-guidelines.md` for any code written
