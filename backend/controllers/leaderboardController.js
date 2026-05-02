import User from '../models/User.js';

export const getCampusLeaderboard = async (req, res) => {
  try {
    const collegeName = req.user.collegeName; 

    const topUsers = await User.find({ 
      collegeName,
      $or: [
        { carbonDebt: { $lte: 50 } },
        { carbonDebt: { $exists: false } }
      ]
    })
      .select('name totalPoints currentStreak carbonDebt')
      .sort({ totalPoints: -1, currentStreak: -1 })
      .limit(50);
      
    res.json({ leaderboard: topUsers, college: collegeName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
