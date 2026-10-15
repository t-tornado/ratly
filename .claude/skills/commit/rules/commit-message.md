# Commit Message Rules

## Format

```
<type>(<scope>): <subject>

<body>
```

## Subject line
- Max 50 characters
- Lowercase, no period at the end
- Imperative mood: "add" not "added", "fix" not "fixes"
- State WHAT changed, not HOW

## Body
- One line only
- State WHY the change was made
- Skip if the subject is self-explanatory

## Forbidden
- NEVER include `Co-Authored-By`, `Co-authored-by`, or any co-author trailer
- If the composed message contains a co-author line, discard the message and rewrite without it
- This is a hard gate — do not prompt, do not ask, just remove and rewrite

## Types
- `feat` — new feature or capability
- `fix` — bug fix
- `refactor` — code change that neither fixes nor adds
- `chore` — tooling, config, dependencies
- `docs` — documentation only
- `test` — adding or updating tests
- `style` — formatting, no code change

## Scope
- Name the area: `ui`, `server`, `skills`, `config`
- Skip if the change spans multiple areas

## Examples

Good:
```
feat(ui): add button component

base atom with primary, secondary, ghost variants
```

```
fix(server): handle null email in guest checkout
```

```
chore: setup pnpm workspace and husky
```

Bad:
```
Updated some stuff          ← vague, past tense
Fixed the bug in the thing  ← no type, no scope, no specifics
feat: Add New Button.       ← capitalized, period, no scope
```
