@AGENTS.md

# SocialHub — AI Agent Guide

## What this project is

SocialHub is a self-hostable social media management platform. Users connect their social accounts via OAuth and post/schedule content across platforms from a single UI. There are two maintained deployment targets that live on separate git branches:

| Branch   | Target            | Storage backend         | File uploads          |
|----------|-------------------|-------------------------|-----------------------|
| `main`   | Vercel (cloud)    | Upstash Redis (REST)    | Vercel Blob           |
| `docker` | Self-hosted Docker| IORedis (direct TCP)    | Local filesystem      |

**Keep both branches in sync for all `src/` changes that are not deployment-specific.** Docker-specific files (`Dockerfile`, `docker-compose.yml`, `Caddyfile`, `src/lib/redis.ts`, the local upload routes) must never be merged into `main`. Shared logic changes (API routes, post engine, UI, auth) must exist identically in both branches. The workflow is: make the change on whichever branch is natural, then cherry-pick the relevant commits to the other.

---

## Tech stack

- **Next.js 16** (App Router, `output: "standalone"`) — read `node_modules/next/dist/docs/` before writing any Next.js code; this version has breaking changes vs older training data
- **React 19** with Server Components and Client Components (`"use client"`)
- **Tailwind CSS v4** — PostCSS plugin, no `tailwind.config.js`
- **NextAuth v5** (`next-auth@5.0.0-beta`) — credentials provider only (email + bcrypt password)
- **Radix UI** primitives + **Lucide React** icons
- **Recharts** for analytics charts
- **Zustand** for client-side draft/compose state
- **Framer Motion** for transitions
- **Stripe** for optional billing (hosted checkout + customer portal)
- **PWA** via `@ducanh2912/next-pwa`

---

## Repository layout

```
src/
  app/                       # Next.js App Router pages and API routes
    (legal)/                 # Privacy + Terms — no sidebar layout
    api/
      auth/
        [...nextauth]/       # NextAuth handler
        [platform]/disconnect/
        meta/connect|callback/   # Facebook + Instagram (one OAuth flow)
        twitter|linkedin|tiktok|reddit|youtube/connect|callback/
        forgot-password|register|reset-password/
      post/                  # Immediate publish endpoint
      schedule/              # Schedule CRUD endpoints
      status/                # Returns connected-platform status for current user
      upload/                # File upload (Vercel Blob or local FS)
      uploads/[filename]/    # Serve locally stored files (docker branch only)
      tiktok-verify/         # TikTok domain verification
      me/                    # Current user info
      discover/reddit|youtube/
      stripe/                # Checkout, portal, success
      webhooks/stripe/
    accounts/                # OAuth connect/disconnect UI
    compose/                 # Post composer
    dashboard/
    scheduled/
    analytics/
    discover/
    settings/
    help/
    notifications/
    login|register|forgot-password|reset-password/
    tiktok-developers-site-verification.txt/  # TikTok verification route
  auth.ts                    # NextAuth configuration (server)
  auth.config.ts             # Shared auth config (used in middleware too)
  proxy.ts                   # Next.js middleware — auth guard + TikTok verification
  instrumentation.ts         # Starts the scheduler on server boot (Node.js only)
  components/
    sidebar.tsx              # Main nav (desktop + mobile bottom bar)
    platform-icon.tsx        # Per-platform SVG icons
    analytics-chart.tsx
    post-card.tsx
    stats-card.tsx
    providers.tsx            # SessionProvider wrapper
  lib/
    data.ts                  # PLATFORMS array, Platform type, mock post data
    post-engine.ts           # Per-platform publish functions + publishAll()
    scheduled-store.ts       # Scheduled posts CRUD (Redis or JSON file)
    tokens.ts                # OAuth token read/write per user (Redis or JSON file)
    user-store.ts            # User accounts (Redis or JSON file)
    reset-store.ts           # Password reset tokens (Redis or JSON file)
    scheduler.ts             # setInterval loop — runs publishAll() for due posts
    compatibility.ts         # Platform × media-type support matrix
    store.ts                 # Zustand client store (compose draft, selected platforms)
    redis.ts                 # IORedis wrapper (docker branch only)
    email.ts                 # Nodemailer / SMTP email sender
    oauth/pkce.ts            # PKCE helpers (state, verifier, challenge)
    utils.ts                 # cn(), formatNumber()
```

---

## Storage pattern

Every data module (`tokens.ts`, `user-store.ts`, `scheduled-store.ts`, `reset-store.ts`) follows the same dual-backend pattern:

```
Redis available?  →  read/write Redis  (key prefix: socialhub:*)
Redis absent?     →  read/write JSON file in /app/data/
```

On **Vercel** (`main`): Redis = Upstash REST via `@upstash/redis`. Env vars: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.  
On **Docker** (`docker`): Redis = IORedis via `src/lib/redis.ts`. Env var: `REDIS_URL` (set automatically by `docker-compose.yml`). Falls back to `data/*.json` if Redis is absent.

Never bypass this pattern. Do not add new `fs` calls or Redis calls outside of the established store modules.

---

## OAuth token storage

`src/lib/tokens.ts` stores one `TokenStore` object per `userId` under the key `socialhub:tokens:{userId}`. All platform tokens live inside that object. Interfaces:

- `TwitterToken` — `accessToken`, `refreshToken`, `expiresAt`
- `FacebookToken` — `pageAccessToken`, `pageId`, `pageName`
- `InstagramToken` — `igUserId`, `pageId`, `pageAccessToken`, `username`
- `LinkedInToken` — `accessToken`, `refreshToken`, `expiresAt`, `personUrn`, `name`
- `TikTokToken` — `accessToken`, `refreshToken`, `expiresAt`, `openId`, `displayName`
- `RedditToken` — `accessToken`, `refreshToken`, `expiresAt`, `username`
- `YouTubeToken` — `accessToken`, `refreshToken`, `expiresAt`, `channelId`, `channelTitle`

LinkedIn and TikTok have in-engine refresh logic (`refreshLinkedInIfNeeded`, `refreshTikTokIfNeeded`) called at publish time.

---

## Adding a new platform

1. **`src/lib/data.ts`** — add the platform ID to the `Platform` union and the `PLATFORMS` array (name, handle, color, followers placeholder).
2. **`src/lib/tokens.ts`** — add a token interface and add the field to `TokenStore`.
3. **`src/app/api/auth/{platform}/connect/route.ts`** — build the OAuth redirect URL. Use PKCE (`src/lib/oauth/pkce.ts`) if the provider requires it (TikTok does; Twitter does too via NextAuth).
4. **`src/app/api/auth/{platform}/callback/route.ts`** — exchange code for tokens, call `setToken()`, redirect to `/accounts?success={platform}`.
5. **`src/lib/post-engine.ts`** — add a `postTo{Platform}()` function and call it inside `publishAll()`.
6. **`src/lib/compatibility.ts`** — add the platform row to `COMPATIBILITY` (text / image / video support).
7. **`src/app/accounts/page.tsx`** — add the OAuth URL to `OAUTH_MAP` and any success/error message strings.
8. **`src/app/api/status/route.ts`** — add the platform to the status response.
9. **`src/components/platform-icon.tsx`** — add an SVG icon case.
10. **`.env.local.example`** — document the required env vars.

---

## Platform post engine

`src/lib/post-engine.ts` — `publishAll()` fans out to per-platform functions in parallel (`Promise.all`). Each function returns `PostResult { platform, success, postId?, postUrl?, error? }`.

Current API versions:
- **Meta (Facebook + Instagram)**: Graph API **v21.0** — do not downgrade
- **LinkedIn**: `https://api.linkedin.com/v2/`
- **Twitter**: `https://api.twitter.com/2/`
- **TikTok**: `https://open.tiktokapis.com/v2/`
- **Reddit**: `https://oauth.reddit.com/`
- **YouTube**: `https://www.googleapis.com/youtube/v3/`

Instagram posts require an image or video — text-only is not supported by the API. TikTok only accepts video. See `src/lib/compatibility.ts` for the full matrix.

---

## Scheduler

`src/instrumentation.ts` calls `startScheduler()` on server boot (Node.js runtime only). The scheduler polls `getPendingDue()` every 30 seconds and calls `publishAll()` for each due post. Scheduled posts are stored as `ScheduledPost` objects in `scheduled-store.ts`.

The scheduler runs inside the Next.js server process. There is no separate worker or cron job — this works correctly in a persistent Docker container but **will not fire reliably on Vercel** (serverless, no persistent process). On Vercel, scheduled posts require an external cron trigger hitting `/api/schedule` or a Vercel Cron job.

---

## Auth flow

- `src/proxy.ts` — Next.js middleware handles auth guards and TikTok URL verification
- Protected routes: everything except `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/api/auth/*`
- Session strategy: JWT (no database session table)
- User accounts stored in `user-store.ts` (Redis or `data/users.json`)
- Password reset flow: token stored in `reset-store.ts`, email sent via `src/lib/email.ts`

---

## TikTok verification

Three verification codes are served at `/tiktok-developers-site-verification.txt` (via `src/proxy.ts` middleware and `src/app/tiktok-developers-site-verification.txt/route.ts`). A fourth is at `/api/tiktok-verify`. The app is pending TikTok production API approval — the OAuth connect/callback and post engine are fully implemented and ready.

---

## Environment variables

### Shared (both branches)

```
NEXT_PUBLIC_BASE_URL      # Full public URL, e.g. https://yourdomain.com
AUTH_URL                  # Same as NEXT_PUBLIC_BASE_URL (required by NextAuth)
AUTH_SECRET               # Random secret: openssl rand -base64 32
META_APP_ID / META_APP_SECRET
TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET
LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET
TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET
STRIPE_PUBLISHABLE_KEY / STRIPE_SECRET_KEY / STRIPE_PRICE_ID / STRIPE_WEBHOOK_SECRET
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM   # For password reset emails
```

### Vercel only (`main`)

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
BLOB_READ_WRITE_TOKEN     # Vercel Blob
```

### Docker only (`docker`)

```
REDIS_URL                 # Set automatically by docker-compose (redis://redis:6379)
DOMAIN                    # Domain for Caddy TLS cert (default: localhost)
```

---

## Running locally

**Docker branch:**
```bash
cp .env.local.example .env.local   # fill in secrets
docker compose up --build
```
The app is available at `https://localhost` (Caddy handles HTTPS with a self-signed cert). To trust the cert: `docker exec <caddy-container> caddy trust`.

**Vercel branch (main):**
```bash
cp .env.local.example .env.local   # fill in secrets
npm install
npm run dev                         # runs on http://localhost:3000
```

---

## Key invariants

- **Do not use `@upstash/redis` on the `docker` branch.** It uses `src/lib/redis.ts` (IORedis wrapper) instead.
- **Do not use `@vercel/blob` directly on the `docker` branch.** The upload route detects `BLOB_READ_WRITE_TOKEN` and falls back to local storage automatically.
- **Meta Graph API must stay at v21.0 or higher.** v18.0 is past its support window.
- **All OAuth callbacks use `NEXT_PUBLIC_BASE_URL` as the base**, never hardcoded domains.
- **The `src/proxy.ts` middleware must stay lean** — it runs on every request. Do not add heavy logic.
- **`publishAll()` is the only entry point for posting.** Never call per-platform functions directly from API routes.
- **`src/lib/data.ts` `PLATFORMS` array is the single source of truth** for what platforms exist — derived everywhere else from it.
