import mongoose from "mongoose";

const suspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  profile: { type: String, required: true },
  alibi: { type: String, required: true },
}, { _id: false });

const clueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  teaser: { type: String, required: true },
  content: { type: String, required: true },
}, { _id: false });

const reasoningSchema = new mongoose.Schema({
  clueId: { type: String, required: true },
  reasoning: { type: String, required: true },
}, { _id: false });

const solutionSchema = new mongoose.Schema({
  culpritId: { type: String, required: true },
  motive: { type: String, required: true },
  explanation: { type: String, required: true },
  timeline: { type: String, required: true },
  proofClueIds: { type: [String], required: true },
  clueReasoning: { type: [reasoningSchema], required: true },
}, { _id: false });

const revealedHintSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  revealedAt: { type: Date, default: Date.now },
}, { _id: false });

const progressSchema = new mongoose.Schema({
  discoveredClueIds: { type: [String], default: [] },
  revealedHints: { type: [revealedHintSchema], default: [] },
  accusation: { type: String, default: null },
  isCorrect: { type: Boolean, default: null },
  score: { type: Number, default: 0 },
  timeBonus: { type: Number, default: 0 },
  timePenalty: { type: Number, default: 0 },
  timeRemaining: { type: Number, default: null },
  timedOut: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { _id: false });

const caseSchema = new mongoose.Schema({
  playerId: { type: String, default: null, index: true },
  title: { type: String, required: true },
  premise: { type: String, required: true, maxlength: 600 },
  setting: { type: String, required: true },
  story: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  provider: { type: String, enum: ["groq", "demo"], required: true },
  suspects: { type: [suspectSchema], required: true },
  clues: { type: [clueSchema], required: true },
  hints: { type: [String], required: true },
  solution: { type: solutionSchema, required: true, select: false },
  progress: { type: progressSchema, default: () => ({}) },
}, { timestamps: true, minimize: false });

caseSchema.index({ createdAt: -1 });
export const CaseModel = mongoose.models.MysteryCase || mongoose.model("MysteryCase", caseSchema);
