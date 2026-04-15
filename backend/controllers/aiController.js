import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const aiCommuteSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  city: z.string().min(2).optional()
});

// Models tried in order — each has its own quota bucket
const MODEL_FALLBACKS = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
];

// Mock fallback when ALL models are rate-limited
function buildMockRoutes(source, destination) {
  return [
    {
      type: 'Fastest',
      mode: 'Cab',
      timeString: '20 min',
      costString: 'INR 200',
      distanceKm: 8,
      co2SavedKg: 0,
      pointsEarned: 0,
      isGreenChoice: false,
      _mock: true,
    },
    {
      type: 'Greenest',
      mode: 'Metro',
      timeString: '35 min',
      costString: 'INR 30',
      distanceKm: 8,
      co2SavedKg: 1.36,
      pointsEarned: 14,
      isGreenChoice: true,
      _mock: true,
    },
    {
      type: 'Economical',
      mode: 'Bus',
      timeString: '45 min',
      costString: 'INR 15',
      distanceKm: 8,
      co2SavedKg: 0.68,
      pointsEarned: 7,
      isGreenChoice: false,
      _mock: true,
    },
  ];
}

function buildPrompt(source, destination, city) {
  return `You are an AI Smart Engine for an Eco-Commute app.
The user is traveling from "${source}" to "${destination}" in ${city}.
Provide exactly 3 realistic route options in this order: Fastest, Greenest, Economical.

Rules:
- "Fastest": Cab/Auto. co2SavedKg=0, pointsEarned=0, isGreenChoice=false.
- "Greenest": Metro or Walk. Highest savings. isGreenChoice=true.
- "Economical": Bus. Moderate savings.
- distanceKm must be realistic for the route.
- co2SavedKg for Metro/Walk = distanceKm * 0.17 (rounded 2dp).
- co2SavedKg for Bus = distanceKm * 0.085 (rounded 2dp).
- pointsEarned = Math.round(co2SavedKg * 10).

Output ONLY a valid JSON array, no markdown, no explanation:
[{"type":"Fastest","mode":"Cab","timeString":"25 min","costString":"INR 250","distanceKm":8.5,"co2SavedKg":0,"pointsEarned":0,"isGreenChoice":false}]`;
}

function parseAndSanitize(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('AI returned invalid JSON.');
    parsed = JSON.parse(match[0]);
  }
  return parsed.map(r => ({
    type:          r.type          || 'Route',
    mode:          r.mode          || 'Bus',
    timeString:    r.timeString    || 'N/A',
    costString:    r.costString    || 'N/A',
    distanceKm:    Number(r.distanceKm    || 5),
    co2SavedKg:    Number(r.co2SavedKg    || 0),
    pointsEarned:  Number(r.pointsEarned  || 0),
    isGreenChoice: !!r.isGreenChoice,
  }));
}

export const calculateAITrip = async (req, res) => {
  try {
    const { source, destination, city = 'your city' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is missing from backend .env' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = buildPrompt(source, destination, city);

    let lastError = null;

    for (const model of MODEL_FALLBACKS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const result = parseAndSanitize(response.text);
        console.log(`[AI] Success with model: ${model}`);
        return res.json(result);
      } catch (err) {
        const status = err?.status || err?.response?.status;
        const isQuota = status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
        console.warn(`[AI] Model ${model} failed (${isQuota ? 'quota' : 'error'}): ${err.message}`);
        lastError = err;
        if (!isQuota) break; // Non-quota error — no point trying other models
      }
    }

    // All models exhausted — return mock data with a warning header
    console.warn('[AI] All models quota-exceeded, returning mock routes.');
    const mockRoutes = buildMockRoutes(source, destination);
    res.setHeader('X-AI-Fallback', 'quota-exceeded');
    return res.json(mockRoutes);

  } catch (err) {
    console.error('AI Controller Error:', err.message);
    res.status(500).json({ message: err.message || 'AI Engine failed.' });
  }
};
