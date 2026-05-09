import mongoose from 'mongoose';

/**
 * Stores every successful reward redemption.
 * The code is generated server-side so it is authoritative and cannot be forged by the client.
 */
const redemptionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  rewardId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  rewardTitle: { type: String, required: true },
  pointsSpent: { type: Number, required: true },
  code:        { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('Redemption', redemptionSchema);
