import { DIFFICULTY_CONFIG, calculatePotentialScore, calculateScore, getTimeLimitSeconds } from "../game/rules.js";
import { buildDemoCase } from "../data/demoCase.js";
import { createCaseRecord, getCaseRecord, getOpenCaseRecordsByPlayer, saveCaseRecord } from "../storage/caseRepository.js";
import { getPlayerRecord, savePlayerRecord } from "../storage/playerRepository.js";
import { generateMystery } from "./groqService.js";

export class GameError extends Error {
  constructor(message, status = 400, code = "GAME_ERROR") {
    super(message);
    this.name = "GameError";
    this.status = status;
    this.code = code;
  }
}

function baseProgress() {
  return { discoveredClueIds: [], revealedHints: [], accusation: null, isCorrect: null, score: 0, timeBonus: 0, timePenalty: 0, timeRemaining: null, timedOut: false, completedAt: null };
}

const timeoutLocks = new Map();

function secondsRemaining(record, now = Date.now()) {
  const deadline = new Date(record.createdAt).getTime() + getTimeLimitSeconds(record.difficulty) * 1000;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

async function savePlayerCompletion(record, progress) {
  if (!record.playerId) return;
  const player = await getPlayerRecord(record.playerId);
  if (!player) return;
  player.totalScore = (player.totalScore || 0) + progress.score;
  player.casesPlayed = (player.casesPlayed || 0) + 1;
  player.investigatedFiles = [...new Set([...(player.investigatedFiles || []), String(record._id)])];
  const completedAt = progress.completedAt || new Date();
  player.recentCases = [{ caseId: String(record._id), title: record.title, difficulty: record.difficulty, score: progress.score, isCorrect: Boolean(progress.isCorrect), completedAt }, ...(player.recentCases || []).filter((item) => item.caseId !== String(record._id))].slice(0, 10);
  await savePlayerRecord(player);
}

async function expireCaseIfNeeded(record) {
  const key = String(record._id);
  if (timeoutLocks.has(key)) {
    await timeoutLocks.get(key);
    const current = await getCaseRecord(key);
    if (current) Object.assign(record, current);
    return;
  }
  const expiration = (async () => {
  const progress = record.progress ?? baseProgress();
  if (progress.completedAt || secondsRemaining(record) > 0) return;
  const config = DIFFICULTY_CONFIG[record.difficulty];
  progress.completedAt = new Date();
  progress.isCorrect = false;
  progress.score = -config.timeoutPenalty;
  progress.timePenalty = config.timeoutPenalty;
  progress.timeRemaining = 0;
  progress.timedOut = true;
  record.progress = progress;
  const saved = await saveCaseRecord(record);
  await savePlayerCompletion(saved, progress);
  Object.assign(record, saved);
  })();
  timeoutLocks.set(key, expiration);
  try { await expiration; }
  finally { timeoutLocks.delete(key); }
}

export async function expirePlayerCases(playerId) {
  const openCases = await getOpenCaseRecordsByPlayer(playerId);
  for (const record of openCases) await expireCaseIfNeeded(record);
}

export async function createCase({ premise, difficulty, demo = false, playerId }) {
  if (!await getPlayerRecord(playerId)) throw new GameError("Create a detective account before opening a case.", 401, "PLAYER_REQUIRED");
  let game;
  let provider = "groq";
  if (demo || !process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "replace_me") {
    game = buildDemoCase({ premise, difficulty });
    provider = "demo";
  } else {
    game = await generateMystery({ premise, difficulty });
  }
  const record = await createCaseRecord({ playerId, title: game.title, premise, setting: game.setting, story: game.story, difficulty, provider, suspects: game.suspects, clues: game.clues, hints: game.hints, solution: game.solution, progress: baseProgress() });
  return toPublicCase(record);
}

export async function findCase(id) {
  const record = await getCaseRecord(id);
  if (!record) throw new GameError("We couldn't find this case. It may have expired or the link is incorrect.", 404, "CASE_NOT_FOUND");
  await expireCaseIfNeeded(record);
  return record;
}

export function toPublicCase(record) {
  const progress = record.progress ?? baseProgress();
  const completed = Boolean(progress.completedAt);
  const discovered = new Set(progress.discoveredClueIds ?? []);
  const hints = progress.revealedHints ?? [];
  const config = DIFFICULTY_CONFIG[record.difficulty];
  const timeLimit = getTimeLimitSeconds(record.difficulty);
  const timeRemaining = completed ? (progress.timeRemaining ?? secondsRemaining(record)) : secondsRemaining(record);
  const culprit = completed ? record.suspects.find((suspect) => suspect.id === record.solution.culpritId) : null;
  return {
    id: String(record._id), title: record.title, premise: record.premise, setting: record.setting, story: record.story,
    difficulty: record.difficulty, provider: record.provider, createdAt: record.createdAt,
    timer: { timeLimit, timeRemaining, deadline: new Date(new Date(record.createdAt).getTime() + timeLimit * 1000).toISOString() },
    suspects: record.suspects.map(({ id, name, role, profile, alibi }) => ({ id, name, role, profile, alibi })),
    clues: record.clues.map(({ id, title, teaser, content }) => ({ id, title, teaser, discovered: discovered.has(id) || completed, content: discovered.has(id) || completed ? content : null })),
    progress: {
      discoveredClueIds: [...discovered], hintsUsed: hints.length, hintsRemaining: Math.max(0, record.hints.length - hints.length),
      revealedHints: hints.map((hint) => ({ number: hint.number, text: hint.text })), completed,
      accusation: progress.accusation ?? null, isCorrect: progress.isCorrect ?? null, score: progress.score ?? 0,
      timedOut: progress.timedOut ?? false, timeBonus: progress.timeBonus ?? 0, timePenalty: progress.timePenalty ?? 0,
      potentialScore: calculatePotentialScore({ difficulty: record.difficulty, discoveredClueCount: discovered.size, hintsUsed: hints.length }),
    },
    result: completed ? {
      culpritId: record.solution.culpritId, culpritName: culprit?.name ?? "Unknown", motive: record.solution.motive,
      explanation: record.solution.explanation, timeline: record.solution.timeline, proofClueIds: record.solution.proofClueIds,
      clueReasoning: record.solution.clueReasoning, accusation: progress.accusation, isCorrect: progress.isCorrect,
      score: progress.score, maxBaseScore: config.baseScore, timedOut: progress.timedOut ?? false,
      timeBonus: progress.timeBonus ?? 0, timePenalty: progress.timePenalty ?? 0,
      timeRemaining: progress.timeRemaining ?? 0, timeLimit,
    } : null,
  };
}

export async function getCase(id) {
  return toPublicCase(await findCase(id));
}

export async function timeoutCase(id) {
  const record = await findCase(id);
  if (!record.progress?.timedOut) throw new GameError("The case timer is still running.", 409, "CASE_NOT_TIMED_OUT");
  return toPublicCase(record);
}

export async function discoverClue(id, clueId) {
  const record = await findCase(id);
  const progress = record.progress ?? baseProgress();
  if (progress.completedAt) throw new GameError("This investigation is already closed.", 409, "CASE_COMPLETED");
  const clue = record.clues.find((item) => item.id === clueId);
  if (!clue) throw new GameError("That clue does not belong to this case.", 404, "CLUE_NOT_FOUND");
  if (!progress.discoveredClueIds.includes(clueId)) {
    progress.discoveredClueIds.push(clueId);
    record.progress = progress;
    await saveCaseRecord(record);
    const player = record.playerId ? await getPlayerRecord(record.playerId) : null;
    if (player) {
      player.discoveredFiles = [...new Set([...(player.discoveredFiles || []), `${record.title} - ${clue.title}`])];
      await savePlayerRecord(player);
    }
  }
  return toPublicCase(record);
}

export async function requestHint(id) {
  const record = await findCase(id);
  const progress = record.progress ?? baseProgress();
  if (progress.completedAt) throw new GameError("This investigation is already closed.", 409, "CASE_COMPLETED");
  if (progress.revealedHints.length >= record.hints.length) throw new GameError("You've used every hint for this case.", 409, "NO_HINTS_LEFT");
  const nextIndex = progress.revealedHints.length;
  const hint = { number: nextIndex + 1, text: record.hints[nextIndex], revealedAt: new Date() };
  progress.revealedHints.push(hint);
  record.progress = progress;
  const saved = await saveCaseRecord(record);
  return { hint: { number: hint.number, text: hint.text }, case: toPublicCase(saved) };
}

export async function accuseSuspect(id, suspectId) {
  const record = await findCase(id);
  const progress = record.progress ?? baseProgress();
  if (progress.completedAt) throw new GameError("You have already submitted your final accusation.", 409, "CASE_COMPLETED");
  if (!record.suspects.some((suspect) => suspect.id === suspectId)) throw new GameError("Choose a suspect from this case before submitting your accusation.", 400, "INVALID_SUSPECT");
  const timeRemaining = secondsRemaining(record);
  if (timeRemaining <= 0) {
    await expireCaseIfNeeded(record);
    const expiredCase = toPublicCase(record);
    return { case: expiredCase, result: expiredCase.result };
  }
  const isCorrect = suspectId === record.solution.culpritId;
  progress.accusation = suspectId;
  progress.isCorrect = isCorrect;
  progress.score = calculateScore({ difficulty: record.difficulty, isCorrect, discoveredClueCount: new Set(progress.discoveredClueIds).size, hintsUsed: progress.revealedHints.length });
  progress.timeRemaining = timeRemaining;
  progress.timeBonus = isCorrect ? Math.floor(DIFFICULTY_CONFIG[record.difficulty].baseScore * timeRemaining / getTimeLimitSeconds(record.difficulty)) : 0;
  progress.score += progress.timeBonus;
  progress.completedAt = new Date();
  record.progress = progress;
  const saved = await saveCaseRecord(record);
  await savePlayerCompletion(saved, progress);
  const publicCase = toPublicCase(saved);
  return { case: publicCase, result: publicCase.result };
}

export async function getResult(id) {
  const record = await findCase(id);
  if (!record.progress?.completedAt) throw new GameError("The case is still open. Submit an accusation to reveal the verdict.", 409, "CASE_NOT_COMPLETED");
  const publicCase = toPublicCase(record);
  return { case: publicCase, result: publicCase.result };
}
