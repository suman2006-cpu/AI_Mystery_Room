import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  totalScore: { type: Number, default: 0 },
  casesPlayed: { type: Number, default: 0 },
  investigatedFiles: [{ type: String }],
  discoveredFiles: [{ type: String }],
  recentCases: { type: [{ caseId: String, title: String, difficulty: String, score: Number, isCorrect: Boolean, completedAt: Date }], default: [] },
}, { timestamps: true });

export const PlayerModel = mongoose.models.Player || mongoose.model("Player", playerSchema);
