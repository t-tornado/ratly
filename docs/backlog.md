# Backlog

Things we want but chose to defer. Not blocked — just not needed yet.

## Server Observability

The server has no RED metrics (request rate, error rate, duration) and no USE metrics (utilization, saturation, errors) for its resources. The UI shows live rate-limit data, but that's application state — not system health.

**What's missing:**

- **RED** — We don't know how fast requests are served, how many fail, or how often users hit the rate limit. A latency spike or elevated 429 rate is invisible until a user reports it.
- **USE** — We don't know how much CPU, memory, or network the server consumes, whether the Node.js event loop is lagging, or if Redis is becoming a bottleneck.

Adding both gives us the ability to detect degradation before it becomes an outage, size the server correctly under load, and reason about capacity with data instead of guesses.

Dashboards should be committed to the repo so reviewers and contributors get them automatically — no manual setup.

### Stack

- **Collection:** OpenTelemetry SDK (`@opentelemetry/sdk-node`) instruments the NestJS server
- **Transport:** OTel Collector receives telemetry and forwards it to the backend
- **Backend:** OpenObserve stores and visualizes metrics, logs, and traces
- **Dashboards:** JSON files in `monitoring/dashboards/`, provisioned via OpenObserve API on startup
- **Infra:** OTel Collector and OpenObserve added as services in the existing Docker Compose

### When to pick this up

- Before any real deployment
- When load testing needs performance data beyond what the UI shows

## Authentication

The app is completely open right now. Anyone with the URL can access the dashboard and perform admin actions — reset windows, adjust limits, add extra requests. There's no identity, no access control, and no audit trail.

This is an enterprise-facing tool. Admin actions should be restricted to verified users.

**What needs to happen:**

1. Integrate OAuth (e.g. Google, GitHub, or an internal identity provider) so users authenticate with a real identity
2. Add a server-side guard or middleware that rejects unauthenticated requests to all API endpoints
3. Add a login screen on the UI that redirects to the OAuth provider
4. Protect all UI routes — unauthenticated users see only the login screen
5. Store the session so users stay logged in across page refreshes

### When to pick this up

- Before any real deployment or external access
