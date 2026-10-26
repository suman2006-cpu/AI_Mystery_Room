import { z } from "zod";
import { DIFFICULTY_CONFIG, validateGameShape } from "./rules.js";

const SuspectSchema = z.object({
  id: z.string().min(2).max(40),
  name: z.string().min(2).max(80),
  role: z.string().min(2).max(100),
  profile: z.string().min(20).max(500),
  alibi: z.string().min(10).max(400),
});

const ClueSchema = z.object({
  id: z.string().min(2).max(40),
  title: z.string().min(3).max(100),
  teaser: z.string().min(8).max(220),
  content: z.string().min(20).max(700),
});

export const GeneratedMysterySchema = z.object({
  title: z.string().min(5).max(120),
  setting: z.string().min(3).max(180),
  story: z.string().min(80).max(2400),
  suspects: z.array(SuspectSchema),
  clues: z.array(ClueSchema),
  hints: z.array(z.string().min(12).max(350)),
  solution: z.object({
    culpritId: z.string().min(2).max(40),
    motive: z.string().min(20).max(700),
    explanation: z.string().min(40).max(1200),
    timeline: z.string().min(20).max(700),
    proofClueIds: z.array(z.string().min(2).max(40)),
    clueReasoning: z.array(z.object({
      clueId: z.string().min(2).max(40),
      reasoning: z.string().min(15).max(500),
    })),
  }),
});

export function parseGeneratedMystery(value, difficulty) {
  const parsed = GeneratedMysterySchema.parse(value);
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new Error("Unsupported difficulty.");
  return validateGameShape(parsed, difficulty);
}

export const CreateCaseInputSchema = z.object({
  playerId: z.string().min(1).max(64),
  premise: z.string().trim().max(600).optional().default("A priceless artifact vanishes during a private gala."),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  demo: z.boolean().optional().default(false),
});

export const AccusationInputSchema = z.object({
  suspectId: z.string().min(2).max(40),
});
