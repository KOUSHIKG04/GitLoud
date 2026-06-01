# GitLoud API

Standalone Hono API for the web, mobile, and Electron apps.

## Development

```bash
npm run api
```

The server defaults to `http://localhost:4000`.

## Routes

```txt
GET    /health
POST   /profile/sync
POST   /media
POST   /pr
DELETE /generations/:id
POST   /generations/:id/regenerate
POST   /jobs/delete-old-generations
```

The same routes are also available under `/v1/*`.

Web and Electron should call this service with a Clerk bearer token:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000
```

## Environment

```bash
PORT=4000
API_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Keep server-only secrets here instead of in Electron or browser apps:

```bash
DATABASE_URL=
GITHUB_TOKEN=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CRON_SECRET=
```
