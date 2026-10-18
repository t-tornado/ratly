---
name: code-review
description: Review local branch changes against main for logic breaks and coding rule
  violations. Produces a structured markdown report in .agent-runs/. Use when the user
  says "review", "code review", "review my changes", "check my code", or wants to
  validate local changes before committing or opening a PR.
---

# Code Review

Review all local changes on the current branch against `main`. Produce a structured report covering logic integrity and coding rule compliance.

## Constants

| Name | Value |
|------|-------|
| `RUNS_DIR` | `.agent-runs` |
| `RULES_DIR` | `.claude/rules` |
| `REPORT_FILE` | `report.md` |

## Rule Matchers

Each changed file is checked against rules based on its path. A file can match multiple matchers — all matched rules apply.

| Path pattern | Rules |
|-------------|-------|
| `apps/server/**` | `server-structure.md`, `coding-guidelines.md` |
| `apps/ui/src/components/**` | `ui-components.md`, `ui-structure.md`, `coding-guidelines.md` |
| `apps/ui/src/modules/**/hooks/**` | `ui-hooks.md`, `ui-structure.md`, `coding-guidelines.md` |
| `apps/ui/src/modules/**/components/**` | `ui-components.md`, `ui-structure.md`, `coding-guidelines.md` |
| `apps/ui/src/modules/**/utils/**` | `ui-structure.md`, `coding-guidelines.md` |
| `apps/ui/src/modules/**/types/**` | `ui-structure.md`, `coding-guidelines.md` |
| `apps/ui/src/**/route*` or `**/router*` | `frontend-routing.md`, `coding-guidelines.md` |
| `apps/ui/**` (catch-all) | `ui-structure.md`, `coding-guidelines.md` |
| `packages/core/**` | `packages.md`, `coding-guidelines.md` |
| Any file not matched above | `coding-guidelines.md` |

## Steps

### Step 0: Initialize

1. Get current branch:
   ```bash
   git branch --show-current
   ```
   If on `main` → STOP. Nothing to review.

2. Get timestamp:
   ```bash
   date -u +%Y-%m-%dT%H-%M
   ```

3. Compute `RUN_ID`:
   - Take the branch name, replace `/` with `-`
   - Format: `review-<sanitized-branch>-<timestamp>`
   - Example: `review-refactor-ui-extract-polish-2026-10-18T14-30`

4. Set `RUN_DIR` = `RUNS_DIR/<RUN_ID>`

5. Create `RUN_DIR`.

6. Get the diff:
   ```bash
   git diff main...HEAD --name-only
   ```
   This is `CHANGED_FILES`. If empty → STOP. No changes to review.

7. Read every rule file in `RULES_DIR` referenced by the matchers above. Load them into context now — you will need them for Steps 2 and 3.

### Step 1: Logic Review

For each file in `CHANGED_FILES`:

1. Read the full diff for that file:
   ```bash
   git diff main...HEAD -- <file>
   ```

2. Read the full current version of the file.

3. **Trace the change** — identify what functions, types, exports, or APIs were modified. For each modification:
   - Find all callers / consumers of the changed code within the codebase (grep for imports, function calls, type references)
   - Check: does the new signature, return type, or behavior break any caller?
   - Check: does removed or renamed code leave dangling references?
   - Check: does changed control flow (early returns, new conditions, reordered logic) alter behavior for existing callers?

4. Record each finding as:
   ```
   { file, line, severity, description, impact }
   ```
   - `severity`: `error` (breaks callers), `warning` (may break under certain conditions), `info` (notable change, not breaking)
   - `impact`: which callers or consumers are affected

If no logic issues found for a file, record nothing — do not generate filler entries.

### Step 2: Rule Review (Scoped)

For each file in `CHANGED_FILES`:

1. Determine which rules apply using the Rule Matchers table above.

2. Read the full current version of the file (if not already in context from Step 1).

3. Check the file against **every rule** in each matched rule file. Go through the rules systematically — do not skim.

4. For each violation found, record:
   ```
   { file, line, rule_file, rule, severity, description, suggestion }
   ```
   - `severity`: `error` (clear violation), `warning` (borderline / should fix)
   - `rule_file`: which rule file (e.g. `ui-hooks.md`)
   - `rule`: the specific rule violated (e.g. "No pure functions in hook files")
   - `suggestion`: concrete fix — what to move, rename, or restructure

Only flag violations in changed/added code. Do not flag pre-existing issues in unchanged lines.

### Step 3: Cross-Check (General)

After all files are individually reviewed, run these cross-cutting checks across the full changeset:

1. **Import hygiene** — are new imports grouped correctly (external → internal → relative)? Any wildcard imports introduced?

2. **Scope placement** — is new code placed at the correct scope? Module-scoped code not leaking to shared, shared code not in a module, cross-app code properly in `packages/core`?

3. **Naming consistency** — do new names follow the naming conventions? Variables meaningful, booleans prefixed, collections plural, functions describing their action and subject?

4. **Type safety** — any new `any` types? Any missing prop types? Any untyped function parameters?

5. **Error handling** — any empty catch blocks? Any silently swallowed errors?

6. **Dead code** — any commented-out code? Any unused imports or variables introduced?

Record violations in the same format as Step 2, with `rule_file: "coding-guidelines.md"` and the specific rule.

### Step 4: Write Report

Write `RUN_DIR/REPORT_FILE` using this template:

```markdown
# Code Review Report

**Branch:** <branch>
**Base:** main
**Date:** <timestamp>
**Run ID:** <RUN_ID>
**Files reviewed:** <count>

---

## Summary

| Category | Errors | Warnings | Info |
|----------|--------|----------|------|
| Logic    | N      | N        | N    |
| Rules    | N      | N        | —    |
| Cross-check | N   | N        | —    |
| **Total** | **N** | **N**    | **N** |

**Verdict:** <CLEAN | HAS WARNINGS | HAS ERRORS>

---

## Logic Review

<If no findings: "No logic issues detected.">

<For each finding, grouped by file:>

### `<file>`

| Line | Severity | Description | Impact |
|------|----------|-------------|--------|
| L<n> | error    | ...         | ...    |

---

## Rule Violations

<If no findings: "No rule violations detected.">

<For each finding, grouped by file:>

### `<file>`

| Line | Rule | Violation | Fix |
|------|------|-----------|-----|
| L<n> | `<rule_file>` > <rule name> | ... | ... |

---

## Cross-Check Violations

<If no findings: "All cross-checks passed.">

| File | Line | Check | Violation | Fix |
|------|------|-------|-----------|-----|
| ...  | L<n> | Naming | ...      | ... |

---

## Files Reviewed

| File | Rules Applied |
|------|--------------|
| <file> | <rule_file1>, <rule_file2> |
| ...    | ...                        |
```

### Step 5: Terminal Summary

Print to the terminal — this is the only user-facing output:

```
Code Review: <branch> → main
═══════════════════════════════════

Files reviewed: N
Logic issues:   N errors, N warnings
Rule violations: N errors, N warnings
Cross-checks:   N errors, N warnings
─────────────────────────────────
Total:          N errors, N warnings

Verdict: CLEAN ✓ | HAS WARNINGS ⚠ | HAS ERRORS ✗

Full report: .agent-runs/<RUN_ID>/report.md
```

If there are errors, list up to 5 most critical ones (one line each) before the verdict.

## Rules

- Never flag pre-existing issues — only review changed/added code
- Never skip a rule file that matches — read and apply all matched rules
- Never generate filler findings — if clean, say clean
- Always trace logic changes to callers — do not review diffs in isolation
- Always write the report before printing the summary
- The report is the artifact — the terminal summary is just a pointer to it
- If a file was deleted, skip rule review but still check for dangling references in logic review
- Severity `error` means the code will break or clearly violates a rule. `warning` means it should be fixed but is not immediately breaking
