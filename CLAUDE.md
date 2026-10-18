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
| Creating a pre-validated issue for ratis | `create-ratis-issue` | Gate description against doability criteria, then create GH issue with ratis label |
| Classifying a GitHub issue | `issue-intake` | Fetch issue (must have ratis label), classify doable/not, write task spec |
| Implementing a classified issue | `issue-implement` | Execute task spec steps, verify each, commit |
| Running doability gate on a description | `ratis-classify` | Standalone: takes title + description, returns doable/not-doable + failed criteria |
| Reviewing local changes against main | `code-review` | Diff against main, check logic + rule violations, write structured report |

## Skill rules

- If a skill has a Step 0 (initialize), execute it FIRST. Run the bash commands. Verify the output file exists. If it does not exist, stop and fix it before any other step.
- Follow skill steps in order. Do not jump ahead or skip steps.
- If a step has a validation gate, run it. Do not proceed until it passes.
- If a step produces output, write it before moving to the next step.
- If a skill defines constants, use them — do not hardcode paths.

## Rules

**Before writing any code**, read the rule files that apply to the scope of work. This is mandatory, not optional. Do not rely on memory or summaries — open and read the actual files every session.

| Scope | Rule file | Read when |
|-------|-----------|-----------|
| All code | `.claude/rules/coding-guidelines.md` | Always — naming, types, imports, error handling, code style |
| UI app (`apps/ui/`) | `.claude/rules/ui-structure.md` | Any change to UI components, modules, hooks, or utils |
| UI app (`apps/ui/`) | `.claude/rules/ui-components.md` | Creating or modifying any component |
| UI app (`apps/ui/`) | `.claude/rules/ui-hooks.md` | Creating or modifying any hook |
| UI app (`apps/ui/`) | `.claude/rules/frontend-routing.md` | Any navigation or route change |
| Server app (`apps/server/`) | `.claude/rules/server-structure.md` | Any change to server modules, controllers, services |
| Shared packages | `.claude/rules/packages.md` | Adding anything to `@ratly/core` |
| Git | `.claude/rules/branching.md` | Creating branches |

**Enforcement**: Every rule in every loaded file applies strictly. No shortcuts, no "close enough". If a rule says use the design system component, use it. If a rule says extract utils from hooks, extract them. Violations are bugs — fix them before moving on.
