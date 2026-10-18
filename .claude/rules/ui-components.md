---
globs: apps/ui/**/components/**
---

# UI Component File Rules

Applies to: any file under a `components/` directory in `apps/ui/`

## One component per file

Every component gets its own file. No exceptions.

`index.tsx` contains exactly **one** exported component — the folder's primary component. If the component needs sub-components, each one gets a separate PascalCase file in the same folder, imported by `index.tsx`.

```
TopUsersChart/
├── index.tsx                  ← TopUsersChart only
├── TopUsersChartTooltip.tsx   ← sub-component
├── UserIdTick.tsx             ← sub-component
└── TopUsersChart.test.tsx
```

### Compound components are the exception

Radix-style compound components (Dialog, DropdownMenu) that export multiple tightly-coupled parts from `index.tsx` are allowed. These share context and are designed as a single API surface.

## No pure functions in component files

Component files contain JSX, state, and event wiring. Nothing else.

If a component file defines a function that does not return JSX or call a React hook, it is a violation. Move it:

| Kind | Destination |
|------|-------------|
| Pure functions (formatters, builders, validators) | `modules/<module>/utils/<subject>.ts` or `lib/utils/` |
| Constants (thresholds, option lists, lookup tables) | Same utils file or a dedicated constants file |
| Types not directly tied to the component's props | `modules/<module>/types/<subject>.ts` or `lib/types/` |

Constants that are **static config passed directly to JSX** (e.g. chart colors, chart height) are allowed in the component file.

## Re-exports from index.tsx

When sub-components are consumed externally (e.g. `ModalFooter` from `Modal/`), re-export them from `index.tsx` so the import path stays `../Modal`:

```ts
// Modal/index.tsx
export { Modal, type ModalProps };
export { ModalFooter, type ModalFooterProps } from "./ModalFooter";
export { ModalPreviewBox, type ModalPreviewBoxProps } from "./ModalPreviewBox";
```

Internal-only sub-components (e.g. a tooltip only used by the parent chart) do not need re-exporting.

## Enforcement

If `index.tsx` defines more than one `function` that returns JSX, it is a violation — extract the extra component(s) to their own files.
