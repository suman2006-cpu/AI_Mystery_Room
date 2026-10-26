export const DIFFICULTY_CONFIG = Object.freeze({
  easy: Object.freeze({ suspects: 3, clues: 5, hints: 2, baseScore: 100, timeLimitSeconds: 720, timeoutPenalty: 25, label: "Easy" }),
  medium: Object.freeze({ suspects: 4, clues: 7, hints: 3, baseScore: 150, timeLimitSeconds: 540, timeoutPenalty: 40, label: "Medium" }),
  hard: Object.freeze({ suspects: 5, clues: 9, hints: 3, baseScore: 200, timeLimitSeconds: 420, timeoutPenalty: 60, label: "Hard" }),
});

export function getTimeLimitSeconds(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new Error("Unsupported difficulty");
  return config.timeLimitSeconds;
}

export function calculateScore({ difficulty, isCorrect, discoveredClueCount, hintsUsed }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new Error("Unsupported difficulty");
  const base = isCorrect ? config.baseScore : 0;
  return Math.max(0, base + Math.max(0, discoveredClueCount) * 5 - Math.max(0, hintsUsed) * 10);
}

export function calculatePotentialScore({ difficulty, discoveredClueCount, hintsUsed }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new Error("Unsupported difficulty");
  return Math.max(0, config.baseScore + Math.max(0, discoveredClueCount) * 5 - Math.max(0, hintsUsed) * 10);
}

export function validateGameShape(game, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new Error("Unsupported difficulty");
  if (game.suspects.length !== config.suspects) {
    throw new Error(`Expected ${config.suspects} suspects; received ${game.suspects.length}.`);
  }
  if (game.clues.length !== config.clues) {
    throw new Error(`Expected ${config.clues} clues; received ${game.clues.length}.`);
  }
  if (game.hints.length !== config.hints) {
    throw new Error(`Expected ${config.hints} hints; received ${game.hints.length}.`);
  }
  const suspectIds = new Set(game.suspects.map((item) => item.id));
  const clueIds = new Set(game.clues.map((item) => item.id));
  if (suspectIds.size !== game.suspects.length || clueIds.size !== game.clues.length) {
    throw new Error("Suspect and clue IDs must be unique.");
  }
  if (!suspectIds.has(game.solution.culpritId)) {
    throw new Error("The solution's culprit must match a suspect ID.");
  }
  if (game.solution.proofClueIds.length < 2) {
    throw new Error("At least two clues must support the solution.");
  }
  if (!game.solution.proofClueIds.every((id) => clueIds.has(id))) {
    throw new Error("Every proof clue must exist in the case.");
  }
  if (!game.solution.clueReasoning.every((item) => clueIds.has(item.clueId))) {
    throw new Error("Every clue explanation must reference an existing clue.");
  }
  return game;
}
