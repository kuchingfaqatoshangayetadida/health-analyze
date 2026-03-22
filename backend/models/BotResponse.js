import mongoose from 'mongoose';

const BotResponseSchema = new mongoose.Schema({
  keywords: { type: [String], required: true },
  response: {
    text: { type: String, required: true },
    recommendedSpecialty: { type: String, default: null }
  }
});

export default mongoose.model('BotResponse', BotResponseSchema);