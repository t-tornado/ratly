# Coding Guidelines

Every rule in this file is enforced strictly. No exceptions. No shortcuts. If a rule applies to the code being written or modified, it must be followed. Violations are treated as bugs.

## Variable Naming

- Names must be meaningful and carry context of what the variable holds.
- A reader must understand the variable without reading surrounding code.
- `filePath` not `full`. `sourceContent` not `content`. `componentFiles` not `files`. `entryPath` not `entry`.
- No single-letter variables except loop counters (`i`, `j`) and lambda params where the type is obvious (`(x) => x * 2`).
- Booleans start with `is`, `has`, `should`, `can` — `isValid` not `valid`, `hasPermission` not `permission`.
- Collections are plural — `users` not `userList`, `componentFiles` not `fileArray`.

## Function Naming

- Functions describe the action — `collectSourceFiles` not `getFiles`, `validateTokenOutput` not `check`.
- Functions must name their subject — a reader must know what the function operates on without reading its body. `buildUserStatusFilterOptions` not `buildFilters`. `applyUserTableFilters` not `applyFilters`. `filterUserRowsByStatus` not `filterRows`.
- Predicate functions start with `is` or `has` — `isSourceFile` not `checkFile`.
- Event handlers use `on` or `handle` — `onSubmit`, `handleClick`.

## Constants

- Module-level constants are UPPER_SNAKE_CASE — `COMPONENTS_DIR`, `HARDCODED_TAILWIND`.
- Object/enum keys stay camelCase.

## Imports

- Group imports: external packages first, then internal modules, then relative files.
- No wildcard imports (`import * as`) unless the module is designed for it (e.g. React).
- Destructure what you need — `import { readFileSync } from "fs"` not `import fs from "fs"`.

## Types

- Props types are defined and exported alongside the component.
- Use `interface` for object shapes, `type` for unions and aliases.
- No `any` — use `unknown` if the type is genuinely unknown, then narrow it.

## Code Scoping

Code lives at the narrowest scope that needs it:

1. **Module-scoped** — used within a single module → stays in that module's directory (`modules/<module>/types/`, `modules/<module>/utils/`, etc.)
2. **App-shared** — used by multiple modules within the same app → goes in the app's shared directories (`lib/types/`, `lib/utils/`, `lib/hooks/`, `components/`). Follow existing conventions in those directories.
3. **Cross-app** — used by both server and UI → goes in `packages/core`. Must have zero runtime dependencies.

Always place code at the narrowest applicable scope. Do not put module-scoped code in shared directories. Do not put app-scoped code in core.

## Error Handling

- Never silently swallow errors. Log or rethrow.
- Never use empty catch blocks.

## Code Style

- No commented-out code. Delete it. Git has the history.
- No console.log in committed code unless it's a CLI script.
- No magic numbers — extract to a named constant.
