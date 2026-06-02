---
name: VisaPath AI architecture
description: Key decisions for the VisaPath AI immigration intelligence platform — assessment flow, scoring, data wiring
---

## Assessment flow (10 steps)
Step 1 Immigration Goal → Step 2 Nationality+Age → Step 3 Current Country → Step 4 Target Country → Step 5 Education+FieldOfStudy → Step 6 Work Experience → Step 7 Language Skills → Step 8 Employment → Step 9 Destination-Specific Questions → Step 10 Travel History.

## Type wiring
`Assessment` is defined in `src/lib/scoring.ts` and re-exported via `src/types/index.ts`. Always edit the type in `scoring.ts` only.

## Scoring — language penalties
`targetLanguageScore()` in scoring.ts applies country-specific language penalties:
- Japan: No JLPT + sponsor required = -12 pts → yields 40-53% for average profiles (matches spec)
- South Korea: No TOPIK + sponsor required = -10 pts
- Germany: No German + Blue Card = -6 pts; Opportunity Card = 0 pts (English accepted)
- France: No French = -4 pts
- Canada/UK: IELTS/CELPIP band stored in `targetLanguageLevel`

## Country-specific questions (step 9)
Defined as `COUNTRY_QUESTIONS` map in AssessmentPage.tsx — 15 known countries have tailored 2-question banks; `DEFAULT_QUESTIONS` used as fallback. Answers stored in `specificAnswers: Record<string,string>` on the Assessment type.

**Why:** Pre-defined banks are more reliable than calling Gemini mid-assessment (no loading states, no API failure risk).

## Roadmap/pricing data
`MILESTONE_MAP` and `PRICING_MAP` in RoadmapsPage.tsx cover ~15 visa IDs; `DOC_MAP` covers all 26 visas. Falls back to `MILESTONE_MAP.default` for unlisted visas.

## AI prompts
`/api/ai/analyze` and `/api/ai/chat` in `artifacts/api-server/src/routes/ai.ts` include all new fields: immigrationGoal, fieldOfStudy, targetLanguageLevel, specificAnswers. The analyze endpoint returns JSON with 4 fields: qualification, risks, documents, nextSteps.

## Common pitfall
The `option-btn selected` CSS class drives the selected state styling. OptionBtn component does NOT accept a `value` prop — use `isSelected` boolean and `onSelect` callback.
