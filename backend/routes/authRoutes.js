import express from 'express';
import { register, login, getMe, redeemPoints, updateProfile, activateShield, deleteAccount, getProfileStats, registerSchema, loginSchema, demoSetup } from '../controllers/authController.js';
import { schemaValidator } from '../middlewares/validate.js';
import { validateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', schemaValidator(registerSchema), register);
router.post('/login', schemaValidator(loginSchema), login);
router.get('/demo-setup', validateToken, demoSetup);
router.post('/redeem', validateToken, redeemPoints);
router.get('/me', validateToken, getMe);
router.get('/stats', validateToken, getProfileStats);
router.patch('/profile', validateToken, updateProfile);
router.post('/shield', validateToken, activateShield);
router.delete('/profile', validateToken, deleteAccount);

export default router;
