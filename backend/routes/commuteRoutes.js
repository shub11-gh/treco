import express from 'express';
import { calculatePreview, logCommute, completeCommute, getActiveCommute, getHistory, uploadProof, calculateSchema, logCommuteSchema } from '../controllers/commuteController.js';
import { schemaValidator } from '../middlewares/validate.js';
import { validateToken } from '../middlewares/auth.js';
import { calculateAITrip, aiCommuteSchema } from '../controllers/aiController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/calculate', validateToken, schemaValidator(calculateSchema), calculatePreview);
router.post('/ai-calculate', validateToken, schemaValidator(aiCommuteSchema), calculateAITrip);
router.post('/log', validateToken, schemaValidator(logCommuteSchema), logCommute);
router.post('/complete', validateToken, completeCommute);
router.post('/upload-proof', validateToken, upload.single('proof'), uploadProof);
router.get('/active', validateToken, getActiveCommute);
router.get('/history', validateToken, getHistory);

export default router;
