import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import commuteRoutes from './routes/commuteRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import rewardsRoutes from './routes/rewardsRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/commutes', commuteRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/rewards', rewardsRoutes);

// Error Handling block
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// Database and Server Setup
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carbon-carver')
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.log('DB Connection Error: ', err.message));
