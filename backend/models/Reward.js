import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  pointCost: { type: Number, required: true },
  sponsorCollege: { type: String, required: true },
  inventoryLimit: { type: Number, default: -1 } 
}, { timestamps: true });

export default mongoose.model('Reward', rewardSchema);
