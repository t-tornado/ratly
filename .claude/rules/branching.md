# Branch Naming Rules

## Format

```
<type>/<short-description>
```

- Lowercase, kebab-case
- Max 50 characters total
- Description should be 2-4 words

## Types
- `feat` — new feature
- `fix` — bug fix
- `chore` — tooling, config, deps
- `refactor` — code restructure
- `docs` — documentation
- `test` — adding or updating tests

## Branch from
- Always branch from `main`

## Examples

Good:
```
feat/url-shortener-api
fix/redirect-loop
chore/setup-ci
```

Bad:
```
my-branch              ← no type prefix
feat/Add_New_Feature   ← uppercase, underscores
fix/this-is-a-very-long-branch-name-that-describes-everything-in-detail ← too long
```
