import { z } from 'zod';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

export const calculateSchema = z.object({
  startCoords: z.tuple([z.number(), z.number()]).optional(),
  endCoords: z.tuple([z.number(), z.number()]).optional(),
  mode: z.enum(['Bus', 'Metro', 'Walk', 'Cycle', 'Cab'])
});

export const logCommuteSchema = calculateSchema.extend({
  distanceKm: z.number(),
  co2SavedKg: z.number(),
  pointsEarned: z.number()
});

export const calculatePreview = async (req, res) => {
  try {
    const { startCoords, endCoords, mode } = req.body;
    const distanceKm = Math.sqrt(
      Math.pow(endCoords[0] - startCoords[0], 2) + Math.pow(endCoords[1] - startCoords[1], 2)
    ) * 111 * 1.3;

    const emissionFactors = { Cab: 200, Bus: 30, Metro: 20, Walk: 0, Cycle: 0 };

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

export const logCommute = async (req, res) => {
  try {
    const { startCoords = [77.5946, 12.9716], endCoords = [77.5946, 12.9716], mode, distanceKm = 0, co2SavedKg, pointsEarned } = req.body;
    const userId = req.user.userId;

    const activity = new Activity({
      userId,
      transportMode: mode,
      distanceKm,
      co2SavedKg,
      pointsEarned,
      startLocation: { type: 'Point', coordinates: startCoords },
      endLocation: { type: 'Point', coordinates: endCoords }
    });

    await activity.save();

    // --- Streak calculation ---
    const user = await User.findById(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = user.lastCommuteDate ? new Date(user.lastCommuteDate) : null;
    const lastDay = lastDate
      ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      : null;
    const diffDays = lastDay ? Math.round((today - lastDay) / (1000 * 60 * 60 * 24)) : -1;

    let newStreak = user.currentStreak || 0;
    let consumeShield = false;

    if (diffDays === 0) {
      // Already logged today — keep streak
    } else if (diffDays === 1) {
      newStreak += 1;
    } else if (user.streakShield && diffDays > 1) {
      // Shield absorbs the missed day
      consumeShield = true;
    } else {
      newStreak = 1;
    }
    // -------------------------

    const updatedUser = await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: pointsEarned, spendablePoints: pointsEarned },
      lastCommuteDate: now,
      currentStreak: newStreak,
      ...(consumeShield ? { streakShield: false } : {})
    }, { new: true });

    res.status(201).json({
      message: 'Commute logged successfully',
      activity,
      newTotal: updatedUser.totalPoints,
      newStreak: updatedUser.currentStreak,
      shieldUsed: consumeShield
    });
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
