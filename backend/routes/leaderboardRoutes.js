import express from 'express';
import { getCampusLeaderboard } from '../controllers/leaderboardController.js';
import { validateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/campus', validateToken, getCampusLeaderboard);

export default router;
