---
name: design-system-extract
description: Extract every design token and component from an HTML prototype colors, typography, spacing, radii, shadows, breakpoints, and every reusable piece (atoms, components, pages).Self-verifies the extraction against the source before presenting. Use when the user provides an HTML file or URL and wants to inventory what the design system needs before building it.
---

# Extract Design System from HTML

## Constants

| Name                    | Value                                                 | Description                            |
| ----------------------- | ----------------------------------------------------- | -------------------------------------- |
| `<run_dir>`             | `.agent-runs/<run_id>`                           | Root of this run's output              |
| `<output>`              | `<run_dir>/design-system-extract`                     | This skill's output directory          |
| `<step_output>`         | `<output>/manifest.json`                              | Per-step JSON results (append-only)    |
| `<final_output>`        | `<output>/design-system-extraction.html`              | Final combined output for human review |
| `<skill_root>`          | `.claude/skills/design-system-extract`                | Root of this skill's assets            |
| `<token_schema>`        | `<skill_root>/schemas/tokens.schema.json`             | Token validation schema                |
| `<component_schema>`    | `<skill_root>/schemas/components.schema.json`         | Component validation schema            |
| `<validate_tokens>`     | `npx tsx <skill_root>/scripts/validate-tokens.ts`     | Token validation command               |
| `<validate_components>` | `npx tsx <skill_root>/scripts/validate-components.ts` | Component validation command           |

## Input

- **run_id** (required): unique identifier for this run. Scopes all output. Provided by the coordinator.
- **source** (required): An HTML file or URL to an HTML prototype
- **coordinator** (required): the agent or session that invoked this skill. used to trace which run produced the outputs
- **context** (optional): a summary of additional instructions, context or constraints passed from the coordinator agent. must be a maximum of 4 lines

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

1. **Fetch** — Read the HTML. Follow all linked stylesheets, nested HTML partials, and asset references. List every file you found.

**Output from this step must include the data below in a json**

- number of linked assets found: html, stylesheets, assets referenced and their links.

2. **Extract tokens** — Pull out every design token:
   - Colors (hex, rgb, hsl — name each by usage: primary, secondary, bg, text, etc.)
   - Typography (font families, sizes, weights, line-heights)
   - Spacing (paddings, margins, gaps — find the scale)
   - Border radii
   - Shadows
   - margins
   - Breakpoints
     **Output from this step must include the data below in a json**

- a count of each token and the number extracted.
- the `results` object for this step MUST conform to `<token_schema>`.

2a. **Validate token output** — Run:

```bash
    <validate_tokens> <step_output>
```

    - If FAIL: fix the step 2 output to match `<token_schema>` and re-run validation.
    - Do NOT proceed to step 3 until this passes.
    - Append the validation result to `<step_output>` as its own step entry (`step: "validate_tokens"`).

3. **Extract components** — Identify every reusable piece:
   - **Atoms**: buttons, inputs, labels, badges, icons
   - **Components**: cards, navbars, forms, modals, dropdowns, pills, progress bars
   - **Pages**: full page layouts and their composition

**Output from this step must include the data below in a json**

- a count of each component and the number found in the prototype.
- for components, list each atom found and their number of appearance in the component. also include for each component the pages they are used in
- for pages, in each page, list the components found in the page by name, and the number of the components found.
- the `results` object for this step MUST conform to `schemas/components.schema.json`.

3a. **Validate component output** — Run:

```bash
    <validate_components> <step_output>
```

    - If FAIL: fix the step 3 output to match `<component_schema>` and re-run validation.
    - Do NOT proceed to step 4 until this passes.
    - Append the validation result to `<step_output>` as its own step entry (`step: "validate_components"`).

4. **Verify** — Before presenting:
   - Count every unique color in the CSS. Compare to your token list.
     Missing any? Add them.
   - Count every component that appears more than once.
     Each one should be in your list.
   - List any token or component you are UNSURE about.

**Output from this step must include the data below in a json**

- verified or uncertain for the data in **step 3**.

5. **Present** — Show the user:
   - Token table (name, value, where it's used)
   - Component list (name, type: atom/component/page, description)
   - Uncertainty list (anything you're not sure about)

## Output

### Skill run output

- this is the final output that combines all outputs and presents for human verification.
- this is different from per step json output which captures what each step produced.
- write the skill run output to `<final_output>`.

### Per step output

- produce a single file at `<step_output>` which is written after every step.
- read the output section for each step and append to the file.
- after a step's output is written, NEVER update it in any downstream step. if its wrong, then the step was wrong. rerun the step to produce fresh output
- use the json schema below

```json
{
  "step": "<step_name>",
  "duration": "how long it took",
  "tokens spent": "total number of tokens spent",
  "results": {<step_results>}
}
```

## Rules

### Source of truth
- Extract tokens and components from the **HTML source code, CSS, and stylesheets** — never from screenshots or visual rendering.
- Read the actual `style` attributes, CSS rules, class definitions, and markup structure.
- Every extracted value must be traceable to a line in the source HTML or CSS.
- Screenshots are for **verification only** — render the result and compare visually to the prototype. Never extract values from a screenshot.

### Output
- Write all step results in a single run file.
- Do NOT create any application code. This phase is extraction only.
- The results object differs by step. Follow the output rules for each step strictly.
- Do NOT skip the self-verification step.
- If unsure whether something is a token or a one-off value, include it and flag it as "uncertain".
