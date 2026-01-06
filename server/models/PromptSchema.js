import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
    },
    response: {
      type: String,
      required: [true, 'Response is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Prompt = mongoose.model('Prompt', promptSchema);

export default Prompt;
