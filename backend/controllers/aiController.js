import { z } from 'zod';

export const aiCommuteSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  city: z.string().min(2).optional()
});

// ── Formatting Helpers ────────────────────────────────────────────────────────

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

// ── Cost Tables (INR) ─────────────────────────────────────────────────────────
// BMTC Non-AC & Electric Bus share the same fare tier but different CO2.
// Vajra/AC Bus handled separately in route logic.

function calculateCost(mode, distanceKm, isPeak) {
  switch (mode) {
    case 'Metro':
      return Math.min(Math.round(15 + distanceKm * 2.5), 60);
    case 'Electric Bus':
    case 'Bus':
      return Math.min(Math.round(10 + distanceKm * 1.5), 35);
    case 'Walk':
    case 'Cycle':
      return 0;
    case 'Auto':
      return Math.round(30 + distanceKm * 15);
    case 'Cab':
    default: {
      const base = 60 + distanceKm * 22;
      return Math.round(isPeak ? base * 1.5 : base);
    }
  }
}

// ── CO2 Savings vs Cab Baseline (0.21 kg CO2/km) ─────────────────────────────

function calculateCO2Saved(mode, distanceKm) {
  const CAB_BASELINE = 0.21;
  const EMISSIONS = {
    'Walk': 0,
    'Cycle': 0,
    'Metro': 0.04,
    'Electric Bus': 0.05,
    'Bus': 0.12,
    'Auto': 0.17,
    'Cab': 0.21,
  };
  const modeEmission = EMISSIONS[mode] ?? 0.12;
  return Math.max(0, parseFloat(((CAB_BASELINE - modeEmission) * distanceKm).toFixed(2)));
}

// ── Google Maps Directions API Call ──────────────────────────────────────────

async function fetchDirections(origin, destination, mode) {
  const params = new URLSearchParams({
    origin,
    destination,
    mode,
    region: 'in',
    language: 'en',
    key: process.env.GOOGLE_MAPS_API_KEY,
  });
  if (mode === 'transit') {
    params.append('transit_mode', 'bus|subway|rail');
  }
  const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Analyze a transit leg from Google Maps.
// Extracts per-step distances AND station/stop names for UI display.
// Returns: mode, cost, co2Saved, transitSteps[]
function analyzeTransitLeg(leg, totalDistanceKm, isPeak) {
  const steps = leg.steps || [];
  let subwayDistM = 0;
  let busDistM = 0;
  const transitSteps = []; // For UI display

  for (const step of steps) {
    if (step.travel_mode === 'TRANSIT') {
      const td = step.transit_details || {};
      const vType = td.line?.vehicle?.type || '';
      const stepDistM = step.distance?.value || 0;
      const from = td.departure_stop?.name || '?';
      const to = td.arrival_stop?.name || '?';
      const lineName = td.line?.short_name || td.line?.name || '';
      const numStops = td.num_stops || null;

      if (['SUBWAY', 'HEAVY_RAIL', 'COMMUTER_TRAIN', 'METRO_RAIL'].includes(vType)) {
        subwayDistM += stepDistM;
        transitSteps.push({
          type: 'Metro',
          from,
          to,
          line: lineName,
          numStops,
          distKm: parseFloat((stepDistM / 1000).toFixed(1)),
        });
      } else if (['BUS', 'TROLLEYBUS', 'INTERCITY_BUS'].includes(vType)) {
        busDistM += stepDistM;
        transitSteps.push({
          type: 'Bus',
          from,
          to,
          line: lineName,
          numStops,
          distKm: parseFloat((stepDistM / 1000).toFixed(1)),
        });
      }
    }
  }

  const subwayDistKm = parseFloat((subwayDistM / 1000).toFixed(1));
  const busDistKm = parseFloat((busDistM / 1000).toFixed(1));
  const isMetro = subwayDistKm > 0;
  const isBus = busDistKm > 0;

  if (isMetro && !isBus) {
    return {
      mode: 'Metro',
      cost: calculateCost('Metro', totalDistanceKm, isPeak),
      co2Saved: calculateCO2Saved('Metro', totalDistanceKm),
      transitSteps,
    };
  }

  if (isMetro && isBus) {
    const metroCost = calculateCost('Metro', subwayDistKm, isPeak);
    const busCost = calculateCost('Electric Bus', busDistKm, isPeak);
    const metroCO2 = calculateCO2Saved('Metro', subwayDistKm);
    const busCO2 = calculateCO2Saved('Electric Bus', busDistKm);
    return {
      mode: 'Metro + Bus',
      cost: metroCost + busCost,
      co2Saved: parseFloat((metroCO2 + busCO2).toFixed(2)),
      transitSteps,
    };
  }

  // Bus-only — upgrade to Electric Bus for the green card
  return {
    mode: 'Electric Bus',
    cost: calculateCost('Electric Bus', totalDistanceKm, isPeak),
    co2Saved: calculateCO2Saved('Electric Bus', totalDistanceKm),
    transitSteps,
  };
}

// ── Mock Fallback (only used when Google Maps API is unavailable) ─────────────

function buildMockRoutes(source, destination) {
  const distanceKm = 8;
  const isPeak = false;
  return [
    {
      type: 'Fastest',
      mode: 'Cab',
      timeString: '25 min',
      costString: `INR ${calculateCost('Cab', distanceKm, isPeak)}`,
      distanceKm,
      co2SavedKg: 0,
      pointsEarned: 0,
      isGreenChoice: false,
      _mock: true,
    },
    {
      type: 'Greenest',
      mode: 'Electric Bus',
      timeString: '42 min',
      costString: `INR ${calculateCost('Electric Bus', distanceKm, isPeak)}`,
      distanceKm,
      co2SavedKg: calculateCO2Saved('Electric Bus', distanceKm),
      pointsEarned: Math.round(calculateCO2Saved('Electric Bus', distanceKm) * 10),
      isGreenChoice: true,
      _mock: true,
    },
    {
      type: 'Economical',
      mode: 'Bus',
      timeString: '50 min',
      costString: `INR ${calculateCost('Bus', distanceKm, isPeak)}`,
      distanceKm,
      co2SavedKg: calculateCO2Saved('Bus', distanceKm),
      pointsEarned: Math.round(calculateCO2Saved('Bus', distanceKm) * 10),
      isGreenChoice: false,
      _mock: true,
    },
  ];
}

// ── Main Route Calculator ─────────────────────────────────────────────────────

export const calculateAITrip = async (req, res) => {
  try {
    const { source, destination } = req.body;

    // If Google Maps API key is not configured, fall back to mocks immediately
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('[Maps] GOOGLE_MAPS_API_KEY not set — returning mock routes.');
      res.setHeader('X-AI-Fallback', 'no-api-key');
      return res.json(buildMockRoutes(source, destination));
    }

    // Peak hour check (IST)
    const now = new Date();
    const istHour = new Date(now.getTime() + 5.5 * 3600000).getHours();
    const isPeak = (istHour >= 8 && istHour <= 11) || (istHour >= 17 && istHour <= 21);

    // Geocoding context: append Bengaluru, India to reduce ambiguity
    const origin = `${source}, Bengaluru, Karnataka, India`;
    const dest = `${destination}, Bengaluru, Karnataka, India`;

    // Fire all 3 direction calls in parallel
    const [drivingData, transitData, walkingData] = await Promise.all([
      fetchDirections(origin, dest, 'driving'),
      fetchDirections(origin, dest, 'transit'),
      fetchDirections(origin, dest, 'walking'),
    ]);

    console.log(`[Maps] driving=${drivingData.status} transit=${transitData.status} walking=${walkingData.status}`);

    // ── Distance Guards ───────────────────────────────────────────────────────

    // Check if Google Maps couldn't resolve the locations at all
    if (drivingData.status === 'NOT_FOUND' || drivingData.status === 'ZERO_RESULTS') {
      return res.status(400).json({
        message: `Could not find a route between "${source}" and "${destination}" in Bengaluru. Please check your location names and try again.`
      });
    }

    if (drivingData.status === 'OK') {
      const distanceM = drivingData.routes[0].legs[0].distance.value;
      const distanceKm = distanceM / 1000;

      // Too short: likely same location or within the same campus
      if (distanceM < 300) {
        return res.status(400).json({
          message: `The distance between "${source}" and "${destination}" is less than 300m. That's a short walk — no commute needed!`
        });
      }

      // Too long: intercity or interstate travel — out of Treco's scope
      // Treco is designed for intracity commutes in Bengaluru (max ~50km across the city)
      if (distanceKm > 50) {
        return res.status(400).json({
          message: `This route is ${Math.round(distanceKm)} km long — outside Treco's intracity commute range. Treco supports daily city commutes up to 50 km within Bengaluru.`
        });
      }
    }

    const routes = [];


    // ── 1. FASTEST (Cab) ───────────────────────────────────────────────────
    if (drivingData.status === 'OK') {
      const leg = drivingData.routes[0].legs[0];
      const distanceKm = parseFloat((leg.distance.value / 1000).toFixed(1));
      const cost = calculateCost('Cab', distanceKm, isPeak);
      const co2 = calculateCO2Saved('Cab', distanceKm);
      const from = leg.start_address.split(',')[0];
      const to = leg.end_address.split(',')[0];

      routes.push({
        type: 'Fastest',
        mode: 'Cab',
        timeString: formatDuration(leg.duration.value),
        costString: `INR ${cost}`,
        distanceKm,
        co2SavedKg: co2,
        pointsEarned: 0,
        isGreenChoice: false,
        transitSteps: [{ type: 'Cab', from, to, distKm: distanceKm, line: 'Direct Trip' }]
      });
    }

    // ── 2. GREENEST (Transit analysis: Metro / Metro+Bus / Electric Bus) ───
    if (transitData.status === 'OK') {
      const leg = transitData.routes[0].legs[0];
      const distanceKm = parseFloat((leg.distance.value / 1000).toFixed(1));
      const { mode: greenMode, cost, co2Saved, transitSteps } = analyzeTransitLeg(leg, distanceKm, isPeak);
      routes.push({
        type: 'Greenest',
        mode: greenMode,
        timeString: formatDuration(leg.duration.value),
        costString: `INR ${cost}`,
        distanceKm,
        co2SavedKg: co2Saved,
        pointsEarned: Math.max(1, Math.round(co2Saved * 10)),
        isGreenChoice: true,
        transitSteps,
      });
    } else {
      // No transit found — use Walk if short, otherwise Electric Bus estimate
      const drivingLeg = drivingData.status === 'OK' ? drivingData.routes[0].legs[0] : null;
      const distKm = drivingLeg ? parseFloat((drivingLeg.distance.value / 1000).toFixed(1)) : 8;
      if (walkingData.status === 'OK' && distKm <= 2.5) {
        const walkLeg = walkingData.routes[0].legs[0];
        const co2 = calculateCO2Saved('Walk', distKm);
        const from = walkLeg.start_address.split(',')[0];
        const to = walkLeg.end_address.split(',')[0];

        routes.push({
          type: 'Greenest',
          mode: 'Walk',
          timeString: formatDuration(walkLeg.duration.value),
          costString: 'INR 0',
          distanceKm: distKm,
          co2SavedKg: co2,
          pointsEarned: Math.max(1, Math.round(co2 * 10)),
          isGreenChoice: true,
          transitSteps: [{ type: 'Walk', from, to, distKm, line: 'Active Travel' }]
        });
      } else {
        // Estimate Electric Bus as 1.6× driving time (stops, traffic)
        const estDuration = drivingLeg ? Math.round(drivingLeg.duration.value * 1.6) : 2400;
        const cost = calculateCost('Electric Bus', distKm, isPeak);
        const co2 = calculateCO2Saved('Electric Bus', distKm);
        const from = drivingLeg ? drivingLeg.start_address.split(',')[0] : source;
        const to = drivingLeg ? drivingLeg.end_address.split(',')[0] : destination;

        routes.push({
          type: 'Greenest',
          mode: 'Electric Bus',
          timeString: formatDuration(estDuration),
          costString: `INR ${cost}`,
          distanceKm: distKm,
          co2SavedKg: co2,
          pointsEarned: Math.max(1, Math.round(co2 * 10)),
          isGreenChoice: true,
          transitSteps: [{ type: 'Electric Bus', from, to, distKm, line: 'Estimated Route' }]
        });
      }
    }

    // ── 3. ECONOMICAL (Walk if short, else Regular BMTC Bus) ──────────────
    const drivingLeg = drivingData.status === 'OK' ? drivingData.routes[0].legs[0] : null;
    const distKmForBus = drivingLeg ? parseFloat((drivingLeg.distance.value / 1000).toFixed(1)) : 8;

    if (walkingData.status === 'OK') {
      const walkDistKm = parseFloat((walkingData.routes[0].legs[0].distance.value / 1000).toFixed(1));
      if (walkDistKm <= 2) {
        // Walking is free and very eco for short distances
        const walkLeg = walkingData.routes[0].legs[0];
        const co2 = calculateCO2Saved('Walk', walkDistKm);
        const from = walkLeg.start_address.split(',')[0];
        const to = walkLeg.end_address.split(',')[0];

        routes.push({
          type: 'Economical',
          mode: 'Walk',
          timeString: formatDuration(walkLeg.duration.value),
          costString: 'INR 0',
          distanceKm: walkDistKm,
          co2SavedKg: co2,
          pointsEarned: Math.max(1, Math.round(co2 * 10)),
          isGreenChoice: true,
          transitSteps: [{ type: 'Walk', from, to, distKm: walkDistKm, line: 'Active Travel' }]
        });
      } else {
        // Regular BMTC Bus — empirically ~1.7× driving time (stops + traffic)
        const busDuration = drivingLeg ? Math.round(drivingLeg.duration.value * 1.7) : 3000;
        const cost = calculateCost('Bus', distKmForBus, isPeak);
        const co2 = calculateCO2Saved('Bus', distKmForBus);
        const from = drivingLeg ? drivingLeg.start_address.split(',')[0] : source;
        const to = drivingLeg ? drivingLeg.end_address.split(',')[0] : destination;

        routes.push({
          type: 'Economical',
          mode: 'Bus',
          timeString: formatDuration(busDuration),
          costString: `INR ${cost}`,
          distanceKm: distKmForBus,
          co2SavedKg: co2,
          pointsEarned: Math.max(1, Math.round(co2 * 10)),
          isGreenChoice: false,
          transitSteps: [{ type: 'Bus', from, to, distKm: distKmForBus, line: 'Estimated Route' }]
        });
      }
    } else if (drivingLeg) {
      // Fallback: no walking data but driving data exists — use Bus estimate
      const busDuration = Math.round(drivingLeg.duration.value * 1.7);
      const cost = calculateCost('Bus', distKmForBus, isPeak);
      const co2 = calculateCO2Saved('Bus', distKmForBus);
      const from = drivingLeg.start_address.split(',')[0];
      const to = drivingLeg.end_address.split(',')[0];

      routes.push({
        type: 'Economical',
        mode: 'Bus',
        timeString: formatDuration(busDuration),
        costString: `INR ${cost}`,
        distanceKm: distKmForBus,
        co2SavedKg: co2,
        pointsEarned: Math.max(1, Math.round(co2 * 10)),
        isGreenChoice: false,
        transitSteps: [{ type: 'Bus', from, to, distKm: distKmForBus, line: 'Estimated Route' }]
      });
    }

    if (routes.length === 0) {
      console.warn('[Maps] No routes could be built — returning mock data.');
      res.setHeader('X-AI-Fallback', 'maps-unavailable');
      return res.json(buildMockRoutes(source, destination));
    }

    console.log(`[Maps] Built ${routes.length} routes: ${routes.map(r => r.type).join(', ')}`);
    return res.json(routes);

  } catch (err) {
    console.error('[Maps] Route calculation error:', err.message);
    res.setHeader('X-AI-Fallback', 'maps-error');
    return res.json(buildMockRoutes(req.body?.source || 'Unknown', req.body?.destination || 'Unknown'));
  }
};

// ── Vision AI Ticket Auditor (Groq — unchanged) ───────────────────────────────

export const verifyTicketAI = async (imageUrl, transportMode) => {
  try {
    const visionModel = 'llama-3.2-11b-vision-preview';

    const prompt = `You are the Treco Zero-Trust Security Auditor. You ONLY accept PHYSICAL TRANSIT TICKETS. You are HOSTILE to approvals. When in doubt, REJECT.

You are verifying a "${transportMode}" commute in Bengaluru, India (BMTC bus, Namma Metro, etc.).

HARD REJECTION RULES — if ANY of these match, return "isVerified": false IMMEDIATELY:
- The image is NOT a physical transit ticket, QR-code pass, or printed bus/metro receipt.
- The image is a selfie, room photo, street photo, car interior, app screenshot (other than digital QR pass), food, animal, or any non-ticket item.
- The image shows a laptop screen, phone screen, wall, ceiling, or nature scene.
- The image is blurry, dark, or too low-quality to read any ticket text.
- The image has no visible printed text, date, route info, or QR code.
- The image appears to be a stock photo or downloaded from the internet.
- For Walk/Cycle mode: auto-reject — no ticket is issued for walking or cycling.
- For Cab/Auto: ONLY accept a clearly visible Ola/Uber/Namma Yatri digital receipt showing trip details and fare.
- For Bus: ONLY accept a physical BMTC paper ticket, or a digital QR mobile pass.
- For Metro: ONLY accept a Namma Metro QR code ticket, smart card receipt, or printed ticket.

APPROVAL THRESHOLD: You need CLEAR, UNAMBIGUOUS evidence of a valid transit ticket. No ticket = no approval.

DATA EXTRACTION (OCR) — only if approved:
Extract these fields if visible (return null if missing or unreadable):
- date: Date printed on the ticket/receipt.
- source: Starting location/station.
- destination: Ending location/station.
- vehicleNo: Bus number, plate number, or metro line.

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
