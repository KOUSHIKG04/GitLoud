# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers who ship code, served equally (confirmed: no single primary audience):

- Developers building in public, posting progress to X, LinkedIn, Reddit and Discord.
- Developers job hunting, turning merged work into portfolio bullets and visible proof of work.
- Small teams shipping, writing changelogs, release notes and Discord announcements from merged work.

The shared job: turn work that already shipped into writing other people will read, without rewriting the same update for every channel.

## Product Purpose

GitLoud takes one GitHub pull request or commit link, or up to five PRs or commits from one connected repository, and generates a complete content set from the actual diff: short and long summaries, technical notes, changelog entries, portfolio bullets, and standard or long-form social posts. Success is a developer pasting a link and leaving with posts they can publish as written.

## Positioning

Content is generated from the real code change (PR or commit metadata and diff), not from a prompt the developer has to write. One source produces every format at once, and up to five PRs or commits from one repository combine into one cohesive update.

## Operating Context

- Input: a public GitHub PR or commit URL, or private repositories through a read-only GitHub App installation.
- Output destinations: X, LinkedIn, Reddit, Discord (direct publish via webhook), changelogs, portfolios, native share.
- Generation uses GitLoud's AI or the user's own key (Gemini, OpenAI, Anthropic, OpenRouter); saved keys are encrypted and shown only as masked previews.
- Saved history with regenerate, copy per format, delete, and attached images or video.

## Capabilities and Constraints

- Free to use; there is no paid plan (billing was removed).
- GitHub access is read-only; GitLoud never requests write access.
- Sign-in through Clerk (email code, Google).
- Web app (Next.js) plus a separate Hono API; an Electron desktop shell exists but is not public yet.

## Brand Commitments

Confirmed as binding by the user:

- Name GitLoud; headline "Ship it, make noise" with the yellow highlighter mark.
- Yellow primary color; dark theme.
- Geist (sans) and Geist Mono.
- Rounded tactile button style (fill, inner stroke, drop shadow, inner glow).
- The How it works diagram with 3D keycap-style nodes (GitHub → GitLoud → Reddit, X, LinkedIn, Discord).
- The six numbered Features accordion cards.

## Evidence on Hand

- A real worked example: PR #43 "feat: add WebAuthn (Passkey) support for biometric authentication", with its generated summary and changelog (`features/examples/components/content-examples-section.tsx`).
- The open-source repository: github.com/KOUSHIKG04/GitLoud.
- The user may supply real quotes or usage numbers later; none are on hand yet. Do not fabricate testimonials, user counts, star counts, logos or benchmarks.

## Product Principles

1. Start from the shipped code, never a blank prompt.
2. One link in, every format out.
3. Read-only and explicit about access; trust is part of the product.
4. Show real output instead of describing it.
