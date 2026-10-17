---
name: ratis-classify
description: Classify a proposed issue as ratis-doable or not-doable. Applies all
  doability criteria against a title and description. Returns classification and reason.
  Used by create-ratis-issue (invoked) and issue-intake (read and applied).
---

# Ratis Classify

Standalone doability gate. Takes a title and description (or fetched issue body).
Applies every criterion. Produces a classification result.

## Input

| Field | Required | Source |
|-------|----------|--------|
| `title` | yes | caller provides |
| `description` | yes | caller provides (free text or issue body) |

If either is missing or blank → STOP. Report: "classify requires both title and description."

## Criteria

Apply ALL criteria. Issue is `doable` only when every condition holds.

**Scope**
- Change is code-only — no infra changes, no design decisions, no cross-team coordination
- Scope is 1–3 files or a clear repeatable pattern
- "Done" state is unambiguous from the description

**Verifiability**
- Can be confirmed by: tests pass, build passes, or a specific output exists on disk
- No subjective "looks good" judgement calls required

**Context**
- All needed context exists in the codebase — no tribal knowledge, no external credentials required

**Risk**
- Does not touch auth, secrets, or security-critical paths
- Reversible by reverting the PR

## Output

Produce a classification block. Do not skip or abbreviate.

```
CLASSIFICATION: <doable | not-doable>
REASON: <one sentence — which criterion failed, or "all criteria pass">
FAILED_CRITERIA: <comma-separated list of failed criteria keys, or "none">
```

Criteria keys: `scope.code-only`, `scope.size`, `scope.done-state`, `verifiability`, `context`, `risk.auth`, `risk.reversible`

If `not-doable` → list every failed criterion, not just the first.

## Rules

- Classify against the description as given — do not assume missing information fills gaps
- A vague "done" state alone is sufficient to classify `not-doable`
- Do not negotiate criteria — each is a hard binary pass/fail
- Output must contain all three fields: CLASSIFICATION, REASON, FAILED_CRITERIA
