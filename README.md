# X-PR Project Plan

X-PR is a developer tool that turns GitHub pull requests into clear summaries and share-ready content. The product will be built in two phases. Phase 1 is a manual PR-link website. Phase 2 adds automatic GitHub PR detection, notifications, and a React Native mobile app.

## Product Goal

A user pastes a GitHub PR link. The app reads the PR title, description, commits, changed files, additions, deletions, and code diff. It then generates a clean summary, feature list, technologies used, and platform-ready posts for X/Twitter, LinkedIn, Reddit, portfolio updates, and changelogs.

Later, the app will automatically detect new PRs through GitHub webhooks or a GitHub App, generate content in the background, and notify the user when the content is ready.

## Phase 1: Manual PR-Link MVP

### Goal

Build and publish a website where a user can paste a GitHub PR link, generate content, save history, edit the result, and copy or share it manually.

### Phase 1 Core Features

- Landing page with simple animated product explanation.
- Authentication with Clerk.
- Dashboard for logged-in users.
- Manual GitHub PR link input.
- PR URL validation and parsing.
- GitHub API integration.
- AI-generated content.
- Generated content result page.
- Editable generated output.
- Copy buttons for every generated format.
- Share links for X/Twitter, LinkedIn, and Reddit.
- History page for old PR generations.
- Regenerate content option.
- Delete or archive history item.
- Loading, error, empty, and retry states.
- Fully responsive web UI.

### Phase 1 Generated Content

- Short summary.
- Technical summary.
- Features added or changed.
- Technologies, libraries, or concepts used.
- X/Twitter post.
- LinkedIn post.
- Reddit post.
- Portfolio bullet.
- Changelog entry.
- Beginner-friendly explanation.

### Phase 1 Website Tools

- Next.js App Router for the web app.
- TypeScript for safer development.
- Tailwind CSS for styling.
- shadcn/ui for accessible UI components.
- Framer Motion for animations.
- Zustand for small client-side UI state.
- TanStack Query for client-side server state, caching, retries, and refetching.
- Clerk for authentication.
- Prisma for database access.
- PostgreSQL for persistent storage.
- Octokit for GitHub API calls.
- OpenAI API or another LLM provider for content generation.
- Zod for validation.
- React Hook Form for forms.
- Sonner or shadcn toast for notifications.
- Vercel for deployment.
- Neon, Supabase, or Railway for PostgreSQL hosting.

### Is Auth Necessary?

For a very small demo, auth is not required. For the real product, auth is necessary because users need saved history, private dashboard data, future GitHub connection, notification preferences, and mobile sync.

Use Clerk instead of building auth manually. Clerk has a free Hobby plan that is enough for an MVP. It saves time and avoids security mistakes around sessions, passwords, OAuth, and account management.

### Phase 1 Monorepo Structure

```txt
x-pr/
  apps/
    web/                  Next.js website
  packages/
    db/                   Prisma schema and database client
    shared/               Shared types, constants, validators
    github/               PR parser and GitHub API logic
    ai/                   Prompt templates and generation logic
    ui/                   Shared UI components if needed
```

### Phase 1 Data Flow

```txt
User pastes PR URL
  -> Validate and parse URL
  -> Fetch PR metadata from GitHub
  -> Fetch commits and changed files
  -> Trim and normalize diff content
  -> Send structured context to AI
  -> Generate summary and share posts
  -> Save result to database
  -> Show editable result to user
  -> User copies or shares content
```

### Phase 1 Database Models

```txt
User
- id
- clerkUserId
- email
- name
- createdAt
- updatedAt

PullRequest
- id
- userId
- owner
- repo
- number
- title
- body
- author
- url
- state
- headSha
- additions
- deletions
- changedFiles
- source
- createdAt
- updatedAt

GeneratedContent
- id
- userId
- pullRequestId
- shortSummary
- technicalSummary
- features
- techUsed
- tweet
- linkedInPost
- redditPost
- portfolioBullet
- changelogEntry
- beginnerSummary
- status
- createdAt
- updatedAt

GenerationJob
- id
- userId
- pullRequestId
- idempotencyKey
- status
- errorMessage
- startedAt
- completedAt
- createdAt
```

### Phase 1 Edge Cases

- Invalid GitHub URL.
- URL is not a pull request.
- Public PR does not exist.
- Private PR without permission.
- GitHub API rate limit reached.
- PR has no description.
- PR has too many files.
- PR has a huge diff.
- PR includes binary files or images.
- PR has generated files such as lockfiles.
- AI provider times out.
- AI output is too long.
- User submits same PR multiple times.
- User refreshes during generation.
- Network fails after generation but before UI update.
- User logs out during generation.
- Mobile browser layout breaks.
- Share URL exceeds platform limits.

### Phase 1 Optimization Plan

- Validate PR URL before making API calls.
- Use Zod schemas for request validation.
- Cache GitHub PR metadata for repeated submissions.
- Store PR head SHA to know whether content is stale.
- Skip binary files and very large files.
- Ignore common generated files like package-lock.json, yarn.lock, pnpm-lock.yaml, dist files, and build outputs.
- Limit diff text sent to AI.
- Summarize large PRs file-by-file before creating final summary.
- Use background jobs for longer generations if needed.
- Add request timeout and retry for GitHub and AI calls.
- Use idempotency keys to prevent duplicate generations.
- Paginate history page.
- Add database indexes on userId, pullRequestId, createdAt, owner, repo, and number.
- Use optimistic UI only for safe actions like archive/delete.
- Use server-side rendering for dashboard shell and client fetching for dynamic history.
- Use streaming UI for generation status later if needed.

### Phase 1 Build Order

1. Create Turborepo project.
2. Create Next.js web app.
3. Add TypeScript, ESLint, Prettier, and basic scripts.
4. Add Tailwind CSS and shadcn/ui.
5. Add Framer Motion landing page animation.
6. Add Clerk authentication.
7. Build dashboard layout.
8. Build PR input form.
9. Add PR URL parser.
10. Add Zod validation.
11. Add Octokit GitHub fetch logic.
12. Set up PostgreSQL and Prisma.
13. Add PullRequest and GeneratedContent models.
14. Save fetched PR metadata.
15. Add AI prompt and generation logic.
16. Save generated content.
17. Build generated result page.
18. Add edit and copy actions.
19. Add platform share links.
20. Build history page.
21. Add regenerate action.
22. Add loading, error, retry, and empty states.
23. Add rate limiting.
24. Add logging and basic error tracking.
25. Deploy on Vercel.
26. Test with multiple public PRs.

### Phase 1 Output

A live website where users can paste a GitHub PR link and receive generated summaries, feature explanations, technologies used, and share-ready posts.

## Phase 2: Automation And Mobile App

### Goal

Add automatic GitHub PR detection, background generation, notifications, and a React Native mobile app.

### Phase 2 Core Features

- GitHub account connection.
- Repository selection.
- GitHub webhook or GitHub App setup.
- Automatic PR detection.
- Background generation jobs.
- In-app notifications.
- Email notifications.
- Optional GitHub PR comment when content is ready.
- React Native mobile app.
- Mobile login.
- Mobile history screen.
- Mobile generated content screen.
- Native share sheet.
- Push notifications.

### Phase 2 Automation Flow

```txt
User opens or updates a PR on GitHub
  -> GitHub sends webhook to backend
  -> Backend verifies webhook signature
  -> Backend stores webhook event
  -> Backend creates idempotent generation job
  -> Worker fetches PR data
  -> Worker generates content
  -> Worker saves result
  -> User receives notification
  -> User opens web or mobile app
  -> User reviews and shares content
```

### Phase 2 Tools

- GitHub App or GitHub Webhooks for automatic PR events.
- Inngest, Trigger.dev, Upstash QStash, or BullMQ for background jobs.
- Redis if using BullMQ or custom queues.
- Resend, SendGrid, or Postmark for email notifications.
- Expo for React Native mobile development.
- NativeWind or Tamagui for mobile styling.
- Clerk Expo SDK or token-based auth for mobile login.
- Expo Notifications for push notifications.
- Sentry for error tracking.
- OpenTelemetry or structured logs for production debugging.

### Phase 2 Additional Database Models

```txt
Repository
- id
- userId
- owner
- name
- githubRepoId
- private
- webhookEnabled
- createdAt
- updatedAt

GitHubInstallation
- id
- userId
- githubInstallationId
- accountLogin
- permissions
- createdAt
- updatedAt

WebhookEvent
- id
- eventType
- deliveryId
- payload
- processedAt
- createdAt

Notification
- id
- userId
- type
- title
- message
- readAt
- targetUrl
- createdAt

DeviceToken
- id
- userId
- platform
- token
- active
- createdAt
- updatedAt
```

### Phase 2 Race Condition Strategy

Use an idempotency key for every generation:

```txt
github:{owner}:{repo}:pull:{number}:sha:{headSha}
```

If the same webhook arrives twice, the app should not create duplicate generated content. If the PR changes and the head SHA changes, the app can create a new generation version.

Use job statuses:

```txt
queued -> processing -> ready
queued -> processing -> failed
```

Only one active job should run for the same PR and head SHA.

### Phase 2 Edge Cases

- Duplicate webhook events.
- GitHub retries failed webhook delivery.
- PR updated while generation is running.
- PR manually submitted and webhook received at the same time.
- User removes GitHub permissions.
- GitHub token expires.
- Repository is renamed.
- Repository is deleted.
- User leaves an organization.
- Notification fails.
- Push token expires.
- Queue job fails and retries.
- AI output changes after regeneration.
- User edits content while a newer version is generated.
- Multiple devices receive the same notification.

### Phase 2 Optimization Plan

- Verify webhook signatures before processing.
- Store delivery ID to prevent duplicate webhook processing.
- Return fast response to GitHub webhooks and process work in background.
- Use queue retries with backoff.
- Add dead-letter handling for failed jobs.
- Chunk large diffs before AI generation.
- Store generated versions instead of overwriting user-edited content.
- Keep notification writes idempotent.
- Use pagination and filtering for mobile history.
- Use TanStack Query cache on mobile and web.
- Add offline-friendly mobile UI for previously loaded content.
- Use push notifications only after user permission.
- Add monitoring around webhook failures, job failures, and AI cost.

### Phase 2 Build Order

1. Add GitHub OAuth or GitHub App connection.
2. Store connected repositories.
3. Add repository settings page.
4. Add webhook endpoint.
5. Verify webhook signatures.
6. Store webhook delivery events.
7. Add background job system.
8. Create idempotent generation jobs.
9. Generate content from webhook events.
10. Add in-app notifications.
11. Add email notifications.
12. Create Expo React Native app.
13. Add mobile authentication.
14. Add mobile history screen.
15. Add mobile content detail screen.
16. Add native share sheet.
17. Add push notifications.
18. Add monitoring, logging, and alerting.
19. Test webhook retries and duplicate events.
20. Publish mobile app build.

### Phase 2 Output

A web and mobile product that automatically detects PRs, generates content in the background, notifies the user, and lets them share content from any device.

## Final Recommended Product Path

Build Phase 1 first because it proves the core value quickly:

```txt
Paste PR link -> Generate content -> Save history -> Copy or share
```

Then build Phase 2:

```txt
Open PR on GitHub -> App detects PR -> Content generated -> User notified -> Share from web or mobile
```

This project is useful for students and developers because it helps them explain their work better, create public updates consistently, and build a visible record of daily progress.
