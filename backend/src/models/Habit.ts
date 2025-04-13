import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Habit", habitSchema);