## Inspiration

Moving to a new country is one of the most life-changing decisions a person can make — yet the immigration process remains shrouded in complexity. Friends and family members have spent months (and thousands of dollars) navigating fragmented visa information across government websites, immigration forums, and expensive consultants. We kept hearing the same story: *"I know I want to immigrate, but I have no idea where I have the best shot, how much it will cost, or where to even start."*

We built **VisaPath AI** to democratize access to immigration intelligence: a single platform that assesses your profile, calculates real eligibility scores, generates personalized roadmaps, and connects you with an AI advisor that actually understands your specific situation.

## What it does

VisaPath AI is a full-stack immigration intelligence platform with three core components:

**1. AI-Powered Assessment Wizard**
A 10-step interactive wizard collects your profile — nationality, education, work experience, language proficiency (IELTS, French, Japanese), target country, family status, and more. The engine then runs a **rule-based scoring engine** against real visa programs from 12+ countries (Canada, UK, Germany, Australia, Japan, UAE, Singapore, etc.). Each visa program has its own weighted scoring matrix, so the engine calculates a personalized eligibility percentage for each pathway.

**2. Real-Time Results Dashboard**
Displays your top 3 visa matches with an animated circular score, detailed breakdowns, and alternative countries where you might have an even higher chance. Includes a "Why You Qualify" / "Key Risks" section powered by Gemini analysis.

**3. AI Immigration Advisor**
Powered by **Google Gemini 2.5 Flash**, the advisor receives your full assessment profile as system context, then answers natural language questions about processing times, fees, document requirements, and alternative pathways. Responses are **streamed via Server-Sent Events** for a real-time "typing" experience — no loading spinners, just natural conversation.

**4. Personalized Roadmap & Pricing**
The AI generates a 6-12 month step-by-step timeline with month-by-month milestones, a document checklist, and a cost breakdown in the target country's local currency. Everything is tailored to your specific visa pathway.

**5. Persistent History**
Powered by **Supabase**, every assessment, recommendation, roadmap, and chat conversation is saved. Users sign in via email magic links (no passwords needed) and can revisit their entire immigration history across devices.

## How we built it

**Frontend: React + Vite + Tailwind**
We built a single-page application using React 19 with Vite 7 for lightning-fast HMR, Tailwind CSS 4 for utility-first styling, and Framer Motion + GSAP for scroll animations and gooey background effects. Routing is handled by `wouter` for minimal bundle size.

**Backend: Express + esbuild**
The API server is built on Express 5 with Node.js. We use **esbuild** for bundling (not tsc) to produce a single 2.8MB executable. Logging is handled by Pino with `pino-http` for structured request tracing.

**Contract-First API Design**
We chose an OpenAPI + Orval code generation approach. The API contract is defined in a single OpenAPI spec, and Orval generates both Zod validation schemas and React Query hooks. The frontend and backend stay in sync automatically — no type drift between the two sides.

**AI Layer: Gemini 2.5 Flash**
The backend connects to Gemini via a custom wrapper in a shared workspace library. Five endpoints power the experience:
- `analyze` — deep eligibility analysis for the top match
- `questions` — dynamic follow-up questions to refine the profile
- `roadmap` — month-by-month immigration timeline
- `pricing` — cost breakdown in local currency
- `chat` — streaming conversational advisor

**A critical design decision:** The scoring engine is entirely **rule-based and deterministic**. Gemini is used only for natural language explanations, roadmap generation, and conversational advice — never for score calculation. This ensures reproducible, explainable scores while still delivering AI-powered conversational experiences.

**Monorepo Architecture**
The project is structured as a pnpm workspace with shared libraries:
- `@workspace/api-zod` — shared Zod schemas + OpenAPI types
- `@workspace/db` — Drizzle ORM schema + client
- `@workspace/integrations-gemini-ai` — Gemini SDK wrapper with streaming support

TypeScript project references (`composite`) enable fast incremental builds and full cross-package type awareness in the editor.

**Authentication & Persistence**
Supabase provides serverless auth (email magic links) and PostgreSQL persistence. Row-Level Security policies ensure users only ever access their own data. The frontend uses `@supabase/supabase-js` directly for auth and DB operations, while the backend handles the high-compute AI logic.

## Challenges we ran into

**1. pino-http TypeScript Interop**
`pino-http` exports a CJS default function. When we switched from `moduleResolution: "bundler"` (Replit's default) to standard Node resolution, the default import `import pinoHttp from "pino-http"` was flagged as "not callable" by the TypeScript compiler. The fix was switching to the named export `import { pinoHttp } from "pino-http"`, which works across both resolution modes.

**2. Monorepo Build on Serverless**
The project is a pnpm workspace with shared libraries. Standard serverless platforms assume a single package. We had to create a separate `vercel.ts` entry point that exports the Express app without calling `.listen()`, and modify the esbuild configuration to output to a `api/` directory when a serverless environment is detected.

**3. Graceful Degradation Without Secrets**
The app uses `import.meta.env` for Supabase credentials. During early development, we needed the app to work even without credentials. The client detects missing env vars and silently disables auth and persistence — the app is fully functional, and auth/persistence activate the moment the user provides credentials.

**4. LLM Hallucinations in Score Calculation**
Early experiments asked Gemini to calculate eligibility scores. The results were inconsistent across identical prompts — scores fluctuated by 10-15% for the same profile. We moved to a deterministic rule engine with clear weights per visa category, which made the scores trustworthy and fast. Gemini now handles the "why" and "what next" — the AI advisor bridges the gap between the score and the human understanding of what that score means.

## Accomplishments that we're proud of

**A real-time streaming AI chat experience.** We built a fully streaming chat interface where the AI advisor responds character-by-character via Server-Sent Events. The frontend tracks an accumulated text buffer and updates React state incrementally — this gives the "typing" illusion without the flicker of full re-renders.

**Rule-based scoring that actually means something.** Every visa program (Express Entry, Skilled Worker, H-1B, Blue Card, etc.) has its own weighted scoring matrix. A PhD in Engineering is worth 40 points for Canada's Express Entry but only 20 points for a Work Visa. The engine accounts for these differences, producing a score users can actually trust.

**A complete assessment-to-roadmap pipeline.** From the moment a user finishes the assessment, the system generates results, AI analysis, an interactive timeline, a document checklist, and a cost breakdown — all personalized to their specific profile and target country.

**Email magic links with zero passwords.** Users never need to remember a password. Enter your email, get a magic link, click it, you're signed in. All your data is saved and ready across any device.

## What we learned

**Gemini streaming is surprisingly elegant.** The `@google/generative-ai` SDK returns an async iterator, and piping it through a `ReadableStream` with SSE framing is the most responsive AI chat experience we've built. The trick is decoupling the streaming buffer from the React render cycle — update the accumulated text in a ref, then trigger a state update every few frames.

**Monorepos are worth the setup overhead.** When we needed to share Zod schemas, Drizzle schema, and the Gemini integration between the frontend and backend, the workspace packages made it trivial. The `composite` TypeScript configuration with project references means incremental builds are fast and the editor provides full cross-package type awareness.

**Real scoring engines beat LLM hallucinations.** Moving from an LLM-based scoring system to a deterministic rule engine improved accuracy, consistency, and performance dramatically. The AI is best at the human layer — explaining why the score is what it is, and what the user should do next.

**OpenAPI as a contract is a force multiplier.** Defining the API in OpenAPI first, then generating code from it, eliminated an entire class of bugs where the frontend expected one shape and the backend returned another. The generated Zod schemas validate both inputs and outputs at runtime.

## What's next for VisaPath

- **Real-time immigration news feed** — AI-summarized updates on policy changes, CRS score draws, and visa program closures
- **Document upload & verification** — Upload transcripts, IELTS scores, and job offer letters for AI-assisted verification
- **Multi-country comparison** — Side-by-side visa comparison with cost, timeline, and success probability
- **Community features** — Connect applicants with similar profiles to share experiences and timelines
- **Mobile app** — A native iOS/Android experience for users who want to track their progress on the go
