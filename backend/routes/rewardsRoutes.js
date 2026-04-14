import express from 'express';
import { getRewards, seedRewards } from '../controllers/rewardsController.js';
import { validateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', validateToken, getRewards);
router.post('/seed', seedRewards); // no auth needed — dev/setup route

export default router;
