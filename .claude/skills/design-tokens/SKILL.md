---
name: design-tokens
description: Write or update design token files from an approved extraction. Creates
  CSS variables (@theme, light/dark color splits), spacing, typography, radii, and
  shadows. If token files already exist, merges new tokens and updates changed values
  without overwriting manual edits. Use after the user approves a design-system-extract
  output.
---

# Design Tokens

## Constants

| Name | Value | Description |
|------|-------|-------------|
| `<styles_dir>` | `apps/ui/src/styles` | Where token files live |
| `<run_dir>` | `.agent-runs/<run_id>` | Root of this run's output |
| `<output>` | `<run_dir>/design-tokens` | This skill's output directory |
| `<step_output>` | `<output>/output.json` | Per-step JSON results (append-only) |
| `<skill_root>` | `.claude/skills/design-tokens` | Root of this skill's assets |
| `<validate_provision>` | `npx tsx <skill_root>/scripts/validate-provision.ts` | Provision validation command |
| `<contrast_check>` | `npx tsx <skill_root>/scripts/contrast-check.ts` | Contrast ratio validation command |
| `<validate_write>` | `npx tsx <skill_root>/scripts/validate-write.ts` | Write validation command |

## Input

- **run_id** (required): unique identifier for this run. Scopes all output. Provided by the coordinator.
- **extraction** (required): path to the approved extraction output (e.g. `<run_dir>/design-system-extract/manifest.json`)
- **coordinator** (required): the agent or session that invoked this skill
- **context** (optional): additional instructions or constraints from the coordinator

## Token files

| File | Contents | Theme-dependent? |
|------|----------|-----------------|
| `tokens.css` | `@theme` block: spacing, radii, shadows, typography, semantic color bindings | No |
| `colors.light.css` | `:root` — light palette values | Yes |
| `colors.dark.css` | `.dark` — dark palette values | Yes |
| `index.css` | Imports all token files + tailwindcss | No |

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

1. **Provision** — Check if token files exist at `<styles_dir>/`:
   - `tokens.css`
   - `colors.light.css`
   - `colors.dark.css`
   - `index.css`

   For each file:
   - EXISTS → skip, mark as `found`
   - MISSING → create with empty structure, mark as `created`

   Empty structures:
   ```css
   /* tokens.css */
   @theme {
   }
   ```
   ```css
   /* colors.light.css */
   :root {
   }
   ```
   ```css
   /* colors.dark.css */
   .dark {
   }
   ```
   ```css
   /* index.css */
   @import "./tokens.css";
   @import "./colors.light.css";
   @import "./colors.dark.css";
   @import "tailwindcss";
   ```

   **Step output:**
   ```json
   {
     "step": "provision",
     "files": {
       "tokens.css": { "status": "found | created", "path": "<styles_dir>/tokens.css" },
       "colors.light.css": { "status": "found | created", "path": "<styles_dir>/colors.light.css" },
       "colors.dark.css": { "status": "found | created", "path": "<styles_dir>/colors.dark.css" },
       "index.css": { "status": "found | created", "path": "<styles_dir>/index.css" }
     }
   }
   ```

1a. **Validate provision** — Run:
    ```bash
    <validate_provision> <step_output>
    ```
    - If FAIL: fix the provision output and re-run validation.
    - Do NOT proceed to step 2 until this passes.
    - Append validation result to `<step_output>` (`step: "validate_provision"`).

2. **Map tokens to slots** — Read the approved extraction. For each token, decide its destination:
   - **Theme-independent** (spacing, radii, shadows, typography, brand colors like primary/accent) → `tokens.css`
   - **Theme-dependent** (bg, surface, text, border, and any color that shifts between light/dark) → `colors.light.css` + `colors.dark.css`

   **Step output:**
   ```json
   {
     "step": "map_tokens",
     "mappings": [
       {
         "token": "primary",
         "value": "#FF6B35",
         "target": "tokens.css",
         "cssVariable": "--color-primary"
       },
       {
         "token": "bg",
         "lightValue": "#FFFFFF",
         "darkValue": "#0A0A0A",
         "target": "colors.light.css + colors.dark.css",
         "cssVariable": "--bg"
       }
     ]
   }
   ```

2a. **Contrast check** — For every color token, check its contrast ratio against every
    background token it could sit on. This covers all color tokens, not just text.

    Pairs to check:
    - Every text color against every bg/surface color
    - Primary/secondary/accent as foreground against every bg/surface color
    - Primary/secondary/accent as background against white and against the text color

    WCAG thresholds:
    - **AA normal text**: 4.5:1
    - **AA large text** (18px+ or 14px+ bold): 3:1
    - **AAA**: 7:1

    **Step output must conform to `schemas/contrast-check.schema.json`:**
    ```json
    {
      "step": "contrast_check",
      "summary": { "total": 12, "passed": 10, "failed": 2 },
      "pairs": [
        {
          "foreground": "text",
          "background": "bg",
          "foregroundValue": "#1A1A1A",
          "backgroundValue": "#FFFFFF",
          "ratio": 16.2,
          "required": 4.5,
          "level": "AA",
          "status": "pass"
        }
      ]
    }
    ```

2b. **Validate contrast check** — Run:
    ```bash
    <contrast_check> <step_output>
    ```
    The script validates:
    - Output matches `schemas/contrast-check.schema.json`
    - Reported ratios are mathematically correct (recalculates independently)
    - Pass/fail status matches the ratio vs threshold
    - Summary counts match actual pair results

    If any pairs FAIL contrast:
    - Present all failures to the user with the ratio and what's needed
    - User may: provide new values, accept the failure, or skip the token
    - Do NOT proceed to step 3 until user confirms

    Append validation result to `<step_output>` (`step: "validate_contrast"`).

3. **Write tokens to files** — Using the approved mappings from step 2, write each
   token into its target CSS file.

   For each file:
   - Read the existing file content
   - For each token mapped to this file:
     - If the CSS variable already exists → update its value
     - If it doesn't exist → add it
     - If the value is unchanged → skip, mark as `unchanged`
   - Write the file back

   Token placement:
   - `tokens.css`: inside the `@theme { }` block
     ```css
     @theme {
       --color-primary: #FF6B35;
       --font-heading: "Inter";
       --spacing-1: 4px;
       --spacing-2: 8px;
       --radius-sm: 4px;
       --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
     }
     ```
   - `colors.light.css`: inside `:root { }`
     ```css
     :root {
       --bg: #FFFFFF;
       --text: #1A1A1A;
       --surface: #F5F5F5;
       --border: #E5E5E5;
     }
     ```
   - `colors.dark.css`: inside `.dark { }`
     ```css
     .dark {
       --bg: #0A0A0A;
       --text: #E5E5E5;
       --surface: #1A1A1A;
       --border: #2A2A2A;
     }
     ```

   **Step output must conform to `schemas/write-tokens.schema.json`:**
   ```json
   {
     "step": "write_tokens",
     "files": [
       {
         "file": "tokens.css",
         "path": "<styles_dir>/tokens.css",
         "action": "updated",
         "tokensWritten": 8,
         "tokensSkipped": 0,
         "tokens": [
           { "variable": "--color-primary", "value": "#FF6B35", "action": "added" }
         ]
       }
     ],
     "summary": { "totalTokens": 20, "added": 18, "updated": 2, "unchanged": 0 }
   }
   ```

3a. **Validate write** — Run:
    ```bash
    <validate_write> <step_output>
    ```
    The script validates:
    - Output matches `schemas/write-tokens.schema.json`
    - Every file claimed exists on disk
    - Every token marked as `added` or `updated` is present in the CSS file
    - Summary counts match actual token actions
    - tokensWritten count matches per file

    If FAIL: fix the written files and re-run validation.
    Append validation result to `<step_output>` (`step: "validate_write"`).

4. **Present** — Show the user a summary:
   - Files created or updated
   - Tokens added, updated, unchanged (per file)
   - Any contrast failures that were accepted in step 2b
   - The full token map for review

   The user may:
   - Approve → skill is done
   - Request changes → go back to step 3 and rewrite
   - Reject → discard written tokens, restore files to previous state

## Per step output

- Produce a single file at `<step_output>` which is written after every step.
- After a step's output is written, NEVER update it in a downstream step.
- If wrong, rerun the step to produce fresh output.

## Rules

- Never delete existing token values. Only add or update.
- Never overwrite manual edits — merge new tokens alongside existing ones.
- Do NOT create code beyond CSS token files. No JS/TS exports unless explicitly asked.
