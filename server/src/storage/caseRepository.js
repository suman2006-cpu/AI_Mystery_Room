import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { CaseModel } from "../models/Case.js";

const memoryCases = new Map();

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export async function createCaseRecord(payload) {
  if (isMongoReady()) {
    const doc = await CaseModel.create(payload);
    return doc.toObject({ getters: true });
  }
  const now = new Date();
  const record = { ...structuredClone(payload), _id: randomUUID(), createdAt: now, updatedAt: now };
  memoryCases.set(record._id, record);
  return structuredClone(record);
}

export async function getCaseRecord(id) {
  if (memoryCases.has(id)) return structuredClone(memoryCases.get(id));
  if (!isMongoReady() || !mongoose.isValidObjectId(id)) return null;
  const doc = await CaseModel.findById(id).select("+solution").lean();
  return doc ?? null;
}

export async function saveCaseRecord(record) {
  const id = String(record._id);
  if (memoryCases.has(id) || !isMongoReady() || !mongoose.isValidObjectId(id)) {
    const now = new Date();
    const next = { ...record, _id: id, updatedAt: now };
    memoryCases.set(id, structuredClone(next));
    return structuredClone(next);
  }

  const { _id, __v, ...payload } = record;
  const updated = await CaseModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    select: "+solution",
  }).lean();
  if (!updated) throw new Error("Case could not be saved because it no longer exists.");
  return updated;
}

export async function getOpenCaseRecordsByPlayer(playerId) {
  const memoryMatches = [...memoryCases.values()].filter((record) => record.playerId === playerId && !record.progress?.completedAt).map((record) => structuredClone(record));
  if (!isMongoReady()) return memoryMatches;
  const storedMatches = await CaseModel.find({ playerId, "progress.completedAt": null }).select("+solution").lean();
  const known = new Set(memoryMatches.map((record) => String(record._id)));
  return [...memoryMatches, ...storedMatches.filter((record) => !known.has(String(record._id)))];
}

export function storageMode() {
  return isMongoReady() ? "mongodb" : "memory";
}
