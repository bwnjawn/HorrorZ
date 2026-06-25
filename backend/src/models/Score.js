import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  survivalTime: {
    type: Number,
    required: true,
  },
  maxHordeSize: {
    type: Number,
    required: true,
  },
  victimsCount: {
    type: Number,
    required: true,
  },
  datePlayed: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Score', scoreSchema);
