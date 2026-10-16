---
name: visual-compare
description: Compare two visual sources side by side — prototype vs implementation,
  previous vs current, light vs dark. Captures screenshots at specified viewports,
  diffs them, and produces a report with match/close/mismatch status per component.
  Supports multiple comparisons in a single run. Use for build verification, regression
  checks, or design fidelity audits.
---

# Visual Compare

## Constants

| Name | Value | Description |
|------|-------|-------------|
| `<run_dir>` | `.agent-runs/<run_id>` | Root of this run's output |
| `<output>` | `<run_dir>/visual-compare` | This skill's output directory |
| `<screenshots>` | `<output>/screenshots` | Captured screenshots |
| `<diffs>` | `<output>/diffs` | Diff images |
| `<step_output>` | `<output>/output.json` | Per-step JSON results (append-only) |
| `<report_output>` | `<output>/report.html` | Visual report for human review |
| `<skill_root>` | `.claude/skills/visual-compare` | Root of this skill's assets |
| `<validate_comparison>` | `npx tsx <skill_root>/scripts/validate-comparison.ts` | Comparison validation command |

## Input

- **run_id** (required): unique identifier for this run. Scopes all output. Provided by the coordinator.
- **coordinator** (required): the agent or session that invoked this skill
- **comparisons** (required): one or more comparison sets to run. Each set defines:

```json
{
  "comparisons": [
    {
      "name": "prototype-vs-implementation",
      "source_a": { "type": "file", "target": "prototypes/v1/Ratly UI Directions.html", "label": "Prototype" },
      "source_b": { "type": "storybook", "target": "http://localhost:6006", "label": "Implementation" },
      "components": ["button", "card", "navbar"],
      "viewports": [
        { "name": "mobile", "width": 390, "height": 844 },
        { "name": "desktop", "width": 1440, "height": 900 }
      ]
    },
    {
      "name": "light-vs-dark",
      "source_a": { "type": "storybook", "target": "http://localhost:6006?theme=light", "label": "Light" },
      "source_b": { "type": "storybook", "target": "http://localhost:6006?theme=dark", "label": "Dark" },
      "components": ["all"],
      "viewports": [
        { "name": "desktop", "width": 1440, "height": 900 }
      ]
    }
  ]
}
```

- **context** (optional): additional instructions

## Source types

| Type | What it opens | How to capture |
|------|--------------|----------------|
| `file` | Local HTML file in Playwright | Navigate to `file://` path, find component by selector or section |
| `url` | Remote URL in Playwright | Navigate, find component |
| `storybook` | Storybook story in Playwright | Navigate to story URL (`/iframe.html?id=component--variant`) |

## Steps

1. **Plan** — For each comparison set, resolve what will be captured:
   - If `components: ["all"]` → discover all available components from Storybook or HTML
   - Compute total captures: components × viewports × 2 sources × comparison sets
   - Present the plan to the user

   **Step output:**
   ```json
   {
     "step": "plan",
     "totalCaptures": 24,
     "totalComparisons": 12,
     "sets": [
       {
         "name": "prototype-vs-implementation",
         "components": ["button", "card", "navbar"],
         "viewports": ["mobile", "desktop"],
         "capturesPerSource": 6
       }
     ]
   }
   ```

2. **Capture source A** — For each comparison set, for each component × viewport:
   - Open source_a in Playwright at the viewport size
   - Navigate to the component (by story ID, by CSS selector, or by section in HTML)
   - Screenshot the component (not the full page — isolate the component)
   - Save to `<screenshots>/<set-name>/a/<component>-<viewport>.png`

   **Step output:**
   ```json
   {
     "step": "capture_a",
     "captured": 6,
     "failed": 0,
     "screenshots": [
       { "component": "button", "viewport": "mobile", "path": "<screenshots>/proto-vs-impl/a/button-mobile.png" }
     ]
   }
   ```

3. **Capture source B** — Same process for source_b.
   - Save to `<screenshots>/<set-name>/b/<component>-<viewport>.png`

   **Step output:** same shape as step 2 with `step: "capture_b"`

4. **Compare** — For each component × viewport pair:
   - Load screenshot A and B
   - Calculate pixel diff percentage
   - Classify: `match` (< 2%), `close` (2-10%), `mismatch` (> 10%)
   - If close or mismatch: identify specific differences (color, spacing, layout, typography, size, missing element, extra element)
   - Generate a diff overlay image → `<diffs>/<set-name>/<component>-<viewport>-diff.png`

   **Step output must conform to `schemas/comparison.schema.json`**

4a. **Validate comparison** — Run:
    ```bash
    <validate_comparison> <step_output>
    ```
    - Validates schema, screenshots exist on disk, status thresholds correct, summary counts match
    - If FAIL: fix and re-run
    - Append result to `<step_output>` (`step: "validate_comparison"`)

5. **Report** — Generate `<report_output>` (HTML file) containing:
   - Run metadata (run_id, timestamp, sources, viewports)
   - Overall status: `pass` (all match), `review` (some close), `fail` (any mismatch)
   - Per comparison set:
     - Summary bar (match / close / mismatch counts)
     - Per component:
       - Side-by-side screenshots (A vs B)
       - Diff overlay image
       - Diff percentage
       - Status badge
       - List of specific differences with severity
   - Must also conform to `schemas/report.schema.json` in `<step_output>`

   Present the summary to the user:
   - If all match → "All components match. Report at `<report_output>`"
   - If close/mismatch → list each issue, ask user to review the report
   - User may: approve (accept drifts), request fixes, or reject

## Diff thresholds

| Diff % | Status | Meaning |
|--------|--------|---------|
| < 2% | `match` | Pixel-perfect or negligible difference (anti-aliasing, font rendering) |
| 2-10% | `close` | Visible but minor — spacing, slight color shift. Needs human review. |
| > 10% | `mismatch` | Significant visual difference. Likely a bug or missed implementation. |

## Running multiple comparisons

Each comparison set runs independently within the same run. Results are grouped by set in the report.

Example: run prototype check AND regression check in one invocation:
```json
{
  "comparisons": [
    { "name": "prototype-fidelity", "source_a": { "type": "file", ... }, "source_b": { "type": "storybook", ... }, ... },
    { "name": "regression-check", "source_a": { "type": "url", "target": "https://main.storybook.example.com", ... }, "source_b": { "type": "storybook", ... }, ... }
  ]
}
```

## Per step output

- Produce a single file at `<step_output>` which is written after every step.
- After a step's output is written, NEVER update it in a downstream step.
- If wrong, rerun the step to produce fresh output.

## Rules

- Always isolate the component in the screenshot — never capture the full page.
- Use the same viewport dimensions for both sources in a pair.
- Screenshots must be taken at the same CSS state (no hover, no focus) unless the comparison specifically tests interaction states.
- The diff image must visually highlight the areas that differ.
- Never silently pass a mismatch — every difference above 2% must appear in the report.
- If Storybook is not running, start it. If it fails to start, report the error and stop.
- If a component cannot be found in a source, mark it as `error` with a description, not as `match`.
