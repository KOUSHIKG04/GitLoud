<div align="center">
  <img src="apps/web/public/app-logo.svg" alt="GitLoud logo" width="84" height="84" />

  <h1>GitLoud</h1>

  <p>
    <strong>Turn GitHub pull requests and commits into clear, reusable developer content.</strong>
  </p>

  <p>
    GitLoud reads public GitHub work and transforms it into summaries, changelog notes,
    beginner explanations, portfolio bullets, and share-ready posts for LinkedIn, X,
    Reddit, and Discord.
  </p>

  <p>
    <a href="#features"><strong>Features</strong></a>
    &middot;
    <a href="#tech-stack"><strong>Tech Stack</strong></a>
    &middot;
    <a href="#local-development"><strong>Run Locally</strong></a>
    &middot;
    <a href="#deployment"><strong>Deploy</strong></a>
  </p>

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-ready-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  </p>
</div>

---

## Overview

GitLoud is built for developers who ship useful work but do not want to rewrite the
same GitHub context for every platform. Submit a public pull request or commit URL,
and the app produces structured content from real GitHub metadata and code changes.

The product combines a protected dashboard, saved generation history, optional media
attachments, AI-powered writing, and PostgreSQL-backed persistence in a Turborepo
workspace. The product now uses a separate Hono API app so the web app and the
Electron app can share the same backend routes instead of duplicating server logic.

## Demo

https://github.com/user-attachments/assets/7a7b4f4f-0fe6-4298-8292-893e7fd79454

## Features

<table>
  <tr>
    <td width="50%">
      <h3>GitHub-aware generation</h3>
      <p>Submit a public pull request or commit URL and generate content from real repository metadata and code changes.</p>
    </td>
    <td width="50%">
      <h3>Platform-ready output</h3>
      <p>Create short summaries, technical notes, beginner explanations, changelog entries, portfolio bullets, and social posts, including Standard X and X Premium post lengths.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Authenticated dashboard</h3>
      <p>Clerk protects the dashboard, saved generations, detail pages, regeneration actions, and profile sync flow.</p>
    </td>
    <td width="50%">
      <h3>Saved history</h3>
      <p>Reopen previous generations, copy content, regenerate output with saved preferences, and delete records that are no longer needed.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Media attachments</h3>
      <p>Upload optional images or videos through Cloudinary and keep hosted media metadata with generated content.</p>
    </td>
    <td width="50%">
      <h3>Production-minded workflow</h3>
      <p>Validate GitHub URLs, detect PRs versus commits, apply rate limits, parse AI output with shared schemas, persist records through Prisma, and reuse matching generations safely.</p>
    </td>
  </tr>
</table>

## Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/turborepo/EF4444" width="36" height="36" alt="Turborepo" />
        <br />
        <sub><strong>Turborepo</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/nextdotjs/000000" width="36" height="36" alt="Next.js" />
        <br />
        <sub><strong>Next.js 16</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/react/61DAFB" width="36" height="36" alt="React" />
        <br />
        <sub><strong>React 19</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/typescript/3178C6" width="36" height="36" alt="TypeScript" />
        <br />
        <sub><strong>TypeScript</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="36" height="36" alt="Tailwind CSS" />
        <br />
        <sub><strong>Tailwind CSS</strong></sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/hono/E36002" width="36" height="36" alt="Hono" />
        <br />
        <sub><strong>Hono API</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/clerk/6C47FF" width="36" height="36" alt="Clerk" />
        <br />
        <sub><strong>Clerk</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/prisma/2D3748" width="36" height="36" alt="Prisma" />
        <br />
        <sub><strong>Prisma 7</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/postgresql/4169E1" width="36" height="36" alt="PostgreSQL" />
        <br />
        <sub><strong>PostgreSQL</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/googlegemini/8E75B2" width="36" height="36" alt="Google Gemini" />
        <br />
        <sub><strong>Gemini</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/github/181717" width="36" height="36" alt="GitHub" />
        <br />
        <sub><strong>Octokit</strong></sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/cloudinary/3448C5" width="36" height="36" alt="Cloudinary" />
        <br />
        <sub><strong>Cloudinary</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/zod/3E67B1" width="36" height="36" alt="Zod" />
        <br />
        <sub><strong>Zod</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/reacthookform/EC5990" width="36" height="36" alt="React Hook Form" />
        <br />
        <sub><strong>React Hook Form</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/vercel/000000" width="36" height="36" alt="Vercel" />
        <br />
        <sub><strong>Vercel</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/expo/000020" width="36" height="36" alt="Expo" />
        <br />
        <sub><strong>Expo</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/electron/47848F" width="36" height="36" alt="Electron" />
        <br />
        <sub><strong>Electron</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/docker/2496ED" width="36" height="36" alt="Docker" />
        <br />
        <sub><strong>Docker</strong></sub>
      </td>
    </tr>
  </table>
</div>

## Workspace

```txt
apps/
  api/                  Standalone Hono backend API
  web/                  Production Next.js application
  electron/             Electron desktop workspace
  mobile/               Expo mobile workspace
  docs/                 Documentation/example workspace

packages/
  ai/                   Gemini prompt and generation logic
  db/                   Prisma schema, generated client, and database access
  github/               GitHub PR and commit fetchers
  shared/               Shared Zod schemas and domain types
  ui/                   Shared UI package
  eslint-config/        Shared ESLint config
  typescript-config/    Shared TypeScript config
```

The web app keeps route files inside `apps/web/app`. Shared web UI lives in
`apps/web/components`, shared web helpers live in `apps/web/lib`, and route-only
helpers live in colocated `_components` folders.

## Product Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing/home page |
| `/examples` | Example generated content |
| `/dashboard` | Authenticated generation dashboard |
| `/dashboard/history` | Authenticated generation history |
| `/dashboard/generations/:id` | Authenticated generation detail |
| `/sign-in` | Custom sign-in page |
| `/sign-up` | Custom sign-up page |
| `/privacy` | Privacy policy |
| `/terms` | Terms page |

## API Routes

The backend API is served by `apps/api` and defaults to:

```txt
http://localhost:4000
```

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `POST` | `/pr` | Generate content from a PR or commit URL |
| `POST` | `/media` | Upload media attachment metadata/assets |
| `GET` | `/generations` | Read saved generation history |
| `GET` | `/generations/:id` | Read a saved generation |
| `DELETE` | `/generations/:id` | Delete a saved generation |
| `POST` | `/generations/:id/regenerate` | Regenerate saved content |
| `POST` | `/profile/sync` | Sync authenticated user profile |
| `POST` | `/jobs/delete-old-generations` | Delete generations older than the retention window |

The same routes are also available under `/v1/*`. Browser and Electron clients call
the API with a Clerk bearer token. Protected dashboard routes are enforced in
`apps/web/proxy.ts` with Clerk middleware.

## Required

Before running GitLoud locally, make sure these are available:

- Node.js `20.9` or newer
- npm `10.9.7` or compatible
- PostgreSQL database
- Clerk application
- Google Gemini API key
- GitHub token
- Cloudinary account, if media uploads are enabled

## Environment Variables

Create `.env.local` in the repository root for local development. Configure production
variables in your hosting provider settings.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
API_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
PORT=4000

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash"

GITHUB_TOKEN="..."

NEXT_PUBLIC_SITE_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

CRON_SECRET="..."
```

For production, set public URLs to deployed domains:

```bash
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="https://your-api-domain.com"
API_ALLOWED_ORIGINS="https://your-domain.com"
```

`NEXT_PUBLIC_API_BASE_URL` was used by the old Next.js API route setup. The current
web app uses `NEXT_PUBLIC_API_URL` and calls the standalone Hono API.

For managed PostgreSQL providers such as Neon, Supabase, or Railway, keep SSL enabled
when the provider requires it. When running the API inside Docker against a local
PostgreSQL server, use `host.docker.internal` instead of `localhost` in
`DATABASE_URL`.

The database package loads environment files from root `.env.local`, root `.env`,
and `packages/db/.env` in that order. Because dotenv keeps existing values by
default, earlier files take precedence.

## Local Development

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npm --workspace @repo/db run db:generate
```

Start the web app:

```bash
npm run web
```

Start the standalone backend API:

```bash
npm run api
```

Open the app at:

```txt
http://localhost:3000
```

Open the API health check at:

```txt
http://localhost:4000/health
```

### Run The API With Docker

Build the backend image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t gitloud-api .
```

Run the API container:

```bash
docker run --rm -p 4000:4000 --env-file .env.local gitloud-api
```

The Docker image uses a multi-stage build. The builder stage installs dependencies
and builds the API; the runner stage starts the compiled API with plain Node.

## Database

The Prisma schema lives at `packages/db/prisma/schema.prisma`.

Saved generations persist the selected X post length (`STANDARD` or `PREMIUM`) so
regeneration keeps the same X output style. Standard and Premium generations are
stored as separate reusable records for the same source/context.

```bash
# Generate the Prisma client
npm --workspace @repo/db run db:generate

# Apply committed migrations to an existing database
npx prisma migrate deploy --config packages/db/prisma.config.ts

# Push schema changes during early development
npm --workspace @repo/db run db:push

# Open Prisma Studio
npm --workspace @repo/db run db:studio
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run all development servers through Turbo |
| `npm run web` | Run only the web app |
| `npm run api` | Run only the Hono backend API |
| `npm run desktop` | Run the Electron desktop app |
| `npm run desktop:build` | Build the Electron desktop app |
| `npm run mobile` | Run the mobile workspace |
| `npm run lint` | Lint all workspaces |
| `npm run check-types` | Type-check all workspaces |
| `npm run build` | Build all workspaces |
| `npm --workspace web run build` | Build only the web app |
| `npm --workspace api run build` | Build only the backend API |
| `npm run format` | Format source files |

## Deployment

GitLoud is split into a web frontend and a backend API:

- `apps/web` deploys to Vercel.
- `apps/api` deploys separately, for example on Render, Railway, Fly.io, or a Docker host.

Recommended production services:

- Vercel for the Next.js app
- Render/Railway/Fly/Docker hosting for the Hono API
- Managed PostgreSQL for the database
- Clerk for authentication
- Google Gemini for AI generation
- GitHub token or future GitHub App credentials
- Cloudinary for media uploads

Before deploying:

1. Deploy the API and set server secrets such as `DATABASE_URL`, `CLERK_SECRET_KEY`, `GITHUB_TOKEN`, `GEMINI_API_KEY`, and Cloudinary credentials.
2. Set `API_ALLOWED_ORIGINS` on the API to include the Vercel web domain.
3. Set `NEXT_PUBLIC_API_URL` in Vercel to the deployed API URL.
4. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production web domain.
5. Confirm Clerk redirect URLs include the production domain.
6. Confirm Cloudinary credentials are set if uploads are enabled.
7. Confirm the database allows connections from the API deployment environment.
8. Run lint, type checks, and production builds locally or in CI.

Production verification:

```bash
npm run lint
npm run check-types
npm run build
```

## Security Notes

- Dashboard and generation APIs are protected by Clerk middleware.
- The standalone API verifies Clerk bearer tokens before protected backend work.
- Users can only access their own saved generations.
- GitHub inputs are validated and limited to public PR/commit URLs.
- AI output is parsed through shared Zod schemas.
- Media uploads are stored as metadata and are not sent as AI input.
- X post length preferences are stored with generations and reused during regeneration.
- Secrets must never be committed. Keep them in local `.env.local`, Docker env files, and deployment environment variables.
- If secrets are exposed, rotate them at the provider before continuing.

## Current Scope

GitLoud currently supports manual generation from public GitHub PRs and commits,
with Standard X and X Premium post length selection. The backend API is separated
from the web app so the same service can be reused by Electron and future clients.
Private repository support, GitHub App installation, webhook ingestion, background
queues, and advanced content editing are future expansion areas.

## Roadmap

- Private repository support through a GitHub App
- Editable saved generations
- Draft and version history
- Repository-level history filters
- Background generation jobs
- Webhook-triggered generation
- Export to Markdown, JSON, and plain text
- Sentry monitoring and structured production logging
- Mobile app support

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
