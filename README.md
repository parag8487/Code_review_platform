# 👨‍💻 Code Review Platform

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://codereviewplatform-parag-mohares-projects.vercel.app)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

A comprehensive web application featuring an **AI-powered code review platform** and a **live classroom** for collaborative coding. Analyze code quality with AI and collaborate in real-time — all from your browser.

![Code Review Platform](https://img.shields.io/badge/Platform-Web-informational)

---

## ✨ Features

### 🔍 AI-Powered Code Review
- **Intelligent Analysis** — Google Gemini AI analyzes code for performance, security, and best practices
- **Complexity Metrics** — Automatic time/space complexity detection
- **Version History** — Track code iterations and improvements over time
- **Collaborative Comments** — Team feedback with threaded discussions
- **Smart Save** — Only accepts code improvements based on baseline metrics

### 🏫 Live Classroom (Real-time Collaboration)
- **Instant Code Sync** — Real-time code sharing via Ably pub/sub channels
- **Collaborative Editing** — Owner can toggle collaborative mode for participants
- **Permission System** — Students can request edit permission; owners approve/deny
- **Multi-language Support** — Monaco Editor with syntax highlighting for 20+ languages
- **Classroom Management** — Create, join, and manage coding sessions
- **Live User Roster** — See who's online with participant tracking

### 🔐 Authentication & Security
- **Session-based Auth** — JWT tokens stored in secure HTTP-only cookies
- **Password Hashing** — bcrypt with salt rounds
- **Route Protection** — Middleware-based access control
- **Audit Logging** — Track user actions for security

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI |
| **Code Editor** | Monaco Editor |
| **Real-time** | Ably (pub/sub channels) |
| **AI** | Google Gemini via Genkit |
| **Database** | PostgreSQL |
| **Auth** | JWT + bcrypt |
| **Deployment** | Vercel (serverless) |
| **Email** | Nodemailer (Gmail SMTP) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- [Ably account](https://ably.com) (free tier: 6M messages/month)
- [Google AI API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/parag8487/Code_review_platform.git
cd Code_review_platform
npm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp code-review/.env.example code-review/.env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_NAME` | Database name |
| `SESSION_SECRET` | Random 32+ char string (use `node generate-secret.js`) |
| `GMAIL_USER` | Gmail address for contact form |
| `GMAIL_APP_PASSWORD` | Gmail app password |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL |
| `ABLY_API_KEY` | Ably API key from dashboard |

### Run Locally

```bash
cd code-review
npm run dev
```

Open [http://localhost:9002](http://localhost:9002)

---

## 📡 API Reference

### Code Review
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/init` | Initialize database tables |
| GET | `/api/health` | Health check |
| POST | `/api/test-ai` | Test AI integration |
| POST | `/api/contact` | Submit contact form |

### Live Classroom
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ably-token` | Ably token authentication |
| GET | `/api/classroom/list` | List active classrooms |
| POST | `/api/classroom/create` | Create a new classroom |
| POST | `/api/classroom/join` | Join a classroom |
| POST | `/api/classroom/leave` | Leave a classroom |
| POST | `/api/classroom/delete` | Delete a classroom |
| POST | `/api/classroom/kick` | Remove a user |
| POST | `/api/classroom/permission` | Grant/revoke edit permission |
| POST | `/api/classroom/get` | Get classroom details |

---

## 🌐 Deployment (Vercel)

This application is designed to deploy on Vercel with zero configuration issues.

### One-Click Deploy

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Set **Root Directory** to `code-review`
4. Add environment variables in project settings
5. Deploy

### Environment Variables in Vercel

Add all variables from `.env.example` in your Vercel project settings under **Settings → Environment Variables**.

### Database Initialization

After first deployment, visit:
```
https://your-app.vercel.app/api/init
```
This creates all database tables and a demo user.

### Demo Account
- **Email:** demo@example.com
- **Password:** password123

---

## 📁 Project Structure

```
Code_review_platform/
├── code-review/                 # Main Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages & API routes
│   │   │   ├── (auth)/          # Login/signup pages
│   │   │   ├── classroom/       # Live classroom pages
│   │   │   ├── code-review/     # Code review pages
│   │   │   └── api/             # API endpoints
│   │   ├── components/          # React components
│   │   │   ├── classroom/       # Classroom components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── lib/                 # Utilities & stores
│   │   │   ├── realtime.ts      # Ably real-time hooks
│   │   │   └── classroom-store.ts # In-memory classroom state
│   │   └── ai/                  # AI flows (Genkit)
│   ├── public/                  # Static assets
│   ├── .env.example             # Environment template
│   └── package.json
├── vercel.json                  # Vercel deployment config
└── README.md
```

---

## 🧪 Development

```bash
npm run dev          # Start dev server on port 9002
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run validate     # Validate routes & config
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

---

## 📧 Contact

Parag Mohare — paragmohare049@gmail.com

Project Link: [github.com/parag8487/Code_review_platform](https://github.com/parag8487/Code_review_platform)
