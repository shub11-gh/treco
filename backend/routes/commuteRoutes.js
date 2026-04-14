import express from 'express';
import { calculatePreview, logCommute, getHistory, calculateSchema, logCommuteSchema } from '../controllers/commuteController.js';
import { schemaValidator } from '../middlewares/validate.js';
import { validateToken } from '../middlewares/auth.js';
import { calculateAITrip, aiCommuteSchema } from '../controllers/aiController.js';

const router = express.Router();

router.post('/calculate', validateToken, schemaValidator(calculateSchema), calculatePreview);
router.post('/ai-calculate', validateToken, schemaValidator(aiCommuteSchema), calculateAITrip);
router.post('/log', validateToken, schemaValidator(logCommuteSchema), logCommute);
router.get('/history', validateToken, getHistory);

export default router;
