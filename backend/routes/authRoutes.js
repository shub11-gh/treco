import express from 'express';
import { register, login, getMe, redeemPoints, updateProfile, activateShield, registerSchema, loginSchema } from '../controllers/authController.js';
import { schemaValidator } from '../middlewares/validate.js';
import { validateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', schemaValidator(registerSchema), register);
router.post('/login', schemaValidator(loginSchema), login);
router.post('/redeem', validateToken, redeemPoints);
router.get('/me', validateToken, getMe);
router.patch('/profile', validateToken, updateProfile);
router.post('/shield', validateToken, activateShield);

export default router;
