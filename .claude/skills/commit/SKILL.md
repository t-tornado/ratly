---
name: commit
description: Stage and commit changes with a conventional commit message. Scans for
  secrets before staging, groups related changes, and follows commit message conventions.
  Use when the user says "commit", "save this", or "checkpoint".
---

# Stage and Commit

## Rules
- Follow all rules in `rules/staging.md`
- Follow all rules in `rules/commit-message.md`
- Follow all rules in `rules/scoped-branches.md`

## Steps

1. **Review** — Run `git status` and `git diff` to see all changes. Group them into
   logical units. If changes span unrelated areas, plan multiple commits.
   Also check if changes span unrelated scopes per `rules/scoped-branches.md`.
   If so, split into separate branches before committing.

2. **Scan for secrets** — Run:
   ```bash
   gitleaks detect --no-banner --no-git
   ```
   - If leaks found: list the files and lines. Do NOT proceed. Ask the user to fix.
   - If clean: proceed to step 3.

3. **Stage** — Stage files by name following `rules/staging.md`.
   - Never use `git add .` or `git add -A`.
   - Never stage `.env`, `.scratchpad/`, or OS files.
   - If a file has mixed changes, use `git add -p` to stage only relevant hunks.

4. **Verify staged** — Run `git diff --staged` and review.
   - Confirm everything staged belongs to one logical change.
   - Confirm nothing is staged that shouldn't be.

5. **Compose message** — Write the commit message following `rules/commit-message.md`.
   - Show the proposed message to the user before committing.

6. **Validate message** — Check the composed message for any `Co-Authored-By` or co-author trailer (case-insensitive).
   - If found: discard the message, rewrite without it, and re-validate. Do NOT proceed until clean.

7. **Commit** — Run `git commit`. Husky pre-commit hook runs gitleaks again as a safety net.
   - If hook fails: do NOT use `--no-verify`. Fix the issue, unstage the problem file, and retry.
   - If hook passes: report the commit hash to the user.

## Rules
- Never use `--no-verify` or `--no-gpg-sign`.
- Never amend a previous commit unless the user explicitly asks.
- If multiple logical changes exist, repeat steps 3-6 for each one.
- Always show the commit message to the user before committing.
