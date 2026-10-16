---
name: prototype-builder
description: Build or extend the design system from an HTML prototype. Handles full
  builds (from scratch) and incremental additions (new component from an HTML snippet).
  Orchestrates extraction, token writing, component building, and visual verification
  in strict order with user approval between each phase. Writes a run manifest tracking
  every phase. Use when the user provides an HTML file, URL, or snippet and wants it
  turned into production components.
---

# Prototype Builder

## Constants

| Name | Value | Description |
|------|-------|-------------|
| `<run_dir>` | `.agent-runs/<run_id>` | Root of this run's output |
| `<manifest>` | `<run_dir>/manifest.json` | Run-level manifest |
| `<extraction_output>` | `<run_dir>/design-system-extract/manifest.json` | Extraction step output |
| `<tokens_output>` | `<run_dir>/design-tokens/output.json` | Tokens step output |
| `<components_output>` | `<run_dir>/design-components/output.json` | Components step output |
| `<compare_output>` | `<run_dir>/visual-compare/output.json` | Compare step output |

## Input

- **source** (required): HTML file path, URL, or snippet to build from
- **scope** (optional): which components to build. Default: all found in source.
- **context** (optional): additional constraints

## Hard Gates

**These are non-negotiable. Do NOT proceed past any gate until it is satisfied.**

1. Before ANY other action: create `<run_dir>/` directory and write `<manifest>` with status `"running"`.
   If `<manifest>` does not exist on disk, NOTHING else runs.
2. Before each phase: the previous phase must have `status: "approved"` in `<manifest>`.
3. After each phase: update `<manifest>` before presenting results to the user.
4. On completion or rejection: update `<manifest>` with final status before stopping.

## Steps

### Step 0: Initialize

1. **Determine mode** — Check if `apps/ui/src/styles/tokens.css` exists:
   - NOT exists → `full` mode
   - EXISTS + source is a complete HTML page → `rebuild` mode
   - EXISTS + source is a snippet or single component → `incremental` mode
2. **Confirm mode with user** — Present the mode and wait for confirmation. Do NOT proceed without it.
3. **Generate run ID** — Format: `YYYY-MM-DD-<slug>`
   - Full: `2026-10-16-full-build`
   - Incremental: `2026-10-16-add-modal`
4. **Create run directory and manifest** — Execute these commands immediately. This is not optional.

   ```bash
   RUN_ID="<run_id>"
   RUN_DIR=".agent-runs/$RUN_ID"
   mkdir -p "$RUN_DIR"
   cat > "$RUN_DIR/manifest.json" << 'MANIFEST'
   {
     "runId": "<run_id>",
     "mode": "<mode>",
     "coordinator": "prototype-builder",
     "source": "<source path or URL>",
     "startedAt": "<ISO timestamp>",
     "status": "running",
     "phases": []
   }
   MANIFEST
   ```

5. **Verify the manifest exists** — Run:
   ```bash
   cat .agent-runs/<run_id>/manifest.json
   ```
   If this fails, STOP. Do not proceed to Step 1. Fix the issue first.

**HARD STOP: If `.agent-runs/<run_id>/manifest.json` does not exist on disk after this step, you have failed Step 0. Do not continue.**

### Step 1: Extract

Follow the `design-system-extract` skill with these inputs:
- run_id: `<run_id>`
- coordinator: `prototype-builder`
- source: `<source>`
- context (incremental only): "Extract only new elements not already in the existing design system. Compare against existing components in `apps/ui/src/components/`."

**On completion:**
1. Update `<manifest>` — append to phases:
   ```json
   {
     "skill": "design-system-extract",
     "status": "pending",
     "startedAt": "<timestamp>",
     "completedAt": "<timestamp>",
     "output": "<extraction_output>",
     "summary": { "colors": 0, "typography": 0, "spacing": 0, "atoms": 0, "components": 0, "pages": 0, "uncertain": 0 }
   }
   ```
   Fill summary from the skill's actual output.

2. Present summary to user. Ask: approve, request changes, or reject.
3. On approve → set phase status to `"approved"` in manifest.
4. On changes → re-run the skill, update manifest.
5. On reject → set phase to `"rejected"`, set run status to `"rejected"`, STOP.

**Gate: Phase status must be `"approved"` in `<manifest>` before proceeding to Step 2.**

### Step 2: Tokens

Follow the `design-tokens` skill with these inputs:
- run_id: `<run_id>`
- coordinator: `prototype-builder`
- extraction: `<extraction_output>`
- context (incremental only): "Merge only. Do not touch existing tokens."

**Skip condition (incremental only):** If the extraction found no new tokens, add phase with `status: "skipped"` and proceed to Step 3.

**On completion:** Same manifest update pattern as Step 1.

**Gate: Phase status must be `"approved"` or `"skipped"` before proceeding to Step 3.**

### Step 3: Components

Follow the `design-components` skill with these inputs:
- run_id: `<run_id>`
- coordinator: `prototype-builder`
- extraction: `<extraction_output>`
- context (incremental only): "Build only new components. Use existing atoms where possible."

**On completion:** Same manifest update pattern.

**Gate: Phase status must be `"approved"` before proceeding to Step 4.**

### Step 4: Visual Compare

Follow the `visual-compare` skill with these inputs:
- run_id: `<run_id>`
- coordinator: `prototype-builder`
- comparisons:
  ```json
  [{
    "name": "prototype-fidelity",
    "source_a": { "type": "file", "target": "<source>", "label": "Prototype" },
    "source_b": { "type": "storybook", "target": "http://localhost:6006", "label": "Implementation" },
    "components": "<all components built in Step 3>",
    "viewports": [
      { "name": "mobile", "width": 390, "height": 844 },
      { "name": "desktop", "width": 1440, "height": 900 }
    ]
  }]
  ```

**On completion:** Same manifest update pattern. Report path goes in summary.

### Step 5: Finalize

1. Update `<manifest>`:
   ```json
   {
     "status": "completed",
     "completedAt": "<date -u +%FT%TZ>"
   }
   ```
2. Present final summary:
   - Tokens written (added/updated)
   - Components built (atoms/composed)
   - Visual comparison results (match/close/mismatch)
   - Link to `<manifest>` and visual compare report

## Manifest Rules

- Timestamps come from `date -u +%FT%TZ`, never guessed.
- Update manifest AFTER each phase, not during.
- The manifest is the source of truth for what happened in the run.
- If a phase is skipped, record it with `status: "skipped"` and empty summary.
- If the user rejects, record it and stop immediately.

## Rules

- Never skip a user approval gate between phases.
- Never run a phase without the previous phase's approved output.
- Never modify skill output yourself — if something's wrong, re-run the skill.
- In incremental mode, never touch existing components unless the user explicitly asks.
- Always confirm the mode before starting.
- If the extraction finds nothing new in incremental mode, say so and stop.
- The FIRST thing you do is create the run directory and manifest. No exceptions.
