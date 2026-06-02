# Code Review Platform — Application

This is the main Next.js application containing both the AI-powered Code Review platform and the Live Classroom feature.

## Quick Start

```bash
npm install
cp .env.example .env   # Fill in your values
npm run dev            # http://localhost:9002
```

## Architecture

### Real-time (Live Classroom)

The live classroom uses **Ably** for real-time pub/sub messaging — fully compatible with Vercel's serverless architecture (no WebSocket server needed).

**How it works:**
1. Clients authenticate via `/api/ably-token` (server creates token requests)
2. Each classroom gets an Ably channel: `classroom:{id}`
3. Code changes, language updates, and permission events are published to channels
4. A `classrooms-lobby` channel broadcasts classroom list updates
5. Server-side API routes manage state (join, leave, kick, permissions)

### Code Review

- Users create reviews, paste code, and get AI analysis
- AI uses Google Gemini via Genkit for complexity and quality analysis
- Reviews support comments, version history, and status tracking

### Authentication

- bcrypt password hashing
- JWT tokens in HTTP-only cookies
- Middleware-based route protection

## Environment Variables

See `.env.example` for all required variables.

Key additions for real-time:
- `ABLY_API_KEY` — Get from [ably.com](https://ably.com) (free tier available)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server (port 9002) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run validate` | Validate routes and config |

## Deployment

Designed for **Vercel**. Set root directory to `code-review` in Vercel project settings, add env vars, and deploy. No custom server required.

After first deploy, visit `/api/init` to initialize the database.
