<div align="center">
  <img src="apps/web/public/app-logo.svg" alt="GitLoud logo" width="84" height="84" />

  <h1>GitLoud</h1>

  <p>
    <strong>Turn GitHub pull requests and commits into clear, reusable developer content.</strong>
  </p>

  <p>
    GitLoud reads public GitHub work and authorized private repository changes,
    then transforms them into summaries, changelog notes, beginner explanations,
    portfolio bullets, and share-ready posts for LinkedIn, X, Reddit, and
    Discord.
  </p>

  <p>
    <a href="#features"><strong>Features</strong></a>
    &middot;
    <a href="#architecture"><strong>Architecture</strong></a>
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
    <img alt="Hono" src="https://img.shields.io/badge/Hono-API-E36002?style=for-the-badge&logo=hono&logoColor=white" />
    <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-ready-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  </p>
</div>

---

## Overview

GitLoud is built for developers who ship useful work but do not want to rewrite
the same GitHub context for every platform. Submit a pull request or commit URL,
and the app produces structured content from real GitHub metadata and code
changes.

The project is a Turborepo workspace with a standalone Hono API, a Next.js web
app, shared domain packages, and Electron/mobile workspaces prepared for reuse.
The separated backend is the source of truth for generation, media, profile, and
history workflows so web and desktop clients can call the same API.

## Demo

https://github.com/user-attachments/assets/7a7b4f4f-0fe6-4298-8292-893e7fd79454

## Contents

- [Overview](#overview)
- [Demo](#demo)
- [Contents](#contents)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Web Routes](#web-routes)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker](#docker)
- [Database](#database)
- [Commands](#commands)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [License](#license)

## Features

<table>
  <tr>
    <td width="50%">
      <h3>GitHub-aware generation</h3>
      <p>Submit a public or authorized private pull request or commit URL and generate content from real repository metadata and code changes.</p>
    </td>
    <td width="50%">
      <h3>Platform-ready output</h3>
      <p>Create summaries, technical notes, beginner explanations, changelog entries, portfolio bullets, and social posts.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Standard and long-form X posts</h3>
      <p>Choose standard or long-form (X Premium format) post length and keep that preference during regeneration.</p>
    </td>
    <td width="50%">
      <h3>Authenticated dashboard</h3>
      <p>Clerk protects dashboard pages, saved generations, detail pages, regeneration actions, and profile sync.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Saved history</h3>
      <p>Reopen previous generations, copy content, regenerate output with saved preferences, and delete records.</p>
    </td>
    <td width="50%">
      <h3>Media attachments</h3>
      <p>Upload optional images or videos through Cloudinary and keep hosted media metadata with generated content.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Shared backend API</h3>
      <p>The standalone Hono API serves the web app today and is ready for Electron and future clients.</p>
    </td>
    <td width="50%">
      <h3>Retention cleanup</h3>
      <p>The API attempts cleanup of generations older than 7 days once per day while requests are being served.</p>
    </td>
  </tr>
</table>

## Architecture

```txt
Browser / Electron / future clients
        |
        | Clerk bearer token
        v
Standalone Hono API (apps/api)
        |
        +-- GitHub fetchers (packages/github)
        +-- AI generation (packages/ai)
        +-- Shared schemas/types (packages/shared)
        +-- Prisma/PostgreSQL (packages/db)
        +-- Cloudinary media upload
```

The web app no longer owns the backend business logic. It calls the standalone
API through `NEXT_PUBLIC_API_URL`, which keeps the same backend available to the
Electron app and future clients.

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
        <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="36" height="36" alt="Node.js" />
        <br />
        <sub><strong>Node.js</strong></sub>
      </td>
      <td align="center" width="120">
        <img src="https://cdn.simpleicons.org/esbuild/FFCF00" width="36" height="36" alt="esbuild" />
        <br />
        <sub><strong>esbuild</strong></sub>
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
    </tr>
    <tr>
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
        <sub><strong>GitHub</strong></sub>
      </td>
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
    </tr>
    <tr>
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

## Repository Structure

```txt
apps/
  api/                  Standalone Hono backend API
  web/                  Next.js web application
  electron/             Electron desktop workspace
  mobile/               Expo mobile workspace
  docs/                 Documentation/example workspace

packages/
  ai/                   Prompting and AI generation logic
  db/                   Prisma schema, generated client, and DB access
  github/               GitHub PR and commit fetchers
  shared/               Shared Zod schemas and domain types
  ui/                   Shared UI components
  eslint-config/        Shared ESLint config
  typescript-config/    Shared TypeScript config
```

Web structure:

```txt
apps/web/app/           Next.js routes and route-only files
apps/web/components/    Shared web UI components
apps/web/lib/           Shared web helpers and API clients
apps/web/assets/        Web UI assets
```

Route-only components are colocated in `_components` folders inside the route
that owns them.

## Web Routes

| Route                        | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `/`                          | Home page and generator entry              |
| `/examples`                  | Example generated content                  |
| `/dashboard`                 | Authenticated generation dashboard         |
| `/dashboard/history`         | Authenticated generation history           |
| `/dashboard/generations/:id` | Authenticated generation detail            |
| `/dashboard/github-activity` | Generate from synced GitHub App activity   |
| `/dashboard/settings`        | GitHub App and custom AI key settings      |
| `/sign-in`                   | Sign-in page                               |
| `/sign-up`                   | Sign-up page                               |
| `/sso-callback`              | Clerk SSO callback                         |
| `/privacy`                   | Privacy policy                             |
| `/terms`                     | Terms page                                 |

Protected dashboard routes are enforced by Clerk middleware in
`apps/web/proxy.ts`.

## API Routes

The API runs from `apps/api` and defaults to:

```txt
http://localhost:4000
```

Current active routes:

| Method   | Route                                   | Purpose                                                   |
| -------- | --------------------------------------- | --------------------------------------------------------- |
| `GET`    | `/`                                     | API metadata                                              |
| `GET`    | `/health`                               | Health check                                              |
| `POST`   | `/profile/sync`                         | Sync authenticated Clerk profile                          |
| `POST`   | `/pr`                                   | Generate content from a PR or commit URL                  |
| `POST`   | `/media`                                | Upload a media attachment                                 |
| `GET`    | `/generations`                          | Read saved generation history                             |
| `GET`    | `/generations/:id`                      | Read one saved generation                                 |
| `DELETE` | `/generations/:id`                      | Delete one saved generation                               |
| `POST`   | `/generations/:id/regenerate`           | Regenerate saved content                                  |
| `GET`    | `/github/install-url`                   | Create a signed GitHub App installation URL               |
| `GET`    | `/github/callback`                      | Complete GitHub App installation                          |
| `GET`    | `/github/installations`                 | List connected GitHub App installations                   |
| `GET`    | `/github/activity`                      | List recent PR or commit metadata for a synced repository |
| `POST`   | `/github/sync-installation`             | Sync installation repository access                       |
| `DELETE` | `/github/installations/:id`             | Uninstall a connected GitHub App installation             |
| `GET`    | `/ai-credentials`                       | List supported AI providers and saved key previews        |
| `POST`   | `/ai-credentials`                       | Save a custom AI provider key                             |
| `DELETE` | `/ai-credentials/:provider`             | Delete a saved custom AI provider key                     |
| `POST`   | `/feedback`                             | Submit product feedback                                   |

The API expects protected requests to include a Clerk bearer token. CORS is
controlled by `API_ALLOWED_ORIGINS`. Localhost defaults are allowed only outside
production; in production, configured origins are authoritative.

## Environment Variables

Create a root `.env.local` for local development. Configure production values in
the hosting provider dashboard.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

PORT=4000
API_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.5-flash"

GITHUB_PUBLIC_TOKEN="..."
GITHUB_APP_NAME="..."
GITHUB_APP_ID="..."
GITHUB_APP_PRIVATE_KEY="..."
GITHUB_APP_CLIENT_ID="..."
GITHUB_APP_CLIENT_SECRET="..."
GITHUB_APP_STATE_SECRET="at-least-32-random-characters"
WEB_APP_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Production example:

```bash
NEXT_PUBLIC_SITE_URL="https://gitloud-web.vercel.app"
NEXT_PUBLIC_API_URL="https://gitloud.onrender.com"
WEB_APP_URL="https://gitloud-web.vercel.app"
API_ALLOWED_ORIGINS="https://gitloud-web.vercel.app"
GITHUB_APP_STATE_SECRET="at-least-32-random-characters"
NODE_ENV="production"
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` belonged to the old Next.js API route setup. The
  current web app uses `NEXT_PUBLIC_API_URL`.
- If you run the API in Docker and connect to a database on the host machine, use
  `host.docker.internal` instead of `localhost` in `DATABASE_URL`.
- Keep secret values in environment variables only. Do not commit `.env.local`,
  `.env`, or `.env.docker`.

## Local Development

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npm --workspace @repo/db run db:generate
```

Run the web app:

```bash
npm run web
```

Run the API:

```bash
npm run api
```

Open:

```txt
Web: http://localhost:3000
API: http://localhost:4000/health
```

For local development, `npm run api` loads root `.env.local`, root `.env`,
`packages/db/.env`, and `apps/api/.env` when those files exist.

## Docker

Build the API image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t gitloud-api .
```

Run the API container:

```bash
docker run --rm -p 4000:4000 --env-file .env.docker gitloud-api
```

The API Dockerfile uses a multi-stage build:

1. Builder stage installs dependencies and builds shared packages plus the API.
2. The API is bundled with esbuild for Node.
3. Runner stage copies only the built API output and starts it with plain Node.

The image installs `openssl` and `ca-certificates` because Prisma/PostgreSQL and
managed databases commonly require TLS support.

## Database

The Prisma schema lives at:

```txt
packages/db/prisma/schema.prisma
```

Common commands:

```bash
npm --workspace @repo/db run db:generate
npm --workspace @repo/db run db:push
npm --workspace @repo/db run db:studio
```

For production migrations, use Prisma migrate deploy with the repo Prisma config:

```bash
npx prisma migrate deploy --config packages/db/prisma.config.ts
```

Generation retention is currently handled by lazy API cleanup. The API attempts
to remove generations older than 7 days once per day while the process is serving
requests.

## Commands

| Command                          | Description                       |
| -------------------------------- | --------------------------------- |
| `npm run dev`                    | Run all dev servers through Turbo |
| `npm run web`                    | Run only the web app              |
| `npm run api`                    | Run only the standalone API       |
| `npm run desktop`                | Run the Electron app              |
| `npm run desktop:build`          | Build the Electron app            |
| `npm run mobile`                 | Run the mobile workspace          |
| `npm run lint`                   | Lint all workspaces               |
| `npm run check-types`            | Type-check all workspaces         |
| `npm run build`                  | Build all workspaces              |
| `npm --workspace web run build`  | Build only the web app            |
| `npm --workspace web run doctor` | Run React Doctor for the web app  |
| `npm --workspace api run build`  | Build only the API                |
| `npm run format`                 | Format source files               |

## Deployment

GitLoud deploys as two services:

- `apps/web` on Vercel.
- `apps/api` on Render, Railway, Fly.io, or another Node/Docker-compatible host.

Recommended setup:

1. Deploy the API first.
2. Set API secrets: `DATABASE_URL`, `CLERK_SECRET_KEY`, `GEMINI_API_KEY`,
   GitHub App credentials, `GITHUB_APP_STATE_SECRET`, and Cloudinary
   credentials.
3. Set `NODE_ENV=production` on the API.
4. Set `API_ALLOWED_ORIGINS` on the API to the deployed web origin.
5. Deploy the web app to Vercel.
6. Set `NEXT_PUBLIC_API_URL` in Vercel to the deployed API URL.
7. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the deployed web URL.
8. Confirm Clerk redirect URLs include the deployed web domain.
9. Confirm the database accepts connections from the API host.
10. Run production verification checks.

Production verification:

```bash
npm --workspace api run build
npm --workspace web run build
npm --workspace web run doctor
```

Free API hosting can cold start. The web app includes a delayed backend toast so
users get feedback when an API request takes longer than expected.

## Security Notes

- Keep all secrets out of Git.
- Rotate provider secrets if they were exposed in a dashboard, terminal, or logs.
- Clerk protects dashboard pages and API requests.
- API CORS uses exact normalized origins in production.
- Users can access only their own saved generations.
- GitHub input is limited to supported PR and commit URLs. Private repository
  access is granted through a GitHub App installation on selected repositories.
- GitHub App installation state is HMAC signed and short-lived.
- GitHub App installation tokens are generated server-side, short-lived, scoped
  to one repository when generating content, and restricted to read permissions.
- `GITHUB_PUBLIC_TOKEN` is optional and must not grant private repository access.
- GitLoud does not currently claim SOC 2 or ISO/IEC 27001 certification.
- AI output is parsed and validated with shared Zod schemas.
- Media uploads are handled separately and stored as attachment metadata.

## Roadmap

- Editable saved generations
- Draft/version history
- Repository-level filters
- Background generation jobs
- Webhook-triggered generation
- Export to Markdown, JSON, and plain text
- Production monitoring and structured logging
- Mobile app support

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
