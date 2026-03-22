import mongoose from 'mongoose';
// ...boshqa kodlar...

const UserSchema = new mongoose.Schema({
  // ...eski maydonlar (name, email, password, role, avatar)...
  specialty: { type: String },
  bio: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

// ...qolgan kodlar...
export default mongoose.model('User', UserSchema);