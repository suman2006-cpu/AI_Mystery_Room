import { Router } from "express";
import { z } from "zod";
import { createPlayer, getPlayer } from "../services/playerService.js";
import { GameError } from "../services/caseService.js";

const router = Router();
const playerInput = z.object({ name: z.string().trim().min(2).max(40) });
router.post("/", async (req, res, next) => {
  try {
    const parsed = playerInput.safeParse(req.body ?? {});
    if (!parsed.success) throw new GameError("Enter a name between 2 and 40 characters.", 400, "INVALID_PLAYER_NAME");
    res.status(201).json({ player: await createPlayer(parsed.data.name) });
  } catch (error) { next(error); }
});
router.get("/:id", async (req, res, next) => {
  try { res.json({ player: await getPlayer(req.params.id) }); }
  catch (error) { next(error); }
});
export default router;
