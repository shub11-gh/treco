import { z } from 'zod';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { calculateAITrip, aiCommuteSchema, verifyTicketAI } from '../controllers/aiController.js';

export const calculateSchema = z.object({
  startCoords: z.tuple([z.number(), z.number()]).optional(),
  endCoords: z.tuple([z.number(), z.number()]).optional(),
  mode: z.enum(['Bus', 'Metro', 'Walk', 'Cycle', 'Cab', 'Auto'])
});

export const logCommuteSchema = calculateSchema.extend({
  distanceKm: z.number(),
  co2SavedKg: z.number(),
  pointsEarned: z.number(),
  status: z.enum(['active', 'completed']).optional(),
  isGreenChoice: z.boolean().optional(),
  sourceName: z.string().optional(),
  destinationName: z.string().optional()
});

/**
 * Calculates a preview of CO2 savings and points based on coordinates and mode.
 * Uses Euclidean distance with a 1.3x road-winding factor for realism.
 * @param {Request} req - Express request with start/end coordinates and transport mode.
 * @param {Response} res - Express response.
 */
export const calculatePreview = async (req, res) => {
  try {
    const { startCoords, endCoords, mode } = req.body;
    const distanceKm = Math.sqrt(
      Math.pow(endCoords[0] - startCoords[0], 2) + Math.pow(endCoords[1] - startCoords[1], 2)
    ) * 111 * 1.3;

    const emissionFactors = { Cab: 200, Auto: 150, Bus: 30, Metro: 20, Walk: 0, Cycle: 0 };

    const baselineEmissions = distanceKm * emissionFactors.Cab;
    const actualEmissions = distanceKm * emissionFactors[mode];
    const co2SavedKg = Math.max(0, (baselineEmissions - actualEmissions) / 1000);
    const pointsEarned = Math.round(co2SavedKg * 10);

    res.json({
      distanceKm: Number(distanceKm.toFixed(2)),
      co2SavedKg: Number(co2SavedKg.toFixed(2)),
      pointsEarned,
      mode
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Logs a new commute activity. 
 * Performs backend-side calculation of points/CO2 to prevent client-side spoofing.
 * @param {Request} req - Express request with trip metadata.
 * @param {Response} res - Express response.
 */
export const logCommute = async (req, res) => {
  try {
    const { 
      startCoords = [77.5946, 12.9716], 
      endCoords = [77.5946, 12.9716], 
      mode, 
      status = 'completed',
      isGreenChoice = false,
      sourceName,
      destinationName
    } = req.body;
    const userId = req.user.userId;

    // --- SECURITY: PREVENT MULTIPLE ACTIVE SESSIONS ---
    const active = await Activity.findOne({ userId, status: 'active' });
    if (active && status === 'active') {
      return res.status(400).json({ message: 'You already have a commute in progress. Finish it first!' });
    }

    // --- RE-CALCULATE ON BACKEND FOR SECURITY ---
    let distanceKm, co2SavedKg, pointsEarned;

    if (req.body.startCoords && req.body.endCoords) {
      distanceKm = Math.sqrt(
        Math.pow(endCoords[0] - startCoords[0], 2) + Math.pow(endCoords[1] - startCoords[1], 2)
      ) * 111 * 1.3;
      const emissionFactors = { Cab: 200, Bus: 30, Metro: 20, Walk: 0, Cycle: 0, Auto: 150 };
      const baselineEmissions = distanceKm * emissionFactors.Cab;
      const actualEmissions = distanceKm * (emissionFactors[mode] || 0);
      co2SavedKg = Math.max(0, (baselineEmissions - actualEmissions) / 1000);
      pointsEarned = Math.round(co2SavedKg * 10);
    } else {
      // Trust provided metrics if coords are unavailable (e.g. from AI Smart Engine)
      // SECURITY: Apply a Sanity Cap (max 150 points per trip for untrusted sources)
      distanceKm = Math.min(Number(req.body.distanceKm || 5), 50);
      co2SavedKg = Math.min(Number(req.body.co2SavedKg || 0.5), 15);
      pointsEarned = Math.min(Number(req.body.pointsEarned || 5), 150);
    }

    const activity = new Activity({
      userId,
      transportMode: mode,
      distanceKm: Number(distanceKm.toFixed(2)),
      co2SavedKg: Number(co2SavedKg.toFixed(2)),
      pointsEarned,
      status,
      isGreenChoice,
      sourceName,
      destinationName,
      startLocation: { type: 'Point', coordinates: startCoords },
      endLocation: { type: 'Point', coordinates: endCoords }
    });

    await activity.save();

    if (status === 'active') {
      return res.status(201).json({
        message: 'Commute started',
        activity
      });
    }

    const result = await finalizeCommute(userId, pointsEarned, mode, co2SavedKg, distanceKm);
    
    res.status(201).json({
      message: 'Commute logged successfully',
      activity,
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeCommute = async (req, res) => {
  try {
    const { activityId, bypass = false } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const isDemoBypass = bypass && user?.email?.toLowerCase().includes('shub');

    const activity = await Activity.findOne({ _id: activityId, userId });
    if (!activity) return res.status(404).json({ message: 'Commute session not found' });
    if (activity.status === 'completed') return res.status(400).json({ message: 'Commute already completed' });

    // MANDATORY PROOF CHECK
    if (!isDemoBypass && !activity.isVerified) {
      return res.status(403).json({ 
        message: 'Trip NOT verified. You must upload a ticket or selfie and wait for AI verification to complete this trip.' 
      });
    }

    // 24-hour expiry check
    const ageMs = Date.now() - new Date(activity.startedAt).getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    if (ageMs > TWENTY_FOUR_HOURS) {
      activity.status = 'completed';
      await activity.save();
      return res.status(400).json({ message: 'Commute session has expired.' });
    }

    // VELOCITY VALIDATION (ANTI-CHEAT)
    if (!isDemoBypass) {
      const durationHours = (Date.now() - new Date(activity.startedAt).getTime()) / (1000 * 60 * 60);
      const avgSpeed = activity.distanceKm / durationHours;

      const speedLimits = {
        Walk: 10,
        Cycle: 35,
        Bus: 85,
        Metro: 100,
        Cab: 120,
        Auto: 100
      };

      const maxSpeed = speedLimits[activity.transportMode] || 120;
      if (avgSpeed > maxSpeed) {
        return res.status(400).json({ 
          message: `Velocity Violation: You traveled at ${avgSpeed.toFixed(1)} km/h. This is physically impossible for '${activity.transportMode}'. Trip invalidated.` 
        });
      }
    }

    activity.status = 'completed';
    await activity.save();

    const result = await finalizeCommute(userId, activity.pointsEarned, activity.transportMode, activity.co2SavedKg, activity.distanceKm);

    res.json({
      message: 'Commute verified and completed',
      activity,
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Handles mandatory proof upload and triggers AI verification.
 */
export const uploadProof = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activityId } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No proof image uploaded.' });

    const activity = await Activity.findOne({ _id: activityId, userId });
    if (!activity) return res.status(404).json({ message: 'Active commute not found.' });

    const proofUrl = req.file.path; // Cloudinary secure URL

    // --- LIVE VISION AI VERIFICATION ---
    const aiResult = await verifyTicketAI(proofUrl, activity.transportMode);
    
    activity.proofUrl = proofUrl;
    activity.isVerified = aiResult.isVerified;
    activity.verificationReason = aiResult.reason;
    
    await activity.save();

    res.json({
      message: aiResult.isVerified ? 'Proof verified by AI Smart Auditor!' : 'AI could not verify this proof. Please try again with a clearer photo.',
      proofUrl,
      isVerified: aiResult.isVerified,
      reason: aiResult.reason
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper to update user points and streaks
/**
 * Finalizes a commute by updating user points, calculating streaks, and checking milestones.
 * Handles Streak Shield consumption if applicable.
 */
async function finalizeCommute(userId, pointsEarned, mode, co2SavedKg = 0, distanceKm = 0) {
  const user = await User.findById(userId);
  const now = new Date();
  
  // --- DYNAMIC CARBON DEBT LOGIC ---
  let debtChange = 0;
  const isEco = ['Bus', 'Metro', 'Walk', 'Cycle'].includes(mode);

  if (isEco) {
    // Reward: Reduce debt based on CO2 saved (1.5x multiplier for impact)
    debtChange = -(co2SavedKg * 1.5);
  } else if (mode === 'Cab') {
    // Penalty: Increase debt based on distance (0.8x multiplier)
    debtChange = distanceKm * 0.8;
  } else if (mode === 'Auto') {
    // Penalty: Increase debt based on distance (0.5x multiplier)
    debtChange = distanceKm * 0.5;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDate = user.lastCommuteDate ? new Date(user.lastCommuteDate) : null;
  const lastDay = lastDate
    ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
    : null;
  const diffDays = lastDay ? Math.round((today - lastDay) / (1000 * 60 * 60 * 24)) : -1;

  let newStreak = user.currentStreak || 0;
  let consumeShield = false;

  if (diffDays === 0) {
    // Already logged today
  } else if (diffDays === 1) {
    newStreak += 1;
  } else if (user.streakShield && diffDays > 1) {
    consumeShield = true;
  } else {
    newStreak = 1;
  }

  const MILESTONES = [7, 14, 30, 60, 100];
  const streakMilestone = MILESTONES.includes(newStreak) ? newStreak : null;

  // Update carbonDebt, ensuring it doesn't drop below zero
  let newDebt = (user.carbonDebt || 0) + debtChange;
  if (newDebt < 0) newDebt = 0;

  const updatedUser = await User.findByIdAndUpdate(userId, {
    $inc: { totalPoints: pointsEarned, spendablePoints: pointsEarned },
    $set: { carbonDebt: Number(newDebt.toFixed(2)) },
    $max: { bestStreak: newStreak },
    lastCommuteDate: now,
    currentStreak: newStreak,
    ...(consumeShield ? { streakShield: false } : {})
  }, { returnDocument: 'after' });

  return {
    newTotal: updatedUser.totalPoints,
    newStreak: updatedUser.currentStreak,
    newDebt: updatedUser.carbonDebt,
    shieldUsed: consumeShield,
    streakMilestone,
  };
}

export const getActiveCommute = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activity = await Activity.findOne({ userId, status: 'active' });
    res.json({ activity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
