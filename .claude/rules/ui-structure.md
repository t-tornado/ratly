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

### Placement

- Shared (used by multiple modules) → `components/`
- Module-specific (used by one module) → `modules/<module>/components/`

## Modules

```
modules/
├── dashboard/
│   ├── components/            ← compositions specific to this module
│   ├── hooks/
│   └── index.tsx
└── users/
    ├── components/
    ├── hooks/
    └── index.tsx
```

Modules wire shared components with data, state, and business logic. Shared components stay pure — no hooks, no fetch, no business logic.

## Lib

```
lib/
├── utils/                     ← cn(), formatDate(), etc.
├── hooks/                     ← useMediaQuery, useTheme
└── types/                     ← shared type definitions
```
