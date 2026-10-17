# Ratis Issue Template

Copy the block below into a GitHub issue. Fill every section. Ratis reads this body directly — missing or vague sections cause it to reject the issue and stop.

---

## Issue body

```markdown
## What
<!-- One sentence. What is changing and where. -->

## Why
<!-- One sentence. Why this change is needed. -->

## Scope
<!-- List the exact files this touches. 1–3 files max. -->
- `apps/ui/src/...`

## Acceptance criteria
<!-- Concrete, runnable checks. Each must be a command or observable output. -->
- [ ] `pnpm --filter @ratly/ui test` passes
- [ ] `pnpm --filter @ratly/ui build` exits 0

## Out of scope
<!-- What this issue explicitly does NOT cover. -->
```

---

## Rules for every field

**What** — names the component/module/file and the change. Not a goal. Not a user story.
- Bad: `Improve the dashboard experience`
- Good: `Add a totalBlocked stat card to DashboardContent using the existing useRateEvents hook`

**Why** — one sentence justifying the change. Skip if obvious from What.

**Scope** — exact file paths. If you don't know the path, search the codebase first. Ratis will also search, but explicit scope avoids misclassification.
- Max 3 files
- If the change touches more than 3 files, split into multiple issues

**Acceptance criteria** — every item must be runnable. Ratis executes these as commands or checks the observable output.
- Bad: `The feature works correctly`
- Bad: `UI looks good`
- Good: `pnpm --filter @ratly/ui test passes with no new failures`
- Good: `StatCard renders with label "Total Blocked" in Storybook`

**Out of scope** — prevents ratis from over-implementing. Always include at least one item.

---

## What disqualifies an issue

Ratis will reject and comment on the issue if:

| Problem | Example |
|---------|---------|
| Touches auth or security paths | Login, tokens, permissions |
| Requires infra changes | ENV vars, deployment config |
| Acceptance criteria are subjective | "looks good", "feels right" |
| Scope is more than 3 files with no pattern | Broad refactor |
| Context lives outside the codebase | Notion doc, Slack thread |
| No acceptance criteria | Empty or vague section |

---

## How to invoke ratis

Once the issue is created on GitHub, open Claude Code in this repo and say:

```
ratis <issue-number>
```

Ratis will:
1. Read the issue
2. Classify it (stops here if not-doable, posts a comment explaining why)
3. Show you the task spec and wait for your confirmation
4. Create a worktree, implement, verify, and ship a PR

The PR closes the issue automatically via `Closes #<N>` in the body.
