# SocialHub — Self-Hosted Edition

Publish to Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, and Reddit from a single dashboard. This is the **self-hosted Docker version** — everything runs on your own server or machine.

> **Hosted version available** at [socialhub.bonnellio.com](https://socialhub.bonnellio.com) if you'd prefer a managed service.

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Windows) or Docker Engine + Compose plugin (Linux)
- A domain name with DNS control (for production HTTPS) — or just `localhost` for local use
- OAuth credentials for the social platforms you want to connect (details below)

---

## Quick Start (localhost)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/social-hub.git
cd social-hub

# 2. Copy the environment template
cp .env.local.example .env.local

# 3. Fill in the required values (see Configuration below)
#    Minimum required: AUTH_SECRET + at least one OAuth platform
nano .env.local   # or open in any editor

# 4. Build and start
docker compose up --build

# 5. Open https://localhost in your browser
#    Accept the self-signed certificate warning (first run only)
```

Create your first account at **https://localhost/register**.

---

## Configuration

All configuration lives in `.env.local`. Copy `.env.local.example` and fill in the values.

### Required

| Variable | Description | How to get it |
|---|---|---|
| `AUTH_SECRET` | Session signing key | Run `openssl rand -base64 32` |
| `NEXT_PUBLIC_BASE_URL` | Your public URL | `https://localhost` or `https://yourdomain.com` |
| `AUTH_URL` | Same as above | Same as `NEXT_PUBLIC_BASE_URL` |

### Domain (for production HTTPS)

Set `DOMAIN` to your public domain and Caddy handles HTTPS automatically via Let's Encrypt:

```env
DOMAIN=yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
AUTH_URL=https://yourdomain.com
```

For local development leave `DOMAIN=localhost` — Caddy issues a local self-signed certificate.

### Social Platform OAuth

Register a developer app on each platform you want to use. Set the OAuth callback URL to:

```
https://yourdomain.com/api/auth/<platform>/callback
```

Replace `yourdomain.com` with `localhost` for local testing.

#### Twitter / X
1. Go to [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
2. Create an app → enable OAuth 2.0
3. Add callback URL: `https://yourdomain.com/api/auth/twitter/callback`
4. Copy **Client ID** and **Client Secret**

```env
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
```

#### LinkedIn
1. Go to [linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
2. Create an app → add **Sign In with LinkedIn** and **Share on LinkedIn** products
3. Add callback URL: `https://yourdomain.com/api/auth/linkedin/callback`
4. Copy **Client ID** and **Client Secret**

```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

#### Facebook + Instagram
1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Create an app → add **Facebook Login** product
3. Add callback URL: `https://yourdomain.com/api/auth/meta/callback`
4. Copy **App ID** and **App Secret**

```env
META_APP_ID=
META_APP_SECRET=
```

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Enable **YouTube Data API v3**
3. Create an OAuth 2.0 Client ID (Web application)
4. Add callback URL: `https://yourdomain.com/api/auth/youtube/callback`
5. Copy **Client ID** and **Client Secret**

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### TikTok
1. Go to [developers.tiktok.com](https://developers.tiktok.com)
2. Create an app → add **Login Kit** and **Content Posting API**
3. Add callback URL: `https://yourdomain.com/api/auth/tiktok/callback`
4. Copy **Client Key** and **Client Secret**

```env
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
```

#### Reddit
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) → **create another app**
2. Choose type: **web app**
3. Set redirect URI: `https://yourdomain.com/api/auth/reddit/callback`
4. Copy **client id** (under app name) and **secret**

```env
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

### Email (password reset)

Without this, password reset links are printed to `docker logs` instead of emailed.

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Billing (optional — Stripe)

Only needed if you want to charge for Pro plan access. Leave blank to make all accounts Pro by default.

```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Deploying to a Server

### DNS Setup

Point your domain's A record to your server's public IP:

```
Type  Name   Value           TTL
A     @      YOUR.SERVER.IP  Auto
```

If using a subdomain (`app.yourdomain.com`):

```
Type  Name   Name   Value           TTL
A     app    app    YOUR.SERVER.IP  Auto
```

### Deploy

```bash
# On your server — copy your .env.local file then:
docker compose up -d --build
```

Caddy automatically obtains a Let's Encrypt certificate on first startup. Your site will be live at `https://yourdomain.com` within a minute.

### Firewall

Open ports 80 (HTTP) and 443 (HTTPS) — Caddy handles the rest. Port 3000 (the Next.js app) does not need to be exposed.

---

## Managing Your Instance

### View logs

```bash
docker compose logs -f          # all services
docker compose logs -f app      # app only
docker compose logs -f caddy    # HTTPS / proxy
```

### Stop / start

```bash
docker compose down             # stop (data is preserved)
docker compose up -d            # start in background
```

### Restart after config change

```bash
docker compose down && docker compose up -d --build
```

### Backup your data

All persistent data is stored in Docker named volumes:

| Volume | Contents |
|---|---|
| `app_data` | Uploaded media, user database (when Redis is down) |
| `redis_data` | User accounts, OAuth tokens, scheduled post queue |
| `caddy_data` | TLS certificates |

To back up Redis data:

```bash
docker run --rm \
  -v social-hub-docker_redis_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/redis-backup.tar.gz /data
```

### Update to a new version

```bash
git pull
docker compose down
docker compose up -d --build
```

---

## Trusting the Localhost Certificate

When running on `localhost`, Caddy issues a self-signed certificate. To avoid browser warnings:

**Chrome / Edge**: Click "Advanced" → "Proceed to localhost (unsafe)" on first visit.

**Firefox**: Click "Advanced" → "Accept the Risk and Continue".

**System-wide trust** (optional):

```bash
docker exec $(docker compose ps -q caddy) caddy trust
```

---

## Media Upload Notes

When running on `localhost`, only **YouTube** (server-to-server upload) can receive media — other platforms (Facebook, Instagram, TikTok) fetch media via a public URL and can't reach `localhost`. Switch to a public domain to enable media on all platforms.

---

## Troubleshooting

**App won't start / build fails**
```bash
docker compose logs app
```

**"Invalid redirect URI" during OAuth**
- Make sure the callback URL in your developer app exactly matches `https://yourdomain.com/api/auth/<platform>/callback`
- The URL must use HTTPS

**Password reset email not arriving**
- Check `docker compose logs app` — if `RESEND_API_KEY` is not set, the reset URL is printed there instead
- Verify your Resend domain shows a green checkmark in the Resend dashboard

**Certificate errors in browser**
- Make sure ports 80 and 443 are open on your firewall
- Caddy needs port 80 to complete the Let's Encrypt ACME challenge before it can serve 443

**Redis connection refused**
- Redis starts alongside the app — give it a few seconds after `docker compose up`
- Check `docker compose logs redis`

---

## Architecture

```
Browser → Caddy (443/80) → Next.js app (3000, internal) → Redis (6379, internal)
                                    ↓
                             data/ volume
                         (uploads, fallback DB)
```

- **Caddy** — reverse proxy + automatic HTTPS (Let's Encrypt in production, self-signed on localhost)
- **Next.js** — app server (standalone build, no Node.js install needed on host)
- **Redis** — session storage, OAuth tokens, scheduled post queue, user accounts
- **data/ volume** — local media uploads; fallback JSON storage when Redis is unavailable

---

## License

MIT
