import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().endsWith('.edu.in', { message: "Must use a college email (.edu.in)" }),
  collegeName: z.string().min(2),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req, res) => {
  try {
    const { name, email, collegeName, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, collegeName, password });
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
    const user = await User.findOne({ email });
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
    const { cost } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.spendablePoints < parseInt(cost)) {
      return res.status(400).json({ message: 'Not enough spendable points.' });
    }

    user.spendablePoints -= parseInt(cost);
    await user.save();

    res.json({ message: 'Redeemed successfully', spendablePoints: user.spendablePoints });
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
