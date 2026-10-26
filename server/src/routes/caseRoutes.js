import { Router } from "express";
import { z } from "zod";
import { AccusationInputSchema, CreateCaseInputSchema } from "../game/schema.js";
import { accuseSuspect, createCase, discoverClue, getCase, getResult, requestHint, timeoutCase } from "../services/caseService.js";
import { GameError } from "../services/caseService.js";

const router = Router();

function validate(schema, value) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).slice(0, 3).join(" ");
    throw new GameError(`Please check your input. ${details}`, 400, "VALIDATION_ERROR");
  }
  return parsed.data;
}

router.post("/", async (req, res, next) => {
  try {
    const input = validate(CreateCaseInputSchema, req.body ?? {});
    if (input.premise.trim().length < 12) {
      throw new GameError("Give your mystery premise a little more detail (at least 12 characters).", 400, "PREMISE_TOO_SHORT");
    }
    const game = await createCase(input);
    res.status(201).json({ case: game, message: game.provider === "demo" ? "Demo case ready." : "Your AI mystery is ready." });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json({ case: await getCase(req.params.id) });
  } catch (error) { next(error); }
});

router.post("/:id/clues/:clueId/discover", async (req, res, next) => {
  try {
    res.json({ case: await discoverClue(req.params.id, req.params.clueId) });
  } catch (error) { next(error); }
});

router.post("/:id/hints", async (req, res, next) => {
  try {
    res.json(await requestHint(req.params.id));
  } catch (error) { next(error); }
});

router.post("/:id/timeout", async (req, res, next) => {
  try { res.json({ case: await timeoutCase(req.params.id) }); }
  catch (error) { next(error); }
});

router.post("/:id/accuse", async (req, res, next) => {
  try {
    const input = validate(AccusationInputSchema, req.body ?? {});
    res.json(await accuseSuspect(req.params.id, input.suspectId));
  } catch (error) { next(error); }
});

router.get("/:id/result", async (req, res, next) => {
  try {
    res.json(await getResult(req.params.id));
  } catch (error) { next(error); }
});

export default router;
