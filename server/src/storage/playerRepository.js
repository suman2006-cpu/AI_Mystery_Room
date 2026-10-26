import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { PlayerModel } from "../models/Player.js";

const memoryPlayers = new Map();
const ready = () => mongoose.connection.readyState === 1;

export async function createPlayerRecord(name) {
  if (ready()) return (await PlayerModel.create({ name })).toObject();
  const now = new Date();
  const player = { _id: randomUUID(), name, totalScore: 0, casesPlayed: 0, investigatedFiles: [], discoveredFiles: [], createdAt: now, updatedAt: now };
  memoryPlayers.set(player._id, player);
  return structuredClone(player);
}

export async function getPlayerRecord(id) {
  if (memoryPlayers.has(id)) return structuredClone(memoryPlayers.get(id));
  if (!ready() || !mongoose.isValidObjectId(id)) return null;
  return PlayerModel.findById(id).lean();
}

export async function savePlayerRecord(player) {
  const id = String(player._id);
  if (memoryPlayers.has(id) || !ready() || !mongoose.isValidObjectId(id)) {
    const saved = { ...player, _id: id, updatedAt: new Date() };
    memoryPlayers.set(id, structuredClone(saved));
    return structuredClone(saved);
  }
  const { _id, __v, ...payload } = player;
  return PlayerModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
}
