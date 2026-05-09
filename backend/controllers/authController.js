import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Reward from '../models/Reward.js';
import Redemption from '../models/Redemption.js';

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).endsWith('.edu.in', { message: "Must use a college email (.edu.in)" }),
  collegeName: z.string().min(2, { message: "University name must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req, res) => {
  try {
    const { name, email, collegeName, password } = req.body;
    const lowerEmail = email.toLowerCase();

    const existing = await User.findOne({ email: lowerEmail });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email: lowerEmail, collegeName, password });
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set in environment variables.');
    const token = jwt.sign({ userId: user._id, collegeName: user.collegeName }, secret, { expiresIn: '7d' });

    const { password: _pw, ...safeUser } = user.toObject();
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set in environment variables.');
    const token = jwt.sign({ userId: user._id, collegeName: user.collegeName }, secret, { expiresIn: '7d' });

    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const redeemPoints = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // --- SECURE REDEMPTION: Fetch cost from DB, not client ---
    const reward = await Reward.findById(rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found.' });
    }

    const pointsToRedeem = reward.pointCost;

    // --- ECO-LOCK: Prevent luxury redemptions if Carbon Debt is high ---
    const luxuryCategories = ['Tech', 'Lifestyle'];
    if (luxuryCategories.includes(reward.category) && user.carbonDebt > 30) {
      return res.status(403).json({ 
        message: `Reward Locked: Your Carbon Debt (${user.carbonDebt}kg) is too high. Choose Green Commutes to lower your debt before redeeming luxury items!` 
      });
    }

    // --- ATOMIC REDEMPTION: Use findOneAndUpdate with point check filter ---
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.userId, spendablePoints: { $gte: pointsToRedeem } },
      { 
        $inc: { spendablePoints: -pointsToRedeem },
        $set: { ...(reward.title === 'Streak Shield' ? { streakShield: true } : {}) }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: 'Redemption failed. Insufficient points or session conflict.' });
    }

    // --- SERVER-SIDE CODE GENERATION (Bug #7 fix) ---
    // Generate a unique, authoritative redemption code and persist it.
    // Format: TRC-<REWARDID_SUFFIX>-<USERID_SUFFIX>-<TIMESTAMP_BASE36>
    const timePart = Date.now().toString(36).toUpperCase();
    const rewardPart = rewardId.toString().slice(-4).toUpperCase();
    const userPart = req.user.userId.toString().slice(-4).toUpperCase();
    const redemptionCode = `TRC-${rewardPart}-${userPart}-${timePart}`;

    await Redemption.create({
      userId: req.user.userId,
      rewardId,
      rewardTitle: reward.title,
      pointsSpent: pointsToRedeem,
      code: redemptionCode,
    });

    res.json({ 
      message: 'Redeemed successfully', 
      spendablePoints: updatedUser.spendablePoints,
      shieldActivated: reward.title === 'Streak Shield',
      redemptionCode,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) {
      user.name = name.trim();
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const activateShield = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.streakShield) return res.status(400).json({ message: 'You already have an active Streak Shield.' });

    const SHIELD_COST = 2000;
    if (user.spendablePoints < SHIELD_COST) {
      return res.status(400).json({ message: `You need ${SHIELD_COST} spendable points to activate the shield.` });
    }

    user.spendablePoints -= SHIELD_COST;
    user.streakShield = true;
    await user.save();
    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ message: 'Streak Shield activated! Your next missed day is protected.', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.user;
    // 1. Delete all activities associated with this user (prevent orphaned data)
    await Activity.deleteMany({ userId });

    // 2. Delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account and all associated data permanently deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfileStats = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Total Commutes
    const totalCommutes = await Activity.countDocuments({ userId, status: 'completed' });

    // 2. Campus Rank (Position)
    const collegeName = user.collegeName;
    const rank = await User.countDocuments({ 
      collegeName, 
      totalPoints: { $gt: user.totalPoints } 
    }) + 1;

    // 3. Campus Total Points (for % calculation)
    const campusStats = await User.aggregate([
      { $match: { collegeName } },
      { $group: { _id: null, total: { $sum: "$totalPoints" } } }
    ]);
    const campusTotal = campusStats[0]?.total || 0;

    res.json({
      totalCommutes,
      rank,
      campusTotal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const demoSetup = async (req, res) => {
  try {
    const demoEmail = 'shub@college.edu.in';
    const user = await User.findOneAndUpdate(
      { email: demoEmail },
      { $set: { spendablePoints: 8500, totalPoints: 12400, currentStreak: 12, carbonDebt: 62 } },
      { new: true }
    );

    // Only seed rewards if the collection is empty — avoids wiping real user rewards on repeated calls
    const existingRewardCount = await Reward.countDocuments();
    if (existingRewardCount === 0) {
      const sampleRewards = [
        { title: 'Amazon Voucher', pointCost: 1000, category: 'Digital Cash', sponsorCollege: 'Ola Money', description: 'INR 100 Gift Card for all your shopping needs.' },
        { title: 'Flipkart Gift Card', pointCost: 2500, category: 'Digital Cash', sponsorCollege: 'Flipkart', description: 'INR 250 Gift Card for electronics and fashion.' },
        { title: 'Swiggy Voucher', pointCost: 1500, category: 'Digital Cash', sponsorCollege: 'Zomato', description: 'INR 150 discount on your next meal.' },
        { title: 'Wireless Earbuds', pointCost: 5000, category: 'Tech', sponsorCollege: 'Boat Audio', description: 'Noise-cancelling wireless buds for your commute.' },
        { title: 'MacBook Skin', pointCost: 800, category: 'Tech', sponsorCollege: 'Dbrand', description: 'Custom protective skin for your laptop.' },
        { title: 'Free Coffee', pointCost: 150, category: 'Food', sponsorCollege: 'Starbucks', description: 'One standard size latte or cappuccino.' },
        { title: '20% Off Pizza', pointCost: 300, category: 'Food', sponsorCollege: 'Dominos', description: 'Valid on all medium and large pizzas.' },
        { title: 'Eco Water Bottle', pointCost: 600, category: 'Lifestyle', sponsorCollege: 'Decathlon', description: 'Reusable 1L stainless steel bottle.' },
        { title: 'Movie Ticket', pointCost: 1200, category: 'Lifestyle', sponsorCollege: 'PVR Cinemas', description: 'One standard 2D movie ticket (Weekdays).' },
        { title: 'Attendance Buffer', pointCost: 3000, category: 'Academic', sponsorCollege: 'Office of Dean', description: 'One-time 2% attendance grace for any subject.' },
        { title: 'Bus Pass (1 Week)', pointCost: 200, category: 'Academic', sponsorCollege: 'BMTC', description: 'Unlimited travel on standard city buses.' },
      ];
      await Reward.insertMany(sampleRewards);
    }

    res.json({ message: 'Demo setup complete!', userBoosted: !!user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
