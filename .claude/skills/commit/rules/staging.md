# Staging Rules

## Principle
One commit = one logical change. Stage only what belongs together.

## What to stage together
- The feature code + its tests
- The config change + the code that uses it
- The rename + every file that references the old name

## What to stage separately
- Unrelated fixes found while working — separate commit
- Formatting/style changes — separate commit
- Dependency updates — separate commit unless required by the feature

## Never stage
- `.env`, `.env.*` — secrets never enter git
- `.scratchpad/` — agent workspace is temporary
- `node_modules/` — managed by lockfile
- OS files (`.DS_Store`, `Thumbs.db`)
- Files with hardcoded tokens, keys, or passwords

## How to stage
- Stage specific files by name, not `git add .` or `git add -A`
- Review the diff of each file before staging: `git diff <file>`
- If a file has mixed changes (related + unrelated), use `git add -p` to stage only the relevant hunks

## Scope check before committing
Ask: "Can I describe this commit in one sentence under 50 characters?"
- Yes → stage and commit
- No → split into smaller commits
