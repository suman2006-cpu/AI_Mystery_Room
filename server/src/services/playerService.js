import { createPlayerRecord, getPlayerRecord } from "../storage/playerRepository.js";
import { expirePlayerCases, GameError } from "./caseService.js";

export async function createPlayer(name) {
  const player = await createPlayerRecord(name.trim());
  return publicPlayer(player);
}

export async function getPlayer(id) {
  await expirePlayerCases(id);
  const player = await getPlayerRecord(id);
  if (!player) throw new GameError("Detective account not found.", 404, "PLAYER_NOT_FOUND");
  return publicPlayer(player);
}

export function publicPlayer(player) {
  const score = player.totalScore || 0;
  const rank = score >= 5000 ? "Master Detective" : score >= 2500 ? "Chief Inspector" : score >= 1000 ? "Senior Detective" : score >= 500 ? "Investigator" : "Rookie Detective";
  return { id: String(player._id), name: player.name, totalScore: score, casesPlayed: player.casesPlayed || 0, investigatedFiles: player.investigatedFiles || [], discoveredFiles: player.discoveredFiles || [], recentCases: player.recentCases || [], rank };
}
