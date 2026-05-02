import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transportMode: { type: String, enum: ['Bus', 'Metro', 'Walk', 'Cycle', 'Cab', 'Auto'], required: true },
  distanceKm: { type: Number, required: true },
  co2SavedKg: { type: Number, required: true },
  pointsEarned: { type: Number, required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'completed' },
  startedAt: { type: Date, default: Date.now },
  isGreenChoice: { type: Boolean, default: false },
  sourceName: { type: String },
  destinationName: { type: String },
  
  startLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  endLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  
  // MANDATORY PROOF FIELDS
  proofUrl: { type: String }, 
  isVerified: { type: Boolean, default: false },
  verificationReason: { type: String }, // Stores AI's reasoning
  extractedData: {
    date: { type: String },
    source: { type: String },
    destination: { type: String },
    vehicleNo: { type: String }
  }
}, { timestamps: true });

activitySchema.index({ startLocation: '2dsphere' });
activitySchema.index({ endLocation: '2dsphere' });

export default mongoose.model('Activity', activitySchema);
