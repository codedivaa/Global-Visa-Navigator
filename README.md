# VisaPath AI — Immigration Intelligence Platform

A full-stack AI-powered immigration intelligence platform that helps users discover their best visa pathways, get realistic eligibility scores, receive personalized roadmaps, and chat with an AI immigration advisor. Built on 100% TypeScript with React 19, Express 5, Gemini 2.5 Flash, and Supabase.

---

## What It Solves

Immigration is one of the most complex, high-stakes decisions a person makes. The problems VisaPath AI solves:

1. **Information Overload** — 190+ countries, thousands of visa categories, each with unique requirements. VisaPath distills this into personalized, actionable recommendations.
2. **Unrealistic Self-Assessment** — Free online calculators give inflated scores (80-100% for almost everyone) because they use naive point systems. VisaPath offers both a rule-based engine *and* an AI scoring engine that evaluates real-world barriers like H-1B lottery odds, nationality backlogs, and extraordinary ability evidence.
3. **No Personalized Guidance** — Generic advice like "get a degree" doesn't help. VisaPath generates AI-tailored questions, roadmaps, and chat responses based on the user's exact profile.
4. **Fragmented Planning** — Documents, timelines, costs, and steps are scattered across government sites. VisaPath consolidates everything into one intelligent dashboard.

---

## Key Features

### 1. Multi-Step Assessment Wizard (10 Steps)
- Immigration goal selection (Study, Work, Skilled Migration, Startup, PR, Family)
- Identity & nationality profiling
- Education & work experience scoring
- Language proficiency capture
- **AI-Generated Personalized Questions** — Step 9 fetches context-aware questions from Gemini based on the user's exact country + goal combination
- Job offer & travel history tracking

### 2. Dual Scoring Engine
- **Rule-Based Engine** — Fast, deterministic scoring using visa-specific weights for education, experience, language, age, and job offer status
- **AI Gemini Engine** — Gemini 2.5 Flash evaluates the user against 25 visa pathways with realistic scores, considering real-world barriers (lottery caps, nationality backlogs, evidence requirements)
- **Toggle between engines** on the Results page to compare rule-based vs. AI assessments

### 3. Immigration Intelligence Report
- Overall eligibility score with animated gauge
- Per-visa score cards with strengths, weaknesses, missing requirements, and improvement tips
- Target country matches + alternative country suggestions (where you score higher)
- AI-generated qualification analysis and risk assessment

### 4. AI Immigration Advisor (Chat)
- Real-time streaming chat with Gemini
- Context-aware responses using the user's full profile
- Priority documents sidebar with AI-generated document lists
- Suggestion chips for quick questions ("Improve my score", "Processing time", "Document checklist")

### 5. Personalized Roadmaps
- Step-by-step timeline (Month 1-2 through Year 2+)
- Document checklist with interactive completion tracking
- AI-generated financial breakdown with realistic cost estimates
- Milestone-based progress visualization

### 6. User Authentication & Persistence
- Email magic link authentication (passwordless)
- Save assessments to Supabase PostgreSQL
- View assessment history
- Resume previous assessments

### 7. 25 Visa Pathways Covered
USA (H-1B, O-1A, EB-2 NIW), Canada (Express Entry, PNP), UK (Skilled Worker, Global Talent), Australia (189, 186), Germany (Opportunity Card, EU Blue Card), Japan (Engineer, HSP, Startup), South Korea (E-7, D-10), Singapore (Employment Pass, Tech.Pass), New Zealand (Skilled Migrant, AEWV), France (Talent Passport), Netherlands (HSM), Ireland (CSP), Sweden (Work Permit), Norway (Skilled Worker), Switzerland (B Permit)

---

## Architecture

```
                          +---------------------+
                          |   React 19 + Vite   |
                          |   (VisaPath Web)    |
                          +----------+----------+
                                     |
                                     v
                          +---------------------+
                          |   Express 5 API     |
                          |   (Port 8080)       |
                          +----------+----------+
                          |         |           |
              +-----------+         |           +-----------+
              |                     |                       |
              v                     v                       v
    +----------------+  +---------------------+  +------------------+
    | Gemini 2.5 Flash|  | Supabase PostgreSQL |  | Supabase Auth    |
    | (AI Scoring)     |  | (Persistence)       |  | (Magic Links)    |
    +----------------+  +---------------------+  +------------------+
```

### Monorepo Structure
```
artifacts-monorepo/
├── artifacts/
│   ├── visapath/          # React 19 frontend (Vite 7, Tailwind CSS 4)
│   └── api-server/        # Express 5 backend (esbuild, Node.js 24)
├── lib/
│   ├── api-spec/          # OpenAPI spec + Orval codegen
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   ├── db/                # Drizzle ORM schema + helpers
│   └── integrations-gemini-ai/  # Gemini AI client
├── scripts/               # Shared utility scripts
└── pnpm-workspace.yaml    # Workspace package discovery
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| wouter | 3 | Lightweight routing |
| Iconify | 3 | Icon library |
| @supabase/supabase-js | 2 | Auth & database client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 5 | HTTP server |
| Node.js | 24 | Runtime |
| TypeScript | 5.9 | Type safety |
| esbuild | 0.25 | Bundler |
| pino-http | 10 | Request logging |
| Zod | 4 | Schema validation |

### AI & Data
| Technology | Version | Purpose |
|-----------|---------|---------|
| Gemini 2.5 Flash | — | AI scoring, chat, analysis, questions |
| Supabase | — | PostgreSQL + Auth |
| Drizzle ORM | — | Database schema & queries |
| Orval | — | OpenAPI → React Query codegen |

### DevOps
| Technology | Purpose |
|-----------|---------|
| pnpm | Package manager & workspaces |
| GitHub Actions | CI/CD (deployment-ready) |
| Vercel | Serverless deployment |

---

## How to Run

### Prerequisites
- Node.js 24+
- pnpm 10+
- Supabase project (for auth & database)
- Gemini API key (via Replit AI Integrations)

### Environment Variables
```bash
# Required in .env
DATABASE_URL=postgres://...          # Supabase connection string
VITE_SUPABASE_URL=https://...        # Supabase project URL
VITE_SUPABASE_ANON_KEY=...           # Supabase anon key
SESSION_SECRET=...                   # Session secret (auto-provided)
```

### Commands
```bash
# Install dependencies
pnpm install

# Run full typecheck
pnpm run typecheck

# Build all packages
pnpm run build

# Run API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Run frontend (port assigned by Replit)
pnpm --filter @workspace/visapath run dev

# Regenerate API clients from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push
```

---

## API Endpoints

### AI Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/score` | POST | AI scoring for all 25 visas against user profile |
| `/api/ai/analyze` | POST | Deep qualification analysis for top visa match |
| `/api/ai/questions` | POST | Generate 2 personalized follow-up questions |
| `/api/ai/roadmap` | POST | Generate 6-step personalized roadmap |
| `/api/ai/pricing` | POST | Generate cost breakdown for visa |
| `/api/ai/chat` | POST | Streaming AI advisor chat (SSE) |

### Health
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/healthz` | GET | Health check |

---

## Database Schema

### Supabase Tables
```sql
-- assessments
id (uuid), user_id (uuid), data (jsonb), created_at (timestamp)

-- recommendations
id (uuid), user_id (uuid), assessment_id (uuid), visa_id (text), score (int), category (text), strengths (jsonb), weaknesses (jsonb), improvements (jsonb), created_at (timestamp)

-- roadmaps
id (uuid), user_id (uuid), assessment_id (uuid), visa_id (text), steps (jsonb), documents (jsonb), costs (jsonb), created_at (timestamp)

-- advisor_chats
id (uuid), user_id (uuid), assessment_id (uuid), messages (jsonb), created_at (timestamp)
```

---

## Design Decisions

1. **100% TypeScript** — No Python, Java, C, or plain HTML/CSS. Every file is `.ts` or `.tsx`.
2. **Dual Scoring** — Rule-based for speed, AI for realism. Users can toggle and compare.
3. **JSON Repair** — Gemini occasionally returns malformed JSON. A `safeJsonParse` helper extracts and repairs JSON before parsing.
4. **Contract-First API** — OpenAPI spec drives code generation for both frontend and backend.
5. **Monorepo** — Shared libraries (DB, Zod schemas, API clients) prevent duplication across artifacts.
6. **Magic Link Auth** — Passwordless authentication reduces friction and improves security.

---

## Screenshots

| Page | Description |
|------|-------------|
| Landing | Animated hero with eligibility gauge, visa pathways preview |
| Assessment | 10-step wizard with AI-generated personalized questions |
| Results | Dual-engine scoring toggle, visa cards, strengths & weaknesses |
| Roadmaps | Timeline, document checklist, financial breakdown |
| AI Advisor | Streaming chat with context-aware responses |
| History | Past assessments with top scores |

---

## Future Roadmap

- [ ] Document upload & AI document review
- [ ] Real-time visa policy updates via web scraping
- [ ] Multi-language support (i18n)
- [ ] Mobile app (Expo)
- [ ] Premium tier with 1-on-1 human advisor matching
- [ ] Community forum & success stories

---

## License

MIT License — feel free to fork, extend, and build on top of VisaPath AI.

---

## Credits

- **AI Model**: Gemini 2.5 Flash via Google AI
- **Database & Auth**: Supabase
- **Icons**: Iconify (Lucide, Phosphor, etc.)
- **Fonts**: Space Grotesk (display), Inter (body)

---

**Built with care for the 280+ million international migrants worldwide.**
