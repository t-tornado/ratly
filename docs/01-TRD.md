# Ratly: Rate Limiting Service TRD

Oct 16, 2026 · Anthony

| Field | Value |
| --- | --- |
| Status | **Draft** |
| Reviewers | [TBD] |
| Task spec | Spikerz Fullstack Task (PDF) |
| UI prototype | [prototypes/v1/prototype.html](../prototypes/v1/prototype.html) |
| Repository | [TBD] |

> **This document is a working draft.** Backend architecture, data model and implementation details are not yet decided. Requirements and UI specs are stable enough to build against.

## Summary

Ratly limits each API user to a configurable number of requests per hour (default 100). Admins watch usage live on a React dashboard and can reset, raise, top up or pause a user's limit.

## Context and problem

The API has no per-user cap, so one client can exhaust shared capacity for everyone. Limits must be tracked per user ID (not IP or MAC), survive multiple server instances, and hold under concurrent bursts from the same user.

Operators also have no visibility: they cannot see who is near the limit, who is being rejected, or step in for a specific customer. This design covers both the enforcement path and the admin console requested in the task spec.

## Goals and non-goals

**Goals**

- No user gets more than their limit (default 100) in a window, even under concurrent requests from the same user.
- Every allowed response carries `x-count` with the requests left; every rejection returns 429 with a message and retry time.
- The dashboard reflects a request within 1 second.
- Admins can reset, adjust, top up and pause a user's limit.

**Non-goals**

- Sliding-window accuracy. Fixed windows accepted for this scope.
- Request history beyond 24 hours.
- Real admin authentication (SSO, roles). Admins are seeded and identified by a dev header.
- Multi-region deployment.
- Per-endpoint or per-plan limits.

## Requirements

**Functional** (traced to the task spec)

| ID | Requirement | Spec |
| --- | --- | --- |
| FR-1 | Limit each user ID to 100 requests per hour, tracked in external storage | BE 1, 3 |
| FR-2 | Reset each user's count every hour | BE 3 |
| FR-3 | Add `x-count` (requests left) to every successful response | BE 4 |
| FR-4 | Never let concurrent requests exceed the limit | BE 5 |
| FR-5 | Return 429 with a message and retry time when over the limit | BE 6 |
| FR-6 | Unit tests with a mocked store | BE 7 |
| FR-7 | Live user table: ID, remaining/total, reset time, status, last request | FE 1 |
| FR-8 | Push live updates over WebSockets | FE 1 |
| FR-9 | User detail: stats, recent requests, last reset, live stream, hour/day history | FE 2 |
| FR-10 | Admin: reset, adjust limit, pause/resume, add extra requests to the current window | FE 3 |
| FR-11 | Search by user ID; filter by status and last active | FE 4 |
| FR-12 | Summary cards and top users in the current window | FE 5 |

**Non-functional**

| Area | Target |
| --- | --- |
| Latency | Rate check adds < 5 ms at p99 |
| Freshness | Dashboard reflects a request within 1 s |
| Availability | [TBD: fail open or closed when store is down] |

## UI specification

The admin dashboard has the following views (see [prototype](../prototypes/v1/prototype.html)):

### Dashboard (main view)
- Summary cards: total users, near-limit %, rejected today, active overrides, top users
- User table with columns: user ID, used/total, remaining, reset time, status, last request
- Status badges: OK (green), Warning (amber at 90%+), Exceeded (red at 100%)
- Search by user ID, filter by status and last active time
- Live updates via WebSocket — rows update without page refresh

### User detail view
- Stats: used, limit, extra, remaining, reset time, status
- Recent requests list (last 50)
- Recent events list (last 50)
- Hour and day history charts (minute and hour buckets)
- Live stream of events for this user

### Admin actions (from user detail)
- **Reset** — clear current window, requires reason
- **Adjust limit** — set new limit (1–10,000), requires reason
- **Add extra** — top up current window (1–1,000), requires reason
- **Pause** — stop rejections for a duration (1–10,080 min), requires reason
- **Resume** — end a pause early, requires reason

## Backend design

> **Status: TBD.** The following are known constraints, not architecture decisions.

**Known constraints:**
- NestJS server (chosen)
- External storage for rate counters (must survive restarts and work across instances)
- Atomic check-and-spend to prevent concurrent overcount
- WebSocket support for live dashboard updates
**Open decisions:**
- [ ] Storage technology for rate counters
- [ ] Storage technology for admin data
- [ ] Atomicity mechanism for concurrent requests
- [ ] Live update delivery mechanism (polling, streams, pub/sub)
- [ ] Admin action consistency model
- [ ] Fail open or fail closed when store is unavailable
- [ ] Window start: first request or top of clock hour
- [ ] Whether rejected requests count toward analytics

## Risks and open questions

- [ ] Fail open or fail closed when store is unavailable?
- [ ] Does a window start at the user's first request or at the top of each clock hour?
- [ ] Should rejected requests count toward analytics totals?
- [ ] "Suspend or unlock throttling" — one pause/resume toggle, or separate "block user" action?

## Future work

| Item | Trigger |
| --- | --- |
| Audit log for admin actions | Compliance or debugging need |
| Sliding window strategy | Edge bursts cause real overload |
| History beyond 24 h | Product requirement |
| Per-plan and per-endpoint limits | Pricing tiers |
