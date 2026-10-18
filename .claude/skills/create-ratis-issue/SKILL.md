---
name: create-ratis-issue
description: Create a GitHub issue pre-validated for ratis execution. Takes a rough
  description, infers title and all template sections, resolves ambiguities with the
  user, assembles into the fixed template format, runs the doability gate, and creates
  the issue. Use when asked to "create a ratis issue", "open an issue for ratis", or
  "file an issue for ratis to handle".
---

# Create Ratis Issue

## Purpose

Turn a rough description into a well-formed GitHub issue ratis can act on. The skill
infers what it can, asks targeted questions for what it cannot, and assembles the
result into the fixed template format before creating the issue.

The template format is fixed — all five sections always appear in every issue:
`## What`, `## Why`, `## Scope`, `## Acceptance criteria`, `## Out of scope`.

## Input

A rough description from the user — any level of detail. If no description is provided → ask once. If still not provided → STOP.

## Steps

### Step 1: Extract and Infer

From the user's description, infer:

| Field | How to infer |
|-------|-------------|
| `title` | Imperative phrase, ≤70 chars, describes the change precisely |
| `what` | What is changing and where — specific component/file/behavior |
| `why` | Why this change is needed — omit if obvious from `what` |
| `scope` | Search the codebase to locate exact file paths (1–10 files). If found confidently, use them. If ambiguous, flag for Step 2. |
| `acceptance` | Derive from what "done" looks like — concrete, runnable checks (commands or observable outputs). If cannot be derived, flag for Step 2. |
| `out_of_scope` | Infer what adjacent things this change should NOT touch. If none obvious, flag for Step 2. |

**Scope search**: run codebase search to locate the relevant files before asking the user.
Only ask if the search returns ambiguous results or nothing.

Mark each field as either `confident` or `needs_clarification`.

### Step 2: Resolve Ambiguities

For each field marked `needs_clarification`, ask the user **one targeted question at a time**.
Wait for the answer before asking the next question.

Do not ask about a field if it is already `confident`.

Examples of targeted questions:
- Scope ambiguous: "I found two candidates for this — `apps/ui/src/modules/dashboard/components/DashboardContent/index.tsx` and `apps/ui/src/modules/dashboard/hooks/useRateEvents.ts`. Which files are in scope?"
- Acceptance unclear: "What should be verifiable once this is done — a test passing, a specific render output, a build exit code?"
- Out of scope missing: "What adjacent things should this change explicitly NOT touch?"

After each answer, update the field to `confident` and proceed to the next flagged field.
If the user's answer is still ambiguous, ask one follow-up before moving on.

### Step 3: Assemble Draft

Assemble all fields into the fixed template format:

```markdown
## What
<what>

## Why
<why, or omit this section if why is obvious from what>

## Scope
<one file path per line, prefixed with - and backtick-quoted>

## Acceptance criteria
<one runnable check per line, as a checkbox: - [ ] ...>

## Out of scope
<one item per line>
```

Show the assembled draft to the user with a proposed title above it:

```
Title: <title>

---
<assembled body>
---

Confirm this, or tell me what to change.
```

### Step 4: Human Confirmation Loop

Wait for the user to respond.

- **Confirmed** → proceed to Step 5
- **Change requested** → update only the affected sections, show the full draft again. Repeat until confirmed.
- **STOP requested** → STOP. Do not create the issue.

Do not proceed past this step without explicit confirmation.

### Step 5: Run Doability Gate

Invoke the `ratis-classify` skill with:
- `title`: the confirmed title
- `description`: the full confirmed body (all sections)

Wait for full output: CLASSIFICATION, REASON, FAILED_CRITERIA.

If `not-doable`:
- Show: REASON and FAILED_CRITERIA
- Tell the user which section of the template caused the failure
- Offer to revise — if user wants to revise, return to Step 4 with the flagged section highlighted
- If user declines revision → STOP

If `doable` → proceed to Step 6.

### Step 6: Ensure "ratis" Label Exists

Run:
```bash
gh label list --json name | grep -q '"ratis"'
```

If label does not exist, create it:
```bash
gh label create ratis --description "Assigned to ratis autonomous agent" --color "0075ca"
```

If creation fails → STOP. Show exact error.

### Step 7: Create Issue

Run:
```bash
gh issue create \
  --title "<confirmed title>" \
  --body "<confirmed body>" \
  --label "ratis"
```

Capture output. Extract issue URL and number.

If command fails → STOP. Show exact error. Do not retry.

### Step 8: Verify Label

Run:
```bash
gh issue view <number> --json labels --jq '.labels[].name'
```

Verify `ratis` appears in the output.

If missing → STOP. Report: "Issue created but ratis label missing. Manual fix: `gh issue edit <number> --add-label ratis`"

### Step 9: Report

Show the user:
- Issue title
- Issue URL
- "Ready for ratis — invoke with: `ratis <number>`"

## Rules

- Never skip Step 4 — explicit user confirmation is required before classify runs
- Never run classify on a draft the user has not confirmed
- Never create an issue that failed the classify gate
- Never create an issue without verifying the ratis label afterward
- Never ask more than one clarifying question at a time
- Always search the codebase before asking the user about scope
- Never retry a failed `gh issue create` — surface the error and stop
- Template format is fixed — all five sections always appear, in order
- If `## Why` is genuinely obvious from `## What`, it may be omitted from the body
