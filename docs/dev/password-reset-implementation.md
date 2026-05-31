# Password Reset — Developer Reference

> **Note:** This feature is not yet implemented in Social Hub. This document serves as the canonical spec and can be used as a starting point when implementation begins.

## Overview

Password reset allows a user who has forgotten their credentials to receive a time-limited, single-use magic link via email. Clicking the link loads a form where they set a new password. The old password is immediately invalidated on submission.

## Scope

- [x] Frontend — reset-request form, new-password form, success/error states
- [x] Backend — token generation, email dispatch, token validation, password update
- [ ] Full-stack (checked boxes above cover both sides)

---

## Architecture

### Components / Pages

| File | Responsibility |
|---|---|
| `src/app/reset-password/page.tsx` | Step 1 — email entry form (server component shell, client form) |
| `src/app/reset-password/[token]/page.tsx` | Step 2 — new password entry form; reads `token` from URL |
| `src/components/reset-password-form.tsx` | Client component: email input, submit, loading/error state |
| `src/components/new-password-form.tsx` | Client component: password + confirm inputs, strength meter |

### API Endpoints

#### `POST /api/auth/reset-password/request`
Initiates the reset flow.

- **Auth required:** No
- **Request body:**
  ```json
  { "email": "user@example.com" }
  ```
- **Response (always 200 to prevent email enumeration):**
  ```json
  { "ok": true }
  ```
- **Side effects:** If the email matches a user, generates a reset token, stores it in Redis with a 15-minute TTL, and dispatches an email containing the magic link.

---

#### `POST /api/auth/reset-password/confirm`
Validates the token and updates the password.

- **Auth required:** No
- **Request body:**
  ```json
  { "token": "<uuid>", "password": "<new-password>" }
  ```
- **Response (success):**
  ```json
  { "ok": true }
  ```
- **Error codes:**

| Status | `error` value | Meaning |
|---|---|---|
| 400 | `invalid_token` | Token not found or already used |
| 400 | `expired_token` | Token older than 15 minutes |
| 422 | `weak_password` | Password fails strength requirements |
| 500 | `internal_error` | Unexpected server error |

### Data Flow (full-stack)

1. User visits `/reset-password` and submits their email address.
2. `POST /api/auth/reset-password/request` receives the email.
3. Server looks up the user in the database.
4. If found: generates a `crypto.randomUUID()` token, stores `reset:<token>` → `userId` in Redis with `EX 900` (15 min TTL), sends the magic link email via Resend.
5. Response always returns `{ ok: true }` regardless of whether the email matched.
6. User clicks the magic link → browser loads `/reset-password/<token>`.
7. User submits new password via `POST /api/auth/reset-password/confirm`.
8. Server reads `reset:<token>` from Redis; if missing or expired → error.
9. Server hashes the new password (bcrypt, cost 12), updates the user record.
10. Server deletes `reset:<token>` from Redis (single-use enforcement).
11. Response `{ ok: true }` → client redirects to login page.

### Storage

#### Redis keys

| Key pattern | Value | TTL |
|---|---|---|
| `reset:<uuid-token>` | `userId` (string) | 900 s (15 min) |

#### Database

No schema changes required if `users` table already has a `password_hash` column. If not, add:

```sql
ALTER TABLE users ADD COLUMN password_hash TEXT;
```

---

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `RESEND_API_KEY` | Email dispatch via Resend | Yes |
| `RESEND_FROM_EMAIL` | Sender address (`noreply@...`) | Yes |
| `UPSTASH_REDIS_REST_URL` | Redis for token storage | Yes (already configured) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth | Yes (already configured) |
| `NEXT_PUBLIC_BASE_URL` | Base URL for magic link generation | Yes (already configured) |

---

## External Dependencies

- [Resend](https://resend.com/docs) — transactional email API (`npm i resend`)
- [bcrypt](https://www.npmjs.com/package/bcrypt) or [bcryptjs](https://www.npmjs.com/package/bcryptjs) — password hashing
- Upstash Redis — already in use for token storage elsewhere in this project

---

## Known Limitations / Edge Cases

- **Email enumeration**: The request endpoint always returns `200 { ok: true }` — do not change this to prevent leaking which emails exist in the system.
- **Single-use tokens**: The Redis key is deleted immediately on successful confirm. A second attempt with the same token returns `invalid_token`.
- **No rate limiting yet**: The request endpoint should be rate-limited to ~3 requests per email per hour to prevent spam. Add before shipping.
- **Social OAuth users**: Users who signed up exclusively via Google/Twitter OAuth have no `password_hash`. The reset flow should detect this and return a friendly message: "Your account uses social login — no password to reset."
- **Token length**: UUID v4 is 36 characters. Do not shorten it.

---

## Cross-reference

→ User guide: [docs/user/how-to-reset-password.md](../user/how-to-reset-password.md)
