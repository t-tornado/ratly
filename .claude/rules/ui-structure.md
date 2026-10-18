# UI App Structure Rules

Applies to: `apps/ui/`

## Naming

- **No kebab-case** in file or folder names. This is a TypeScript project.
- Folders: PascalCase for component folders (`Button/`, `StatCard/`), camelCase for non-component directories (`hooks/`, `utils/`, `types/`)
- Files: PascalCase for classes and sub-components (`StatCardHeader.tsx`), camelCase for utilities, hooks, and helpers (`useTheme.ts`, `formatDate.ts`, `cn.ts`)
- Test files: PascalCase matching the component (`Button.test.tsx`, `StatCard.test.tsx`)
- Variant config: camelCase (`button.variants.ts`)

## Components

### File structure

Every component is a folder. No exceptions.

- `index.tsx` IS the component — not a barrel re-exporting from another file.
- Sub-components live alongside, imported by `index.tsx`.
- Tests named after the component, not `index.test.tsx`.

```
components/
├── Button/
│   ├── index.tsx              ← the component itself
│   └── Button.test.tsx
├── Badge/
│   ├── index.tsx
│   └── Badge.test.tsx
├── StatCard/
│   ├── index.tsx              ← main component, imports sub-components
│   ├── StatCardHeader.tsx     ← sub-component
│   ├── StatCardBody.tsx       ← sub-component
│   └── StatCard.test.tsx
└── DataTable/
    ├── index.tsx
    ├── DataTableRow.tsx
    ├── DataTableHeader.tsx
    └── DataTable.test.tsx
```

### Component index.tsx is composition only

`index.tsx` contains JSX, state, and event wiring. Nothing else.

**Not allowed in `index.tsx`:**
- Utility functions (pure logic, data transformations, filter helpers)
- Type aliases or interfaces that are not component props
- Module-level constants other than static config passed directly to JSX

**Where these go instead:**
- Pure functions → `modules/<module>/utils/<subject>.ts`
- Module-scoped types → `modules/<module>/types/<subject>.ts`
- Shared types → `lib/types/<subject>.ts`

### Placement

- Shared (used by multiple modules) → `components/`
- Module-specific (used by one module) → `modules/<module>/components/`

## Modules

```
modules/
├── dashboard/
│   ├── components/            ← composition components for this module
│   ├── hooks/                 ← module-scoped hooks
│   ├── utils/                 ← pure functions scoped to this module
│   ├── types/                 ← types scoped to this module
│   └── index.tsx
└── users/
    ├── components/
    ├── hooks/
    ├── utils/
    ├── types/
    └── index.tsx
```

Modules wire shared components with data, state, and business logic. Shared components stay pure — no hooks, no fetch, no business logic.

Module utils files contain pure functions only — no React, no side effects. They must be directly testable with `vitest` without any component setup.

## Lib

```
lib/
├── utils/                     ← cn(), formatDate(), etc. — shared pure functions
├── hooks/                     ← useMediaQuery, useTheme, useDebounce — shared hooks
└── types/                     ← shared type definitions
```
