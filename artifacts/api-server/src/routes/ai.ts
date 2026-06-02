import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "AI analyze error");
    res.status(500).json({ error: "Failed to generate analysis" });
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
