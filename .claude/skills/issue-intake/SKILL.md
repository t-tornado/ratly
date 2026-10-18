---
name: issue-intake
description: Fetch a GitHub issue, classify it as AI-doable or not, and produce a
  task spec at .agent-runs/issue-<number>/task.json. Use when starting work on an
  issue or when asked to "take issue <N>", "pick up issue <N>", or "intake issue <N>".
---

# Issue Intake

## Constants

| Name | Value |
|------|-------|
| `RUNS_DIR` | `.agent-runs` |
| `RUN_DIR` | `.agent-runs/issue-<number>` |
| `TASK_FILE` | `.agent-runs/issue-<number>/task.json` |

## Steps

### Step 1: Fetch Issue

Run:
```bash
gh issue view <number> --json number,title,body,labels,url
```

If the command fails (non-zero exit, auth error, issue not found) → STOP. Show the exact error. Do not proceed.

Capture: `number`, `title`, `body`, `url`, `labels`.

**Label gate** — check that `labels` contains an entry with `name` equal to `"ratis"`.

If `ratis` label is absent → STOP immediately. Do not classify. Do not write any files. Show:

```
This issue was not created for ratis. Only issues tagged with the "ratis" label
can be actioned by ratis.

To create a ratis-ready issue, use the create-ratis-issue skill.
```

### Step 2: Classify

Read `.claude/skills/ratis-classify/SKILL.md` in full. Apply every criterion against the fetched `title` and `body`. Produce the classification output as defined in that skill.

If output does not contain CLASSIFICATION, REASON, and FAILED_CRITERIA → STOP. Classify did not complete.

### Step 3: Stop If Not Doable

If `not-doable`:
1. Create `RUN_DIR` if needed
2. Post a comment on the GitHub issue:
   ```bash
   gh issue comment <number> --body "Unable to action this issue automatically.

   **Reason:** <which criteria failed and why>

   **Run ID:** issue-<number>"
   ```
   If this command fails, warn the user that the comment could not be posted and show the error — but still proceed to STOP.
3. Show the user: classification, reason, and which criteria failed
4. STOP — do not produce a task file

### Step 4: Extract Task Spec

Derive the following from the issue title, body, and codebase:

**Branch name** — follow `.claude/rules/branching.md`:
- Format: `<type>/<short-description>` (lowercase, kebab-case, max 50 chars)
- Derive type from issue labels or content (`feat`, `fix`, `chore`, etc.)

**Scope** — list of files or directories affected. If not explicit in the issue:
- Search the codebase to locate the relevant files
- If files cannot be confidently located → STOP. Ask the user to specify scope before continuing.
- List the 1–3 most likely files; do not guess broadly

**Steps** — ordered list of implementation steps derived from the issue body.
Each step:
```json
{ "id": 1, "description": "...", "verify": "..." }
```
`verify` is a concrete check (e.g. "pnpm test passes", "file X exists", "endpoint returns 200").

**Acceptance** — copy every acceptance criterion from the issue body verbatim. One entry per checkbox or bullet. Do not filter, reword, or drop any criterion — every item the issue lists must appear in this array. If the issue has no explicit criteria, infer from scope and change type.

### Step 5: Write Task File

Before writing, validate:
- `steps` is non-empty — if empty, STOP. Tell the user no implementation steps could be derived from the issue.
- Every step has a non-empty `verify` — if any step is missing `verify` or it is blank, STOP. Ask the user to clarify how that step should be verified.
- `acceptance` is non-empty — if empty, STOP. Tell the user no acceptance criteria could be derived.
- `branch` matches format `<type>/<short-description>` (lowercase, kebab-case) — if not, STOP and fix before writing.

Create `RUN_DIR` if needed. Write `TASK_FILE`:

```json
{
  "issue": {
    "number": 42,
    "title": "...",
    "url": "..."
  },
  "classification": "doable",
  "branch": "feat/short-name",
  "scope": ["apps/ui/src/...", "..."],
  "steps": [
    { "id": 1, "description": "...", "verify": "..." }
  ],
  "acceptance": [
    "pnpm --filter @ratly/ui build exits 0",
    "..."
  ]
}
```

After writing, verify `TASK_FILE` exists on disk — if not, STOP with the write error.

### Step 6: Report

Show the user:
- Issue title + URL
- Classification: doable
- Branch: `<branch>`
- Scope: list of files
- Steps: numbered list
- Acceptance: checklist

Ask the user to confirm before proceeding to implementation.

## Rules

- Never write a task file for a `not-doable` issue
- Always post a GitHub comment before stopping on `not-doable` — the run ID must be in the comment
- Never guess scope broadly — locate files or ask
- Always confirm with the user after Step 6 before any code changes
- Branch name must follow `.claude/rules/branching.md` exactly
- `verify` in each step must be concrete and runnable — not "make sure it works"
