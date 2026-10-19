# Commenting Rules

Applies to: all code (`apps/server/`, `apps/ui/`, `packages/`)

## The rule

Comments document **why**, **flow**, and **relations** — never what the code does. Every comment uses JSDoc syntax. No raw `//` comments except where explicitly allowed below.

## What gets commented

| Target | When |
|--------|------|
| Exported hooks | Always — they are flow connectors |
| Exported stores (Zustand, external stores) | Always — they own shared state |
| Pub/sub wiring (socket listeners, event emitters, stores) | Always — invisible flow |
| Pure functions with business rules or algorithms | When the name alone doesn't convey the rule |
| Interface props with non-obvious semantics | Single-line JSDoc on the property |
| Workarounds and constraints | When driven by external forces (browser quirks, API shape, trade-offs) |
| Architecture guards | File-level block explaining what the guard enforces |
| Constants with domain meaning | Single-line JSDoc when the name isn't enough |

## What NEVER gets commented

- Self-evident code — `const isLoading = !data` needs nothing
- Type information TypeScript already provides
- What the code does line-by-line
- Obvious props — `children`, `className`, `onClick`
- Import groups
- Simple state declarations
- Pure functions with self-documenting names — `formatDate`, `cn()`, `throttleDurationToSeconds`

## JSDoc tags

Use these tags to build the relational graph between files:

| Tag | Purpose | Example |
|-----|---------|---------|
| `@see` | Link to related code — "go look here" | `@see useSocket for connection lifecycle` |
| `{@link}` | Inline reference inside descriptions | `Feeds {@link createRowStore} with initial data` |
| `@fires` | This code emits/triggers something | `@fires socket "rate:consume"` |
| `@listens` | This code subscribes to something | `@listens socket "rate:update"` |
| `@param` | Only when the name + type aren't enough | Skip for obvious params like `userId: string` |
| `@returns` | Only for complex return shapes | Skip when return type is self-evident |
| `@remarks` | Architectural decision or trade-off | Why two update paths exist, why persistence matters |
| `@throws` | When a function throws intentionally | `@throws {NotFoundException} when user missing` |
| `@example` | Only when usage is genuinely non-obvious | Compound components, complex util patterns |

**Do not use** `@description`, `@author`, `@date`, `@version`, `@todo`, `@deprecated` (use TypeScript's `@deprecated` in code, not in comments).

## Comment structure

### Hook or store (multi-line)

```ts
/**
 * One-line summary of what this hook provides.
 *
 * How it works — data sources, update mechanism, key behavior.
 * Mention both the REST and real-time paths if both exist.
 *
 * @param name - Only when non-obvious
 * @returns Description of the reactive contract
 * @listens socket "event:name" — what this event triggers
 * @see RelatedHook — relationship
 * @see relatedUtil — relationship
 */
```

### Flow-critical util or store factory (multi-line)

```ts
/**
 * One-line summary of purpose.
 *
 * How it fits in the data flow. What feeds it, what consumes it.
 * Call out the subscriber/notification model if it has one.
 *
 * @see ConsumerHook — what reads from this
 * @see ProducerHook — what writes to this
 */
```

### Prop with non-obvious meaning (single-line)

```ts
interface ModalProps {
  /** Blocks dismiss on backdrop click — use for destructive confirmations */
  persistent?: boolean;
}
```

### Constant with domain meaning (single-line)

```ts
/** Oldest events evicted beyond this cap — history lives server-side. */
const MAX_EVENTS_PER_USER = 200;
```

### Architecture guard (file-level block)

```ts
/**
 * Architecture guard: <what it enforces>.
 *
 * <Why this rule exists — what breaks without it.>
 *
 * Allowed:   <example of correct usage>
 * Forbidden: <example of violation>
 */
```

## When `//` is allowed

Two cases only:

1. **Regex explanation** — complex patterns that aren't self-evident
2. **Control flow disambiguation** — when a branch's purpose isn't clear from the condition alone (e.g., `// modal stays open, toast shows error`)

Even in these cases, keep to one line. If it needs more, use a JSDoc block.

## ASCII flow diagrams

For central orchestration points (the file where multiple producers and consumers meet), include an ASCII diagram showing the hierarchy:

```ts
/**
 * ...summary...
 *
 * ```
 * SocketProvider
 *   └─ useDashboardData ──→ initial rows (REST)
 *   └─ useRowEventStore ──→ live patches (WebSocket)
 *        └─ createRowStore
 *             └─ useUserRow
 * ```
 */
```

Use sparingly — only at flow junctions, not on every file.

## Enforcement

- If a hook is exported without a JSDoc block, it is a violation.
- If a `@see` or `@link` references a symbol that doesn't exist, it is a violation.
- If a comment restates what the code does instead of why or how it connects, it is a violation — delete it.
- If a raw `//` comment appears outside the two allowed cases, it is a violation — convert to JSDoc or delete.
