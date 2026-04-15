import User from '../models/User.js';

export const getCampusLeaderboard = async (req, res) => {
  try {
    const collegeName = req.user.collegeName; 

    const topUsers = await User.find({ collegeName })
      .select('name totalPoints currentStreak')
      .sort({ totalPoints: -1 })
      .limit(50);
      
    res.json({ leaderboard: topUsers, college: collegeName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
