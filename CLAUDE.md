# Ratly

## Project structure

- `apps/ui/` — React + Vite + Tailwind v4 UI app (@ratly/ui)
- `apps/server/` — NestJS + Fastify backend (@ratly/server)
- `.claude/skills/` — skill definitions for structured agent workflows
- `.agent-runs/` — gitignored output from skill runs

## How to work

- Read the file before changing it
- Follow existing patterns in the codebase
- Run tests after changes
- Use pnpm (not npm)

## Skills available

| Trigger | Skill | What it does |
|---------|-------|-------------|
| Building design system from HTML prototype | `prototype-builder` | Orchestrates full pipeline: extract → tokens → components → verify |
| Extracting tokens/components from HTML | `design-system-extract` | Reads HTML source, extracts tokens + component inventory |
| Writing or updating CSS token files | `design-tokens` | Writes @theme, light/dark color splits from extraction |
| Building or updating components | `design-components` | Builds shared components flat — standalone or composed |
| Comparing two visual sources | `visual-compare` | Screenshots + diffs for fidelity, regression, or theme checks |
| Committing changes | `commit` | Stage, scan secrets, commit with conventional message |
| Creating a pull request | `create-pr` | Run quality gates, collect gate report, create PR with proof |
| Shipping a GitHub issue end-to-end | `ratis` | Autonomous agent: classify → worktree → implement → PR with proofs |
| Classifying a GitHub issue | `issue-intake` | Fetch issue, classify doable/not, write task spec |
| Implementing a classified issue | `issue-implement` | Execute task spec steps, verify each, commit |

## Skill rules

- If a skill has a Step 0 (initialize), execute it FIRST. Run the bash commands. Verify the output file exists. If it does not exist, stop and fix it before any other step.
- Follow skill steps in order. Do not jump ahead or skip steps.
- If a step has a validation gate, run it. Do not proceed until it passes.
- If a step produces output, write it before moving to the next step.
- If a skill defines constants, use them — do not hardcode paths.

## Rules

- `.claude/rules/coding-guidelines.md` — naming, types, imports, error handling, code style. Strict adherence required.
- `.claude/rules/ui-structure.md` — component structure, folder layout, module conventions. Applies to `apps/ui/`.
