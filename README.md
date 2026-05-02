# GitLoud

GitLoud is a developer content assistant that turns public GitHub pull requests and commits into clear summaries, technical notes, changelog entries, portfolio bullets, and share-ready posts.

It helps developers explain what they built, document their work, and publish consistent updates without manually rewriting the same GitHub context for every platform.

## Features

GitLoud provides a Clerk-authenticated dashboard where developers can submit a
public GitHub pull request or commit URL and generate reusable content from it.
The app validates GitHub URLs, detects whether the source is a PR or commit,
checks that the repository is public, fetches GitHub metadata and diffs, and
streams progress while the AI generation workflow runs.

Generated content is stored in PostgreSQL so authenticated users can revisit
their history, open generation detail pages, regenerate output, and delete saved
items when they no longer need them. The application also includes user-scoped
persistent rate limiting, production-oriented database indexes and constraints,
a responsive interface, and light/dark theme support.

## Generated Output

For each supported public GitHub source, GitLoud generates a complete content
set designed for both technical documentation and public sharing. The output
includes a short summary, technical summary, beginner-friendly explanation,
feature list, technologies and concepts used, changelog entry, portfolio bullet,
and ready-to-use posts for X, LinkedIn, Reddit, and Discord.

## Tech Stack

- Turborepo
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- Clerk
- Prisma
- PostgreSQL
- Octokit
- Zod
- React Hook Form
- Sonner

## Monorepo Structure

```txt
apps/
  web/                  Next.js web application
  mobile/               Mobile app workspace

packages/
  ai/                   AI generation logic
  db/                   Prisma schema, migrations, and database client
  github/               GitHub API helpers
  shared/               Shared schemas, validators, and utilities
  ui/                   Shared UI package
  eslint-config/        Shared ESLint config
  typescript-config/    Shared TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 20.9 or newer
- npm
- PostgreSQL database
- Clerk application keys
- GitHub token
- AI provider credentials used by `packages/ai`

### Install Dependencies

Run from the repository root:

```bash
npm install
```

### Environment Variables

Create the required environment files for your local setup. This project loads database configuration through `packages/db/prisma.config.ts`.

Common variables:

```bash
DATABASE_URL="postgresql://...?sslmode=verify-full"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

GITHUB_TOKEN="..."

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

For managed PostgreSQL providers such as Neon, use `sslmode=verify-full` in
`DATABASE_URL`. This keeps the stricter TLS behavior expected by the current
PostgreSQL driver and avoids SSL mode warnings during local builds and
deployment.

Authentication is handled by Clerk. Configure the enabled sign-in methods and
email verification behavior from the Clerk dashboard. If you want GitHub login,
enable the GitHub social connection in Clerk and add the OAuth credentials there.

Add the AI provider variables required by your local `packages/ai` implementation.

### Database Setup

Run migrations:

```bash
npx prisma migrate dev --config packages/db/prisma.config.ts
```

Generate the Prisma client:

```bash
npm --workspace @repo/db run db:generate
```

Open Prisma Studio when needed:

```bash
npm --workspace @repo/db run db:studio
```

### Run The Web App

```bash
npm run web
```

The web app runs on:

```txt
http://localhost:3000
```

## Useful Commands

Run all type checks:

```bash
npm run check-types
```

Run web type checks only:

```bash
npm --workspace web run check-types
```

Run web lint only:

```bash
npm --workspace web run lint
```

Run the full build:

```bash
npm run build
```

Generate the Prisma client:

```bash
npm --workspace @repo/db run db:generate
```

Apply database migrations:

```bash
npx prisma migrate dev --config packages/db/prisma.config.ts
```

Reset the local development database:

```bash
npx prisma migrate reset --config packages/db/prisma.config.ts
```

`migrate reset` drops data. Use it only for local or disposable development databases.

## How It Works

```txt
User signs in
  -> User submits a GitHub PR or commit URL
  -> API validates the URL and source type
  -> API checks that the repository is public
  -> GitHub metadata and diff are fetched
  -> AI generates platform-ready content
  -> Result is stored in PostgreSQL
  -> User views, regenerates, copies, or deletes the saved output
```

## Current Phase: Phase 1

Phase 1 is the manual generation MVP.

Current Phase 1 scope:

- Manual URL submission.
- PR and commit support.
- Authenticated dashboard.
- Saved history.
- Regeneration.
- Delete history items.
- Persistent rate limiting.
- Responsive UI.
- Production-oriented database constraints and indexes.

## Phase 2: Upcoming Updates

Phase 2 will turn GitLoud from a generation tool into a complete content workflow.

### First Priority: Private Repository Support

- Add GitHub App installation.
- Let users grant access to selected private repositories.
- Store installation access securely.
- Fetch private PR and commit data only for approved repositories.
- Keep tenant checks enforced so users can only generate from repositories they connected.
- Show clear UI for connected repositories and access status.

### Editing And Saving

- Edit generated content in the dashboard.
- Save edited versions.
- Preserve original AI output separately from user edits.
- Autosave drafts.
- Manual save and discard actions.
- Version history for edits and regenerations.
- Draft, edited, ready, archived, and shared statuses.
- Custom instructions per generation.

### History And Organization

- Search generations.
- Filter by repository, source type, date, and status.
- Pin or favorite important generations.
- Archive and restore generations.
- Repository-level grouping.
- Improved pagination and loading states.

### Integrations

- GitHub App connection.
- Repository selection.
- Private repository access through explicit GitHub App permissions.
- GitHub webhook ingestion.
- Automatic PR and commit detection.
- Optional GitHub PR comments.
- Slack or Discord notifications.
- Email notifications.
- Markdown, JSON, and plain text export.

### Background Jobs

- Background generation queue.
- Idempotent job processing.
- Retry and backoff for GitHub and AI failures.
- Dead-letter handling.
- Job status tracking.
- Automatic generation when watched PRs change.

### Monitoring And Reliability

- Sentry integration for frontend and backend error tracking.
- Production source maps.
- Error boundaries for dashboard pages.
- Request IDs and structured logs.
- Monitoring for webhook failures, AI failures, and rate-limit fallback.
- Performance tracking for slow external calls.

### Security

- Webhook signature verification.
- Stronger tenant isolation checks.
- Safe private repository support with user-approved repository access.
- More granular per-user and per-source rate limits.
- Audit-friendly logs for destructive actions.

### Mobile

- Expo mobile app.
- Mobile authentication.
- Mobile history screen.
- Mobile generation detail screen.
- Native share sheet.
- Push notifications.
- Cross-device sync.

## Deployment Notes

Recommended production services:

- Vercel for the Next.js web app.
- Neon, Supabase, Railway, or another managed PostgreSQL provider.
- Clerk for authentication.
- A GitHub token or GitHub App credentials.
- Sentry once Phase 2 observability work starts.

Before deployment:

```bash
npm run check-types
npm run lint
npm run build
```

Apply production migrations through your deployment workflow:

```bash
npx prisma migrate deploy --config packages/db/prisma.config.ts
```

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
