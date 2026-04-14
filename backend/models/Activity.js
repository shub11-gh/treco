import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transportMode: { type: String, enum: ['Bus', 'Metro', 'Walk', 'Cycle', 'Cab'], required: true },
  distanceKm: { type: Number, required: true },
  co2SavedKg: { type: Number, required: true },
  pointsEarned: { type: Number, required: true },
  
  startLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  endLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  }
}, { timestamps: true });

activitySchema.index({ startLocation: '2dsphere' });
activitySchema.index({ endLocation: '2dsphere' });

export default mongoose.model('Activity', activitySchema);
