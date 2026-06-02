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

    const prompt = `You are an expert immigration advisor. A user has completed a visa eligibility assessment and their top visa match is "${visaName}" (${visaCountry}) with a ${score}% eligibility score.

User profile:
- Nationality: ${assessment.nationality}
- Current country: ${assessment.currentCountry}
- Target country: ${assessment.targetCountry}
- Age: ${assessment.age}
- Education: ${assessment.degree}
- Work experience: ${assessment.workExperience} years
- English proficiency: ${assessment.englishScore}
- Job offer: ${assessment.jobOffer}
- Travel history: ${Array.isArray(assessment.travelHistory) ? (assessment.travelHistory as string[]).join(', ') || 'None' : 'None'}

Respond ONLY with a valid JSON object (no markdown, no code fences) with exactly these four fields:
{
  "qualification": "2-3 sentences explaining why this person qualifies or how strong their profile is for this visa",
  "risks": "2-3 sentences describing the main risks or weaknesses in their application",
  "documents": "A comma-separated list of the 5-7 most important documents they need for this specific visa",
  "nextSteps": "3-4 concrete, numbered action steps they should take now to move forward"
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

    const systemContext = assessment
      ? `You are VisaPath AI, an expert immigration intelligence advisor. The user has completed an eligibility assessment. Their top visa match is "${visaName}" (${visaCountry}) with ${score}% eligibility. Their profile: ${assessment.degree} degree, ${assessment.workExperience} years experience, ${assessment.englishScore} English, age ${assessment.age}, job offer: ${assessment.jobOffer}. Provide specific, actionable advice in 2-4 sentences. Be direct and concise.`
      : "You are VisaPath AI, an expert immigration intelligence advisor. The user has not yet completed their assessment. Provide helpful immigration guidance in 2-4 sentences. Be direct and concise.";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemContext }] },
        { role: "model", parts: [{ text: "Understood. I'm ready to help with specific immigration guidance." }] },
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
