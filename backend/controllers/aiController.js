import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const aiCommuteSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  city: z.string().min(2).optional()
});

export const calculateAITrip = async (req, res) => {
  try {
    const { source, destination, city = "your city" } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is missing from literal backend .env" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Strict JSON Prompt
    const prompt = `You are an AI Smart Engine for an Eco-Commute app. 
The user is traveling from ${source} to ${destination} in ${city}.
Provide exactly 3 realistic route options in this exact order: Fastest, Greenest, and Economical.

Assume "Fastest" is a baseline Cab/Auto (so co2SavedKg=0, pointsEarned=0). 
Assume "Greenest" is usually Metro/Walk (massive co2 savings).
Assume "Economical" is standard Bus.

Output the response strictly as a JSON array with no formatting, no markdown. Follow this schema exactly:
[
  {
    "type": "Fastest",
    "mode": "Cab",
    "timeString": "25 min",
    "costString": "₹250",
    "co2SavedKg": 0,
    "pointsEarned": 0,
    "isGreenChoice": false
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = JSON.parse(response.text);
    res.json(parsedData);
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ message: err.message });
  }
};
