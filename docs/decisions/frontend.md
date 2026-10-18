# Frontend Technical Decisions

---

## 1. Client-side filtering paired with virtualization

The dashboard consumes a live SSE event stream. Events arrive continuously and are held in React state. There is no server-side persistence layer and no query endpoint.

**Why filtering is client-side:**

Server-side filtering requires a queryable store: a database, a search index, or at minimum a paginated API. None of those exist. The data lives in memory because that is the only place it can live — it is a stream, not a collection. Filtering an in-memory array on every keystroke or dropdown change is O(n) and negligible in practice.

Sending filter parameters back to the server would mean either re-replaying the event history (not supported) or buffering events on the server per-connection and filtering there. That complexity buys nothing; the client already has all the data.

**Why virtualization is required:**

Without virtualization, every received event produces a DOM node. A high-volume stream can deliver thousands of rows quickly. Rendering all of them causes layout thrash and frame drops regardless of how fast the filter runs.

Virtualization keeps the DOM size constant — only the visible rows are mounted. The filter reduces the virtual list's source array; the virtualizer handles what to render. Together they let the UI stay responsive at scale without any changes to the data model or the transport layer.

**Tradeoff:** if the stream runs long enough, the in-memory event array grows unbounded. At extreme volume this becomes a memory concern. The correct fix at that point is to introduce a server-side persistence layer and switch to paginated queries, not to move filtering server-side over the existing stream.
