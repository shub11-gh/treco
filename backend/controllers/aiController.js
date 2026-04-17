import { z } from 'zod';

export const aiCommuteSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  city: z.string().min(2).optional()
});

// Groq models tried in order
const MODEL_FALLBACKS = [
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
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

- pointsEarned = Math.round(co2SavedKg * 10).

Output MUST be a valid JSON object with a single key "routes" containing the array of 3 route objects.
Example {"routes": [{"type":"Fastest","mode":"Cab","timeString":"25 min","costString":"INR 250","distanceKm":8.5,"co2SavedKg":0,"pointsEarned":0,"isGreenChoice":false}]}
`;
}

function parseAndSanitize(text) {
  let parsed;
  try {
    const raw = JSON.parse(text);
    parsed = raw.routes || [];
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned invalid JSON.');
    parsed = JSON.parse(match[0]).routes || [];
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

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'GROQ_API_KEY is missing from backend .env' });
    }

    const prompt = buildPrompt(source, destination, city);

    let lastError = null;

    for (const model of MODEL_FALLBACKS) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + process.env.GROQ_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || "Groq API Error: " + response.status);
        }

        const result = parseAndSanitize(data.choices[0].message.content);
        console.log("[AI] Success with model: " + model);
        return res.json(result);
      } catch (err) {
        const isQuota = err.message.includes('429') || err.message.includes('Rate limit');
        console.warn("[AI] Model " + model + " failed (" + (isQuota ? 'quota' : 'error') + "): " + err.message);
        lastError = err;
        // Continue to the next model for ANY error (decommissioned, quota, format error, etc)
        continue;
      }
    }

    // All models exhausted — return mock data with a warning header
    console.warn('[AI] All models failed, returning mock routes.');
    const mockRoutes = buildMockRoutes(source, destination);
    res.setHeader('X-AI-Fallback', 'quota-exceeded');
    return res.json(mockRoutes);

  } catch (err) {
    console.error('AI Controller Error:', err.message);
    res.status(500).json({ message: err.message || 'AI Engine failed.' });
  }
};
