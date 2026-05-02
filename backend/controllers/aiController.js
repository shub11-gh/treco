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
  const isFarNorth = source.toLowerCase().includes('yelahanka') || destination.toLowerCase().includes('yelahanka');
  const greenMode = isFarNorth ? 'Electric Bus' : 'Metro';
  const distanceKm = 8;

  return [
    {
      type: 'Fastest',
      mode: 'Cab',
      timeString: '25 min',
      costString: 'INR 250',
      distanceKm,
      co2SavedKg: 0,
      pointsEarned: 0,
      isGreenChoice: false,
      _mock: true,
    },
    {
      type: 'Greenest',
      mode: greenMode,
      timeString: '40 min',
      costString: 'INR 25',
      distanceKm,
      co2SavedKg: 1.36,
      pointsEarned: 14,
      isGreenChoice: true,
      _mock: true,
    },
    {
      type: 'Economical',
      mode: 'Bus',
      timeString: '50 min',
      costString: 'INR 20',
      distanceKm,
      co2SavedKg: 0.68,
      pointsEarned: 7,
      isGreenChoice: false,
      _mock: true,
    },
  ];
}

function buildPrompt(source, destination, city) {
  return `You are the Treco Smart Engine, a high-precision commute analyzer.
Your goal is to provide 100% FACTUALLY ACCURATE commute data for the path: "${source}" to "${destination}" in ${city} (Default: Bengaluru).

STRICT VERIFICATION PROTOCOL (DO NOT DEVIATE):
1. REALITY CHECK: Before suggesting a mode, mentally verify if it exists for this specific path. If you are 1% unsure, do NOT suggest it.
2. METRO GROUND TRUTH: 
   - PURPLE LINE: Whitefield to Challaghatta (Functional).
   - GREEN LINE: Nagasandra to Silk Institute (Functional).
   - PINK/YELLOW LINES: NOT YET FUNCTIONAL. Do NOT use them.
   - NO-GO ZONES (No Metro nearby): Yelahanka, Hebbal, Sarjapur, Manyata Tech Park, Electronic City (unless Carpool/Bus), BTM Layout (Deep).
   - RULE: If a Metro station is >3km from either point, the mode MUST be "Auto + Metro" or "Electric Bus". Do NOT say "Metro" if there is no station.

3. COST CALIBRATION (STRICT):
   - BMTC Bus: INR 15 - 35 (Vajra/AC: 40-90).
   - Namma Metro: INR 15 - 60.
   - Ola/Uber/Rapido: Base INR 60 + ~18-25 per km. Peak hours = 1.5x.
   - Auto: Min INR 30 + ~15 per km.

4. LOGIC CONSTRAINTS:
   - "Fastest": Usually Cab/Auto. If <2km, say "Walking/Cycle".
   - "Greenest": Must be a REAL green option. If Metro is impossible, use "Electric Bus" or "Carpool".
   - "Economical": MUST be the lowest cost (Bus/Walking).

EMISSION MATH (kg CO2 saved vs Cab):
- Walking/Cycle/Metro: 0.17 kg/km.
- Electric Bus: 0.15 kg/km.
- Regular Bus: 0.09 kg/km.

Output MUST be a JSON object with key "routes" containing exactly 3 objects.
Each object: type, mode, timeString, costString, distanceKm, co2SavedKg, pointsEarned, isGreenChoice.
pointsEarned = Math.round(co2SavedKg * 10).

CRITICAL: Never hallucinate stations. If you don't know the route, provide a generic "Bus" route based on distance rather than a specific non-existent Metro line.`;
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

  return parsed.map(r => {
    // Robust key mapping
    const type = r.type || r.category || 'Route';
    const modeRaw = r.mode || r.transport || r.vehicle || 'Bus';
    const time = r.timeString || r.duration || r.time || 'N/A';
    const cost = r.costString || r.price || r.cost || 'N/A';

    // Sanitize mode (Capital Case for UI)
    const mode = modeRaw.charAt(0).toUpperCase() + modeRaw.slice(1).toLowerCase();

    return {
      type: type,
      mode: mode,
      timeString: time,
      costString: cost,
      distanceKm: Number(r.distanceKm || 5),
      co2SavedKg: Number(r.co2SavedKg || 0),
      pointsEarned: Number(r.pointsEarned || 0),
      isGreenChoice: !!(r.isGreenChoice || type.toLowerCase().includes('green')),
    };
  });
}

export const calculateAITrip = async (req, res) => {
  try {
    const { source, destination, city = 'your city' } = req.body;

    // Peak Hour Logic (Bengaluru Time - IST)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const hour = istDate.getHours();
    
    // Peak: 8-11 AM and 5-9 PM
    const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
    const peakContext = `CURRENT TIME STATUS: ${isPeak ? 'PEAK HOURS (Traffic High, Cab prices surged 1.5x)' : 'NON-PEAK HOURS (Traffic Moderate, Standard pricing)'}`;

    const prompt = `You are the Treco Smart Engine. ${peakContext}
Provide commute data for: "${source}" to "${destination}" in ${city}.

RULES:
1. Provide ONLY ONE definitive cost for each route based on the ${peakContext}.
2. DO NOT list "Peak/Non-Peak" ranges. Just give the single final price.
` + buildPrompt(source, destination, city);

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

export const verifyTicketAI = async (imageUrl, transportMode) => {
  try {
    const visionModel = 'llama-3.2-11b-vision-preview';
    
    const prompt = `You are the Treco Zero-Trust Security Auditor. Your ONLY job is to REJECT images that are not valid transit proof. You are HOSTILE to approvals. When in doubt, REJECT.

You are verifying a "${transportMode}" commute in an Indian city (e.g., Bengaluru, BMTC bus, Namma Metro).

HARD REJECTION RULES — if ANY of these match, you MUST return "isVerified": false:
- The image is a selfie without a clearly visible transit ticket, receipt, or QR code.
- The image shows a laptop, phone screen, wall, ceiling, room interior, food, animal, nature, or any non-transit object.
- The image is blurry, dark, or too low-quality to read any text.
- The image has no visible printed text, date, station name, or route information.
- The image appears to be a stock photo or downloaded image.
- For Walk/Cycle: There is no clear outdoor street scene or public transit surroundings visible.
- For Cab: There is no visible Ola/Uber/Rapido app screen or car interior with a live trip.
- For Bus/Metro: There is no visible physical ticket, digital QR pass, or printed receipt.

ONLY APPROVE if you have HIGH CONFIDENCE that the image is a genuine transit document or scene. The burden of proof is on the image.

DATA EXTRACTION (OCR) — only if approved:
Extract these fields if visible (return null if missing or unreadable):
- date: Date printed on the ticket/receipt.
- source: Starting location/station.
- destination: Ending location/station.
- vehicleNo: Bus number, plate number, or train/metro line number.

RESPONSE FORMAT: Return ONLY a valid JSON object:
{
  "isVerified": boolean,
  "reason": "One concise sentence explaining the decision (max 15 words)",
  "extractedDate": "string or null",
  "extractedSource": "string or null",
  "extractedDestination": "string or null",
  "extractedVehicleNo": "string or null"
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: visionModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Groq Vision Error");

    const result = JSON.parse(data.choices[0].message.content);
    console.log(`[AI Auditor] Result for ${transportMode}:`, result);
    return result;

  } catch (err) {
    console.error("[AI Auditor] Failed:", err.message);
    // SECURITY: On any API failure, REJECT the image. Never approve on error.
    return { isVerified: false, reason: "Verification service unavailable. Please try again." };
  }
};
