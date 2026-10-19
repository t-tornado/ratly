# Documentation

## Architecture and decisions

| Document | What it covers |
| --- | --- |
| [decisions/architecture.md](decisions/architecture.md) | Why Redis-only, ephemeral state, monorepo, WebSocket + REST |
| [decisions/backend.md](decisions/backend.md) | Fixed window, TOCTOU safety, activity tracking counters |
| [decisions/frontend.md](decisions/frontend.md) | Client-side filtering, per-row pub/sub store |

## System design

| Document | What it covers |
| --- | --- |
| [01-redis-data-model.md](01-redis-data-model.md) | Every Redis key, type, TTL, who reads and writes it |
| [02-admin-actions.md](02-admin-actions.md) | All admin endpoints, validation, edge cases |
| [03-flows-and-scripts.md](03-flows-and-scripts.md) | Request flow, Lua scripts, dashboard load, stats timer |

## Original requirements

| Document | What it covers |
| --- | --- |
| [system/diagrams/01-TRD.md](system/diagrams/01-TRD.md) | Technical Requirements Document — goals, UI spec, requirements matrix |
| [system/diagrams/architecture.png](system/diagrams/architecture.png) | System architecture diagram |

## Agent system

| Document | What it covers |
| --- | --- |
| [agentic-playbook/README.md](agentic-playbook/README.md) | Overview of the agent system and what's automated |
| [agentic-playbook/ratis.md](agentic-playbook/ratis.md) | Ratis — autonomous issue agent, phases, doability criteria |
| [agentic-playbook/skills.md](agentic-playbook/skills.md) | Full index of all Claude Code skills |

## Roadmap

| Document | What it covers |
| --- | --- |
| [backlog.md](backlog.md) | Deferred work — observability, authentication, and what triggers each |
