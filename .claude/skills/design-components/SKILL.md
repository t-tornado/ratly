---
name: design-components
description: Build or update shared UI components from an approved extraction. All
  components live flat in one directory — no atoms/blocks hierarchy. Standalone or
  composed, if it's shared it goes here. Reads existing components before writing —
  merges new variants and changes without overwriting. Use after design tokens are
  written, or to add/update individual components.
---

# Design Components

## Constants

| Name | Value | Description |
|------|-------|-------------|
| `<components_dir>` | `apps/ui/src/components` | Where all shared components live (flat) |
| `<run_dir>` | `.agent-runs/<run_id>` | Root of this run's output |
| `<output>` | `<run_dir>/design-components` | This skill's output directory |
| `<step_output>` | `<output>/output.json` | Per-step JSON results (append-only) |
| `<skill_root>` | `.claude/skills/design-components` | Root of this skill's assets |
| `<validate_inventory>` | `npx tsx <skill_root>/scripts/validate-inventory.ts` | Inventory validation command |
| `<validate_build>` | `npx tsx <skill_root>/scripts/validate-build.ts` | Build validation command |

## Input

- **run_id** (required): unique identifier for this run. Scopes all output. Provided by the coordinator.
- **extraction** (required): path to the approved extraction output (e.g. `<run_dir>/design-system-extract/manifest.json`)
- **coordinator** (required): the agent or session that invoked this skill
- **context** (optional): additional instructions or constraints. For updates, describe what to change.

## Component structure

All shared components live flat in `<components_dir>/`. No sub-folders for "atoms" or "blocks."

```
<components_dir>/button/
├── button.tsx           ← component implementation
├── button.variants.ts   ← CVA variants (if multiple variants)
└── index.ts             ← barrel export
```

```
<components_dir>/stat-card/
├── stat-card.tsx
└── index.ts
```

## Where components go

| Question | Location |
|---|---|
| Shared across multiple modules? | `<components_dir>/` |
| Only used by one module? | `modules/<module>/components/` (not this skill's concern) |

This skill only builds shared components. Module-specific compositions are built when the module is built.

## Component conventions

- Use design tokens via Tailwind classes — never hardcode colors, spacing, or fonts
- Use `cva` (class-variance-authority) for variant management
- Use `cn` helper (clsx + tailwind-merge) for class merging
- Props extend the native HTML element where applicable
- Every component exports from its `index.ts`
- A composed component imports from other components in `<components_dir>/` — never duplicates their markup

## Steps

0. **Initialize output** — Execute immediately before any other work:
   ```bash
   mkdir -p <output>
   echo '[]' > <step_output>
   ```
   Then verify:
   ```bash
   cat <step_output>
   ```
   **HARD STOP: If `<step_output>` does not exist, do not proceed. Fix it first.**

1. **Inventory** — Scan `<components_dir>/`. Compare against the extraction.
   For each component in the extraction:
   - EXISTS on disk → read it, compare against extraction, decide: `update` or `skip`
   - MISSING → mark as `create`

   For updates, read the existing component first. Decide what changed:
   - New variant needed? → `update` with reason
   - Style change? → `update` with reason
   - Identical to extraction? → `skip`

   Determine build order from dependencies:
   - Components with no custom dependencies → build first
   - Components that import other shared components → build after their dependencies

   **Step output must conform to `schemas/inventory.schema.json`:**
   ```json
   {
     "step": "inventory",
     "summary": { "totalNeeded": 12, "existing": 3, "toCreate": 8, "toUpdate": 1 },
     "components": [
       {
         "name": "button",
         "status": "missing",
         "action": "create",
         "variants": ["primary", "secondary", "ghost"],
         "dependsOn": []
       },
       {
         "name": "stat-card",
         "status": "missing",
         "action": "create",
         "variants": ["default"],
         "dependsOn": ["card", "badge"]
       }
     ]
   }
   ```

1a. **Validate inventory** — Run:
    ```bash
    <validate_inventory> <step_output>
    ```
    - Validates schema, disk presence, summary counts, dependency references
    - If FAIL: fix and re-run
    - Do NOT proceed until PASS
    - Append result to `<step_output>` (`step: "validate_inventory"`)

2. **Plan** — Present the inventory to the user:
   - Components to create (with variants)
   - Components to update (with reason)
   - Components to skip
   - Build order (standalone first, then those with dependencies)

   Wait for user approval. User may:
   - Approve all
   - Remove items ("skip the modal for now")
   - Add items ("also add a tooltip")
   - Change variants ("button needs an outline variant too")

3. **Build** — Build all components in dependency order.

   For each component marked `create` or `update`:
   - Read existing file if updating
   - Create/update the component following component conventions
   - Use design tokens via Tailwind classes
   - Use CVA for variants
   - If it depends on other shared components, import them — never duplicate their markup
   - Export from index.ts

   All components go to `<components_dir>/<component-name>/`.

   **Step output must conform to `schemas/build.schema.json`:**
   ```json
   {
     "step": "build_components",
     "layer": "components",
     "summary": { "total": 10, "created": 8, "updated": 1, "skipped": 1 },
     "components": [
       {
         "name": "button",
         "action": "created",
         "path": "<components_dir>/button",
         "files": [
           { "file": "button.tsx", "action": "created" },
           { "file": "button.variants.ts", "action": "created" },
           { "file": "index.ts", "action": "created" }
         ],
         "variants": ["primary", "secondary", "ghost"],
         "usesTokens": ["--color-primary", "--radius-md", "--spacing-2"],
         "dependsOn": []
       },
       {
         "name": "stat-card",
         "action": "created",
         "path": "<components_dir>/stat-card",
         "files": [
           { "file": "stat-card.tsx", "action": "created" },
           { "file": "index.ts", "action": "created" }
         ],
         "variants": ["default"],
         "usesTokens": ["--color-surface", "--radius-lg"],
         "dependsOn": ["card", "badge"]
       }
     ]
   }
   ```

3a. **Validate build** — Run:
    ```bash
    <validate_build> <step_output> build_components
    ```
    - Validates schema, files exist on disk, summary counts
    - If FAIL: fix and re-run
    - Do NOT proceed until PASS
    - Append result to `<step_output>` (`step: "validate_build"`)

4. **Present** — Show the user a summary:
   - Components built (with variants and token usage)
   - Dependencies between components
   - Anything skipped and why

   User may:
   - Approve → skill is done
   - Request changes → go back to step 3
   - Reject → discard and restore

## Per step output

- Produce a single file at `<step_output>` which is written after every step.
- After a step's output is written, NEVER update it in a downstream step.
- If wrong, rerun the step to produce fresh output.

## Rules

- All shared components go in `<components_dir>/` flat. No sub-folders for categories.
- Always read an existing component before modifying it.
- A composed component imports from `<components_dir>/` — never duplicates markup another component already renders.
- Never hardcode colors, spacing, or fonts — use Tailwind classes backed by design tokens.
- Never delete an existing variant or prop unless the user explicitly asks.
- Build in dependency order: standalone components first, then those that import them.
