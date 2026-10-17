# Skills Reference

Skills are discrete, reusable agent workflows. Each skill has a trigger phrase — say it in Claude Code and the skill runs. Skills can be chained (ratis does this automatically) or triggered individually.

## Full index

| Skill | Trigger phrase(s) | Input | Output |
|-------|-------------------|-------|--------|
| `ratis` | `ratis <N>`, `ship issue <N>`, `ratis fix <N>` | GitHub issue number | PR URL |
| `issue-intake` | `intake issue <N>`, `take issue <N>`, `pick up issue <N>` | GitHub issue number | `task.json` |
| `issue-implement` | `implement issue <N>`, `work on issue <N>` | `task.json` (from intake) | Step proofs + commit |
| `create-pr` | `create pr`, `open pr`, `pr time`, `ship it` | Clean branch with commits | PR URL |
| `commit` | `commit`, `save this`, `checkpoint` | Staged or unstaged changes | Commit hash |
| `worktree-manager` | `create a worktree`, `new worktree`, `delete worktree` | Branch name | Worktree at `worktrees/` |
| `design-system-extract` | `extract design system`, `extract tokens from prototype` | HTML prototype path | Token + component inventory |
| `design-tokens` | `write design tokens`, `update tokens` | Token extraction output | CSS token files |
| `design-components` | `build components`, `update components` | Component inventory | Component files in `src/components/` |
| `prototype-builder` | `build design system from prototype` | HTML prototype path | Full design system (tokens + components) |
| `visual-compare` | `compare visuals`, `diff screenshots` | Two visual sources | Screenshot diff report |

## Skill details

### ratis
Full autonomous pipeline. See [ratis.md](./ratis.md).

### issue-intake
Reads a GitHub issue, applies doability criteria, derives a task spec, and writes it to `.agent-runs/issue-<N>/task.json`. Shows the spec and waits for confirmation. Does not touch code.

### issue-implement
Reads `task.json` produced by intake. Executes each step in order, runs the `verify` command after each, and writes a proof file. Runs acceptance checks. Commits on success.

Requires: `task.json` exists, classification is `doable`, current branch matches `task.json.branch`.

### create-pr
Runs quality gates (build, tests, guards) for affected apps. If all pass, pushes and opens a GitHub PR with a gate report and step proofs embedded in the body.

Gates:
- UI changed → `pnpm --filter @ratly/ui build`, `test`, `test:guards`
- Server changed → `pnpm --filter @ratly/server build`, `test`

### commit
Reviews all changes, groups into logical units, scans for secrets with gitleaks, stages explicitly (never `git add .`), composes a conventional commit message, shows it to you, then commits. Never uses `--no-verify`.

### worktree-manager
Creates or removes git worktrees in `worktrees/`. New worktrees branch from `main`. Installs dependencies automatically after creation.

### design-system-extract
Reads an HTML prototype and extracts all design tokens (colors, spacing, typography, radii, shadows) and a component inventory. Validates output against schema before proceeding.

### design-tokens
Writes CSS token files (`@theme`, light/dark color splits, spacing, typography) from an extraction. Merges into existing files — does not overwrite unchanged tokens.

### design-components
Builds shared UI components from a component inventory. All components live flat in `apps/ui/src/components/` — no hierarchy. Reads existing components before writing to avoid duplication.

### prototype-builder
Orchestrates the full design system pipeline: extract → tokens → components → visual verify. Use this instead of running the sub-skills individually when starting from an HTML prototype.

### visual-compare
Captures screenshots of two visual sources at specified viewports, diffs them, and produces a report (match / close / mismatch per component).

## Rules that apply to all skills

- Skills read relevant rule files before executing — they do not rely on memory
- Hard gates stop execution — they cannot be bypassed or soft-failed
- Skills never commit without passing all verify steps
- Skills never create PRs with failing gates
- All code follows `.claude/rules/coding-guidelines.md`
- All branches follow `.claude/rules/branching.md`
