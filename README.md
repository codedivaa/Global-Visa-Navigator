<div align="center">

<h1>
VisaPath AI
</h1>

<p>
<strong>AI-Powered Immigration Intelligence Platform</strong>
</p>

<p>
Find your best visa path. Get realistic scores. Plan with confidence.
</p>

<p>
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-black?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-AI-orange?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

<p>
<a href="#features">Features</a> ·
<a href="#demo">Demo</a> ·
<a href="#architecture">Architecture</a> ·
<a href="#tech-stack">Stack</a> ·
<a href="#api">API</a> ·
<a href="#setup">Setup</a>
</p>

</div>

---

## What It Does

VisaPath AI helps **280+ million international migrants** worldwide figure out their best visa pathway.

You answer a **10-step questionnaire** and get scored against **25 visa pathways across 15 countries** with a personalized roadmap and AI-powered guidance.

**The problem with other calculators:** They give you **80-100% for everything** using naive point systems. VisaPath AI fixes this with a **dual scoring engine** — rule-based for speed + AI for realism — so you see actual barriers like H-1B lottery odds, nationality backlogs, and evidence requirements.

**Example:** Indian applicant, Master's in CS, 5 years experience:
- **Naive calculator:** 85% for H-1B
- **VisaPath AI:** 68% (Moderate Match) — because the AI knows the Indian H-1B lottery has ~25% selection odds

---

## Features

### 10-Step Assessment Wizard

A guided questionnaire covering:

- Immigration goal (Study, Work, Skilled Migration, Startup, PR, Family)
- Nationality & current country
- Target country
- Age, education, work experience
- Language proficiency
- **AI-generated personalized questions** (Step 9 — Gemini creates questions based on your exact country + goal combination)
- Job offer & travel history

### Dual Scoring Engine

Two engines. One toggle. You choose which scores to see.

**Rule-Based Engine**
- Instant, client-side scoring
- Visa-specific weights for education, experience, language, age, job offer
- Deterministic — same inputs always give same scores

**AI Gemini Engine**
- Gemini 2.5 Flash evaluates real-world barriers
- Considers nationality-specific challenges (lottery caps, backlogs, evidence requirements)
- Every score includes detailed explanation, strengths, weaknesses, and improvements

### Immigration Intelligence Report

- Animated score gauge with category label
- Per-visa cards: score, processing time, cost, sponsorship info
- Expandable details: strengths, missing requirements, improvement tips
- Alternative countries where you score higher than your target
- AI-generated qualification analysis and risk assessment

### AI Immigration Advisor

Real-time streaming chat with Gemini.

- Ask anything about fees, timelines, documents, strategy
- Priority documents sidebar with AI-generated lists
- Quick suggestion chips: "Improve my score", "Processing time", "Document checklist"
- Chat history saved to Supabase

### Personalized Roadmaps

- 6-step timeline (Month 1-2 through Year 2+)
- Interactive document checklist with completion tracking
- AI-generated financial breakdown in local currency
- 8-12 documents per visa type

### User Auth & History

- Email magic links (passwordless, no passwords to remember)
- Assessments saved to Supabase PostgreSQL
- History page to view and resume past assessments

---

## Demo

| Page | What You See |
|------|-------------|
| **Landing** | Animated hero, floating visa cards, eligibility gauge, budget planner |
| **Assessment** | 10-step wizard with AI-generated personalized questions |
| **Results** | Toggle between Rule-based / AI Gemini scoring, visa cards, analysis |
| **Advisor** | Streaming chat with document sidebar and suggestion chips |
| **Roadmaps** | Timeline, checklist, cost breakdown |
| **History** | Past assessments with scores and time-ago display |

---

## Architecture

```
React 19 SPA
  ↓
Replit Proxy Router (path-based)
  ↓
Express 5 API Server (Port 8080)
  ↓
├── Gemini 2.5 Flash — AI scoring, chat, analysis, questions, roadmaps, pricing
├── Supabase PostgreSQL — persistence (assessments, recommendations, roadmaps, chats)
└── Supabase Auth — magic link authentication
```

### Monorepo

```
workspace/
├── artifacts/
│   ├── visapath/          # React 19 + Vite 7 + Tailwind 4
│   └── api-server/        # Express 5 + esbuild + Node 24
├── lib/
│   ├── api-spec/          # OpenAPI spec
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   ├── db/                # Drizzle ORM schema
│   └── integrations-gemini-ai/  # Gemini client
├── scripts/               # Shared utility scripts
├── pnpm-workspace.yaml    # Workspace discovery
├── tsconfig.base.json     # Shared TS defaults
└── package.json           # Root task orchestration
```

---

## Tech Stack

**Frontend**
- React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4
- wouter (routing), @tanstack/react-query, @supabase/supabase-js
- Iconify, gsap, Sonner

**Backend**
- Express 5, Node.js 24, TypeScript 5.9
- esbuild, pino-http, pino, Zod, cors

**AI & Data**
- Gemini 2.5 Flash, Google Gen AI SDK
- Supabase (PostgreSQL + Auth), Drizzle ORM, Orval

**DevOps**
- pnpm workspaces, GitHub Actions, Vercel

---

## API

| Endpoint | Method | What It Does |
|----------|--------|-------------|
| `/api/ai/score` | POST | AI scores user against all 25 visas |
| `/api/ai/analyze` | POST | Deep qualification analysis for top visa |
| `/api/ai/questions` | POST | Generate 2 personalized follow-up questions |
| `/api/ai/roadmap` | POST | Generate 6-step personalized roadmap |
| `/api/ai/pricing` | POST | Generate cost breakdown |
| `/api/ai/chat` | POST | Streaming AI advisor chat (SSE) |
| `/api/healthz` | GET | Health check |

---

## Database

Four Supabase tables with Row Level Security:

- **assessments** — user profile data (JSONB)
- **recommendations** — visa scores, strengths, weaknesses (JSONB)
- **roadmaps** — steps, documents, costs (JSONB)
- **advisor_chats** — chat messages (JSONB)

---

## Setup

**Prerequisites:** Node.js 24+, pnpm 10+, Supabase project

**Env vars:**
```bash
DATABASE_URL=postgres://...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
SESSION_SECRET=...
```

**Commands:**
```bash
pnpm install           # Install deps
pnpm run typecheck     # Full typecheck
pnpm run build         # Build all packages

# Run API server
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/visapath run dev

# Regenerate API clients
pnpm --filter @workspace/api-spec run codegen

# Push DB schema
pnpm --filter @workspace/db run push
```

---

## Design Decisions

1. **100% TypeScript** — Every file is `.ts` or `.tsx`. No Python, Java, C, or plain HTML/CSS.
2. **Dual Scoring** — Rule-based for speed, AI for realism. Toggle to compare.
3. **JSON Repair** — Gemini occasionally returns malformed JSON. `safeJsonParse()` extracts and fixes it.
4. **Contract-First API** — OpenAPI spec generates React Query hooks and Zod schemas.
5. **Monorepo** — Shared libraries (DB, schemas, API clients) prevent duplication.
6. **Magic Link Auth** — Passwordless. Less friction, more security.

---

## Roadmap

- Document upload & AI document review
- Real-time visa policy updates via web scraping
- Multi-language support (i18n)
- Mobile app (Expo)
- Premium tier with human advisor matching
- Community forum & success stories

---

## License

MIT License

---

**Built with care for the 280+ million international migrants worldwide.**
