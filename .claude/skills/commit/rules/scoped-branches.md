# Scoped Branch Rules

## Principle
Related work stays together. Unrelated work gets its own branch.

## What counts as related
Changes that serve the same goal — e.g. server endpoint + UI page that calls it, or a config change required by a feature. Same branch.

## What counts as unrelated
Changes with no dependency on each other — e.g. a docs update while building a server feature, or a skill tweak alongside UI work. Separate branch.

## Scopes (for reference)
- `server` — `apps/server/`
- `ui` — `apps/ui/`
- `docs` — `docs/`
- `skills` — `.claude/skills/`
- `config` — root config files

## Detection
1. Run `git status` and `git diff` to list all changed files
2. Group changes by intent, not just folder
3. If all changes serve one goal → single branch
4. If unrelated work exists alongside → split it out

## Branching
Follow `.claude/rules/branching.md` for all branch names and creation rules.

## Workflow when unrelated changes detected
1. Stash all changes: `git stash --include-untracked`
2. Handle the unrelated scope first (smaller/simpler one):
   a. Branch from main per `rules/branching.md`
   b. Pop stash, stage only that scope's files, re-stash the rest
   c. Commit following normal commit rules
   d. Push: `git push -u origin <branch>`
   e. Return to main: `git checkout main`
3. Then handle the main work:
   a. Branch from main per `rules/branching.md`
   b. Pop stash, stage and commit
   c. Push: `git push -u origin <branch>`

## Edge cases
- Config changes that support the feature → group with feature
- If unsure whether changes are related → ask the user
