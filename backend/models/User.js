import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  collegeName:    { type: String, required: true, index: true },
  password:       { type: String, required: true },
  totalPoints:    { type: Number, default: 0 },
  spendablePoints:{ type: Number, default: 0 },
  currentStreak:  { type: Number, default: 0 },
  bestStreak:     { type: Number, default: 0 },
  lastCommuteDate:{ type: Date },
  streakShield:   { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ collegeName: 1, totalPoints: -1 });

export default mongoose.model('User', userSchema);
