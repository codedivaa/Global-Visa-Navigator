# VisaPath AI

## About the Project

### What Inspired Me

Moving to a new country is one of the most life-changing decisions a person can make — yet the immigration process remains shrouded in complexity. Friends and family members have spent months (and thousands of dollars) navigating fragmented visa information across government websites, immigration forums, and expensive consultants. I built **VisaPath AI** to democratize access to immigration intelligence: a single platform that assesses your profile, calculates real eligibility scores, generates personalized roadmaps, and connects you with an AI advisor that actually understands your specific situation.

### How It Works

VisaPath AI is a full-stack immigration intelligence platform built on a **pnpm monorepo** with three core components:

1. **The Assessment Engine** — A 10-step wizard that collects your profile (nationality, education, experience, language scores, target country, etc.) and runs a **rule-based scoring engine** against real visa programs from 12+ countries. Each visa program has its own weighted scoring matrix, so the engine calculates a personalized eligibility percentage for each pathway.

2. **The AI Advisor** — Powered by **Google Gemini 2.5 Flash**, the advisor receives your full assessment profile as system context, then answers natural language questions about processing times, fees, document requirements, and alternative pathways. Responses are **streamed via Server-Sent Events** for a real-time "typing" experience.

3. **The Roadmap Generator** — The AI generates a 6-12 month step-by-step timeline with month-by-month milestones, a document checklist, and a cost breakdown in the target country's local currency.

### Architecture Decisions

I chose a **contract-first API design** using OpenAPI + Orval code generation. The backend validates inputs and outputs with Zod schemas, and the frontend gets generated React Query hooks. This means the API contract is the single source of truth — frontend and backend stay in sync automatically.

For the AI layer, I made a deliberate decision to **keep the scoring engine entirely rule-based** (never delegating score calculations to Gemini). The AI is used only for natural language explanations, roadmap generation, and personalized advice. This ensures reproducible, explainable scores while still delivering AI-powered conversational experiences.

### Authentication & Persistence

I integrated **Supabase** for serverless auth and data persistence. Users authenticate via email magic links (no passwords needed), and every assessment, recommendation, roadmap, and chat conversation is stored with Row-Level Security policies so users only ever access their own data.

### Challenges Faced

**1. The Monorepo Build on Vercel**
The project is structured as a pnpm workspace with shared libraries (`@workspace/api-zod`, `@workspace/db`, `@workspace/integrations-gemini-ai`). Vercel's default build pipeline assumes a single package. I had to:
- Configure `vercel.json` with `installCommand: "pnpm install"` and `buildCommand: "pnpm --filter @workspace/api-server run build"`
- Create a separate `vercel.ts` entry point that exports the Express app without calling `.listen()` (Vercel handles the server lifecycle)
- Modify the esbuild configuration to output to a `api/` directory when `VERCEL=1` is detected

**2. pino-http TypeScript Interop**
`pino-http` exports a CJS default function. Vercel's TypeScript compiler uses `moduleResolution: "node"` rather than the Replit environment's `"bundler"` mode. The default import `import pinoHttp from "pino-http"` was flagged as "not callable" in Vercel. The fix was switching to the named export: `import { pinoHttp } from "pino-http"`.

**3. Graceful Degradation Without Secrets**
The app uses `import.meta.env` for Supabase credentials. During development, the client detects missing env vars and silently disables auth and persistence. This means the app is fully functional without any backend configuration, and auth/persistence activate the moment the user provides credentials.

### What I Learned

**Gemini streaming is surprisingly elegant.** The `@google/generative-ai` SDK returns an async iterator, and piping it through a `ReadableStream` with SSE framing is the most responsive AI chat experience I've built. The key was tracking the `accumulated` text buffer in the frontend and updating React state incrementally — this gives the "typing" illusion without the flicker of full re-renders.

**Monorepos are worth the setup overhead.** When I needed to share Zod schemas, Drizzle schema, and the Gemini integration between the frontend and backend, the workspace packages made it trivial. The `composite` TypeScript configuration with project references means incremental builds are fast and the editor provides full cross-package type awareness.

**Real scoring engines beat LLM hallucinations.** Early experiments asked Gemini to calculate eligibility scores. The results were inconsistent across identical prompts. Moving to a deterministic rule engine with clear weights per visa category made the scores trustworthy, fast, and explainable. Gemini is best at the "why" and "what next" — the AI advisor fills the gap between the score and the human understanding of what that score means.

---

## Built With

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4 |
| **State & Routing** | wouter, @tanstack/react-query |
| **Animations** | Framer Motion, GSAP |
| **UI Primitives** | Radix UI, Lucide React, @iconify/react |
| **Backend** | Node.js, Express 5, esbuild |
| **AI** | Google Gemini 2.5 Flash (@google/generative-ai) |
| **Validation** | Zod 3.x, drizzle-zod |
| **API** | OpenAPI 3.0 + Orval (codegen) |
| **Database & Auth** | Supabase (PostgreSQL + Auth), Drizzle ORM |
| **Monorepo** | pnpm workspaces, TypeScript project references |
| **Logging** | Pino, pino-http, pino-pretty |
| **Deployment** | Vercel (serverless functions) |

---

*Built at Replit — June 2026*
