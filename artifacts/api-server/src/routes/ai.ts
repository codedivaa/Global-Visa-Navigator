import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

function safeJsonParse(text: string): unknown {
  if (!text) return null;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = jsonMatch ? jsonMatch[1].trim() : text.trim();
  const firstBrace = candidate.indexOf("{");
  const firstBracket = candidate.indexOf("[");
  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
  else if (firstBrace !== -1) start = firstBrace;
  else if (firstBracket !== -1) start = firstBracket;
  if (start === -1) return null;
  let jsonCandidate = candidate.slice(start);
  // Find matching end brace/bracket by naive counting
  let depth = 0;
  let inString = false;
  let escape = false;
  const opener = jsonCandidate[0];
  const closer = opener === "{" ? "}" : "]";
  let endIndex = -1;
  for (let i = 0; i < jsonCandidate.length; i++) {
    const ch = jsonCandidate[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === opener) depth++;
    else if (ch === closer) { depth--; if (depth === 0) { endIndex = i; break; } }
  }
  let trimmed = endIndex !== -1 ? jsonCandidate.slice(0, endIndex + 1) : jsonCandidate;
  // Try to fix common model-generated JSON errors: stray unquoted tokens inside arrays
  // e.g. ["a", "b" manures] -> ["a", "b"]
  // e.g. ["a", "b",] -> ["a", "b"]
  trimmed = trimmed
    .replace(/"\s*,?\s*\n\s*[^"\s\[\]{}:,\-\d][^\s\[\]{}:,]*\s*\]/g, '"]')  // stray token before ]
    .replace(/,\s*]/g, ']')   // trailing comma
    .replace(/,\s*}/g, '}');  // trailing comma in object
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

router.post("/ai/score", async (req, res) => {
  try {
    const { assessment, visas } = req.body as {
      assessment: Record<string, unknown>;
      visas: Array<{
        id: string;
        name: string;
        country: string;
        requirements: string[];
        sponsorshipRequired: boolean;
      }>;
    };

    const specificAnswers = assessment.specificAnswers
      ? Object.entries(assessment.specificAnswers as Record<string, string>)
          .map(([k, v]) => `  - ${k}: ${v}`)
          .join("\n")
      : "None provided";

    const visaList = visas
      .map(
        (v, i) =>
          `${i + 1}. ${v.name} (${v.country}) \u2014 ID: ${v.id}\n     Sponsorship required: ${v.sponsorshipRequired}\n     Requirements: ${v.requirements.join("; ")}`,
      )
      .join("\n");

    const prompt = `You are an expert immigration eligibility scoring system. You have helped thousands of applicants and your scores are accurate, realistic, and grounded in real visa requirements.

Score this user against EVERY visa below. Return a score from 0\u2013100 for each, where 0 = completely ineligible, 50 = meets basic requirements but has gaps, 75 = strong candidate, 90+ = virtually guaranteed approval.

Be STRICT and realistic. Most people score 45\u201375. Only award 80+ for truly exceptional profiles.

USER PROFILE:
- Immigration goal: ${assessment.immigrationGoal ?? "Not specified"}
- Nationality: ${assessment.nationality}
- Currently living in: ${assessment.currentCountry}
- Target country: ${assessment.targetCountry}
- Age: ${assessment.age}
- Education: ${assessment.degree}${assessment.fieldOfStudy ? ` in ${assessment.fieldOfStudy}` : ""}
- Work experience: ${assessment.workExperience} years
- English proficiency: ${assessment.englishScore}
- Target language level: ${assessment.targetLanguageLevel ?? "Not provided"}
- Job offer status: ${assessment.jobOffer}
- Travel history: ${Array.isArray(assessment.travelHistory) ? (assessment.travelHistory as string[]).join(", ") || "None" : "None"}
- Country-specific answers:
${specificAnswers}

VISAS TO SCORE:
${visaList}

Respond ONLY with a valid JSON array (no markdown, no code fences, no extra text). Each item must have:
{
  "id": "visa-id",
  "score": number (0-100),
  "category": "Excellent Match" | "Strong Match" | "Moderate Match" | "Developing Match" | "Weak Match",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "improvements": ["string"],
  "missingRequirements": ["string"],
  "explanation": "2-3 sentences explaining why they got this score"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "[]";
    const parsed = safeJsonParse(text);
    if (!parsed || !Array.isArray(parsed)) {
      req.log.error({ text }, "AI score returned invalid JSON");
      return res.status(500).json({ error: "Failed to generate AI scores" });
    }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "AI score error");
    res.status(500).json({ error: "Failed to generate AI scores" });
  }
});

router.post("/ai/analyze", async (req, res) => {
  try {
    const { assessment, visaId, visaName, visaCountry, score } = req.body as {
      assessment: Record<string, unknown>;
      visaId: string;
      visaName: string;
      visaCountry: string;
      score: number;
    };

    const specificAnswers = assessment.specificAnswers
      ? Object.entries(assessment.specificAnswers as Record<string, string>)
          .map(([k, v]) => `  - ${k}: ${v}`)
          .join("\n")
      : "None provided";

    const prompt = `You are an expert immigration consultant who has helped thousands of people obtain visas worldwide.

A user's top visa match is: "${visaName}" (${visaCountry}) — ${score}% eligibility.

COMPLETE USER PROFILE:
- Immigration goal: ${assessment.immigrationGoal ?? "Not specified"}
- Nationality: ${assessment.nationality}
- Currently living in: ${assessment.currentCountry}
- Target country: ${assessment.targetCountry}
- Age: ${assessment.age}
- Education: ${assessment.degree}${assessment.fieldOfStudy ? ` in ${assessment.fieldOfStudy}` : ""}
- Full-time work experience: ${assessment.workExperience} years
- English proficiency: ${assessment.englishScore}
- Target language level: ${assessment.targetLanguageLevel ?? "Not provided"}
- Job offer status: ${assessment.jobOffer}
- Travel history: ${Array.isArray(assessment.travelHistory) ? (assessment.travelHistory as string[]).join(", ") || "None" : "None"}
- Country-specific answers:
${specificAnswers}

Respond ONLY with a valid JSON object (no markdown, no code fences, no extra text) with exactly these four fields:
{
  "qualification": "3-4 sentences: why this person qualifies (or doesn't), citing their specific profile factors for ${visaName}",
  "risks": "3-4 sentences: main risks, gaps, or red flags in their application for ${visaName}",
  "documents": "8-10 comma-separated most important documents for ${visaName} from ${visaCountry} specifically",
  "nextSteps": "4-5 numbered concrete action steps they should take NOW to move toward ${visaName}, based on their specific situation"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "{}";
    const parsed = safeJsonParse(text);
    if (!parsed || typeof parsed !== "object") {
      req.log.error({ text }, "AI analyze returned invalid JSON");
      return res.status(500).json({ error: "Failed to generate analysis" });
    }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "AI analyze error");
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});

router.post("/ai/questions", async (req, res) => {
  try {
    const { nationality, currentCountry, targetCountry, immigrationGoal } = req.body as {
      nationality: string;
      currentCountry: string;
      targetCountry: string;
      immigrationGoal: string;
    };

    const prompt = `You are an expert immigration consultant creating targeted eligibility questions.

User profile:
- Nationality: ${nationality}
- Currently living in: ${currentCountry}
- Target country: ${targetCountry}
- Immigration goal: ${immigrationGoal}

Generate exactly 2 highly specific questions for this ${targetCountry} ${immigrationGoal} immigration scenario.
Focus on the most critical eligibility factors for this exact combination — e.g. sponsorship, degree recognition, language tests, salary thresholds, financial proof, sector, business plan.
Each question must have exactly 4 distinct answer options covering the realistic range of situations.

Respond ONLY with valid JSON (no markdown, no code fences, no extra text):
{
  "questions": [
    {
      "id": "ai_q1",
      "question": "Specific question about a key eligibility factor?",
      "options": ["Most favourable situation", "Partially meets requirement", "Working toward it", "Does not meet it yet"]
    },
    {
      "id": "ai_q2",
      "question": "Second specific question about another key factor?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 1024 },
    });

    const text = response.text ?? "{}";
    const parsed = safeJsonParse(text);
    if (!parsed || typeof parsed !== "object") {
      req.log.error({ text }, "AI questions returned invalid JSON");
      return res.status(500).json({ error: "Failed to generate questions" });
    }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "AI questions error");
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

router.post("/ai/roadmap", async (req, res) => {
  try {
    const { assessment, visaName, visaCountry, score } = req.body as {
      assessment: Record<string, unknown>;
      visaName: string;
      visaCountry: string;
      score: number;
    };

    const specificAnswers = assessment.specificAnswers
      ? Object.entries(assessment.specificAnswers as Record<string, string>)
          .map(([k, v]) => `  - ${k}: ${v}`)
          .join("\n")
      : "None provided";

    const prompt = `You are an expert immigration consultant creating a personalized step-by-step roadmap.

USER PROFILE:
- Immigration goal: ${assessment.immigrationGoal ?? "Not specified"}
- Nationality: ${assessment.nationality}
- Currently living in: ${assessment.currentCountry}
- Target country: ${assessment.targetCountry}
- Age: ${assessment.age}
- Education: ${assessment.degree}${assessment.fieldOfStudy ? ` in ${assessment.fieldOfStudy}` : ""}
- Full-time work experience: ${assessment.workExperience} years
- English proficiency: ${assessment.englishScore}
- Target language level: ${assessment.targetLanguageLevel ?? "Not provided"}
- Job offer status: ${assessment.jobOffer}
- Country-specific answers:
${specificAnswers}

TOP VISA MATCH: ${visaName} (${visaCountry}) — ${score}% eligibility

Create exactly 6 personalized roadmap steps for this specific user applying for ${visaName}.
Make each step highly specific — reference their actual situation (their language level, job offer status, nationality, field of study, etc.).
Each step needs a realistic time estimate.

Respond ONLY with valid JSON (no markdown, no code fences, no extra text):
{
  "steps": [
    {"month": "Month 1–2", "label": "Step Title", "detail": "Specific detail tailored to this user's exact profile and situation"},
    {"month": "Month 2–4", "label": "Step Title", "detail": "..."},
    {"month": "Month 4–6", "label": "Step Title", "detail": "..."},
    {"month": "Month 6–9", "label": "Step Title", "detail": "..."},
    {"month": "Month 9–12", "label": "Step Title", "detail": "..."},
    {"month": "Year 2+", "label": "Step Title", "detail": "..."}
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 2048 },
    });

    const text = response.text ?? "{}";
    const parsed = safeJsonParse(text);
    if (!parsed || typeof parsed !== "object") {
      req.log.error({ text }, "AI roadmap returned invalid JSON");
      return res.status(500).json({ error: "Failed to generate roadmap" });
    }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "AI roadmap error");
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

router.post("/ai/pricing", async (req, res) => {
  try {
    const { targetCountry, visaName, immigrationGoal, nationality } = req.body as {
      targetCountry: string;
      visaName: string;
      immigrationGoal: string;
      nationality: string;
    };

    const prompt = `You are an expert immigration consultant providing accurate cost estimates.

User needs: ${visaName} for ${targetCountry}
Immigration goal: ${immigrationGoal}
Nationality: ${nationality}

Generate a realistic, current cost breakdown for ${visaName} with 6-8 line items.
Include: government/visa fees, mandatory language tests, credential/skills assessment, medical examination, biometrics, any mandatory insurance.
Note which items are typically employer-paid if applicable.
Use the correct local currency for ${targetCountry}.

Respond ONLY with valid JSON (no markdown, no code fences, no extra text):
{
  "items": [
    {"item": "Specific fee name", "cost": "Amount in correct currency"},
    {"item": "...", "cost": "..."}
  ],
  "total": "~Estimated total (e.g. ~CAD $3,500)",
  "note": "One concise sentence about employer-covered costs or important variables."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 1024 },
    });

    const text = response.text ?? "{}";
    const parsed = safeJsonParse(text);
    if (!parsed || typeof parsed !== "object") {
      req.log.error({ text }, "AI pricing returned invalid JSON");
      return res.status(500).json({ error: "Failed to generate pricing" });
    }
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "AI pricing error");
    res.status(500).json({ error: "Failed to generate pricing" });
  }
});

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, assessment, visaName, visaCountry, score } = req.body as {
      message: string;
      assessment: Record<string, unknown> | null;
      visaName?: string;
      visaCountry?: string;
      score?: number;
    };

    let systemContext: string;

    if (assessment) {
      const specificAnswers = assessment.specificAnswers
        ? Object.entries(assessment.specificAnswers as Record<string, string>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : "none";

      systemContext = `You are VisaPath AI — an expert immigration intelligence advisor with deep knowledge of global visa systems.

USER PROFILE:
- Goal: ${assessment.immigrationGoal ?? "Not specified"} immigration
- From: ${assessment.nationality}, currently in ${assessment.currentCountry}
- Target: ${assessment.targetCountry}
- Age: ${assessment.age} | Education: ${assessment.degree}${assessment.fieldOfStudy ? ` (${assessment.fieldOfStudy})` : ""}
- Experience: ${assessment.workExperience} years full-time professional
- English: ${assessment.englishScore} | Target language: ${assessment.targetLanguageLevel ?? "not provided"}
- Job offer: ${assessment.jobOffer}
- Country-specific answers: ${specificAnswers}
- Top visa match: "${visaName}" (${visaCountry}) — ${score}% eligibility

INSTRUCTIONS:
- Provide specific, actionable advice directly relevant to this user's exact profile
- Reference their nationality, target country, and specific circumstances
- For fees/costs, give real current figures in the local currency
- For timelines, give realistic ranges based on the current processing environment
- When asked about requirements, cite the specific version for their nationality
- Be direct, precise, and helpful — like a real immigration consultant they're paying for
- Keep responses to 3-5 sentences unless a longer explanation is genuinely needed`;
    } else {
      systemContext = `You are VisaPath AI — an expert immigration intelligence advisor. The user has not yet completed their assessment. Provide helpful, specific immigration guidance. Suggest they complete the assessment for personalized advice. Keep responses to 3-4 sentences.`;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemContext }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I have your complete profile and I'm ready to provide specific, actionable immigration guidance.",
            },
          ],
        },
        { role: "user", parts: [{ text: message }] },
      ],
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
    res.end();
  }
});

export default router;
