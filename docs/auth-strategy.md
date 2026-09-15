# Authentication Strategy

## Decision: Sanctum SPA Cookie Mode

We use Laravel Sanctum's SPA (single-page application) authentication mode —
httpOnly session cookies — rather than issuing bearer tokens stored in
localStorage.

## Why

- **XSS protection**: httpOnly cookies cannot be read by JavaScript, even if
  a malicious script gets injected into the frontend. A bearer token sitting
  in `localStorage` is directly readable by any script running on the page —
  a much larger attack surface.
- **Same organization, trusted origins only**: our frontend (`localhost:3000`
  in dev) and backend (`localhost:8000` in dev) are both first-party,
  controlled by us. Sanctum's stateful domain list
  (`SANCTUM_STATEFUL_DOMAINS`) is built exactly for this scenario — trusted
  frontends sharing a session with the API, without needing full OAuth-style
  token issuance.
- **Simpler frontend code**: no manual token storage, retrieval, or
  attaching `Authorization` headers on every request — the browser handles
  sending the session cookie automatically once authenticated.

## What this means in practice

- Backend: `statefulApi()` middleware registered in `bootstrap/app.php`,
  CORS configured with `supports_credentials: true` and an explicit
  frontend origin (not a wildcard).
- Frontend: `apiClient.ts` sets `withCredentials: true` on all requests.
- The `Authorization: Bearer <token>` fallback currently in
  `apiClient.ts`'s interceptor exists for potential future use (e.g. a
  mobile app consuming the same API), but is not the primary auth path for
  the web frontend.

## Status

Structural only as of Sprint 0 — no real login endpoint exists yet. This
document reflects the intended approach for Sprint 1's implementation.