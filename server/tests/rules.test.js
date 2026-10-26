import test from "node:test";
import assert from "node:assert/strict";
import { calculateScore, calculatePotentialScore, validateGameShape } from "../src/game/rules.js";
import { buildDemoCase } from "../src/data/demoCase.js";
import { parseGeneratedMystery } from "../src/game/schema.js";

test("correct accusations receive base score plus clue bonuses minus hint penalties", () => {
  assert.equal(calculateScore({ difficulty: "easy", isCorrect: true, discoveredClueCount: 4, hintsUsed: 1 }), 110);
  assert.equal(calculateScore({ difficulty: "hard", isCorrect: true, discoveredClueCount: 9, hintsUsed: 3 }), 215);
});

test("scores never fall below zero", () => {
  assert.equal(calculateScore({ difficulty: "easy", isCorrect: false, discoveredClueCount: 0, hintsUsed: 3 }), 0);
  assert.equal(calculatePotentialScore({ difficulty: "easy", discoveredClueCount: 0, hintsUsed: 20 }), 0);
});

test("demo case meets exact difficulty counts and has a supported culprit", () => {
  for (const difficulty of ["easy", "medium", "hard"]) {
    const game = buildDemoCase({ premise: "A painting disappears during a storm.", difficulty });
    assert.equal(game.suspects.length, { easy: 3, medium: 4, hard: 5 }[difficulty]);
    assert.equal(game.clues.length, { easy: 5, medium: 7, hard: 9 }[difficulty]);
    assert.equal(game.hints.length, { easy: 2, medium: 3, hard: 3 }[difficulty]);
    assert.equal(validateGameShape(game, difficulty), game);
  }
});

test("mystery parser rejects wrong clue counts", () => {
  const game = buildDemoCase({ difficulty: "easy" });
  game.clues.pop();
  assert.throws(() => parseGeneratedMystery(game, "easy"));
});
