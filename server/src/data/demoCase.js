import { DIFFICULTY_CONFIG } from "../game/rules.js";

const SUSPECTS = [
  {
    id: "theo_mercer", name: "Theo Mercer", role: "Chief of Security",
    profile: "Methodical, observant, and responsible for every camera feed in the Auric Gallery. He knows the building's blind spots better than anyone.",
    alibi: "Claims he stayed in the security control room throughout the blackout, monitoring the live gallery feed.",
  },
  {
    id: "iris_vale", name: "Iris Vale", role: "Head Curator",
    profile: "The gallery's exacting curator, fiercely protective of the Star of Aster and its reputation. She has legitimate display-room access.",
    alibi: "Says she was introducing the collection from the east podium when the lights flickered.",
  },
  {
    id: "leo_vance", name: "Leo Vance", role: "Stage Illusionist",
    profile: "A charming performer hired for the gala. Misdirection is his craft, and he was seen carrying a polished metal case.",
    alibi: "Insists he never left the ballroom stage; several guests remember his final trick, but not its exact timing.",
  },
  {
    id: "mina_chen", name: "Dr. Mina Chen", role: "Electrical Conservator",
    profile: "A careful specialist who maintained the gallery's lighting system earlier that afternoon. She understands its service panels.",
    alibi: "Says she was checking a voltage monitor in the basement substation when the gallery went dark.",
  },
  {
    id: "felix_rowan", name: "Felix Rowan", role: "Private Collector",
    profile: "A wealthy guest who tried to purchase the Star of Aster privately. He had a clear financial motive but no operational access.",
    alibi: "Claims he was speaking with two donors in the east gallery, away from the display corridor.",
  },
];

const CLUES = [
  {
    id: "clue_1", title: "Twelve Seconds on Repeat", teaser: "A tiny irregularity in the gallery camera archive.",
    content: "The camera archive repeats the exact same twelve seconds from 9:14 PM. The loop was manually initiated from the security console; it was not caused by a power failure.",
  },
  {
    id: "clue_2", title: "The Control-Room Key Log", teaser: "An access record that does not fit the official timeline.",
    content: "The spare console key was signed out at 9:12 PM under Theo Mercer's security credential. No other staff member signed it back in before the theft was reported.",
  },
  {
    id: "clue_3", title: "The Clock's Reflection", teaser: "Something in a framed reflection appears to move backwards.",
    content: "A polished frame reflects the gallery clock. During the supposed blackout, the second hand jumps backwards exactly twelve seconds, matching the archived camera loop rather than a real interruption.",
  },
  {
    id: "clue_4", title: "The Radio Transcript", teaser: "A radio call catches a voice where it should not be.",
    content: "The internal radio log records Theo calling 'North Hall clear' at 9:16 PM. A separate door sensor places him at the gallery service corridor at 9:15 PM, contradicting his claim that he never left the control room.",
  },
  {
    id: "clue_5", title: "A Clean Display Case", teaser: "The case was opened without leaving the mess expected of a break-in.",
    content: "There is no broken glass and no sign of forced entry. The display latch was released with the staff bypass tool, which is stored inside the security station—not with the curator's presentation keys.",
  },
  {
    id: "clue_6", title: "The Lighting Maintenance Log", teaser: "The blackout may have been planned rather than accidental.",
    content: "The electrical system reports steady incoming power during the incident. The gallery was not affected by a real outage, so the darkness was staged while the camera loop concealed movement.",
  },
  {
    id: "clue_7", title: "The Untouched Dust Line", teaser: "A trace left behind on the inner service panel.",
    content: "Dust along the inside of the display's service panel is disturbed from the security-side access route. The panel can be reached from the restricted corridor, which the door sensor logged during Theo's unexplained absence.",
  },
  {
    id: "clue_8", title: "The False Alibi", teaser: "A minute-by-minute comparison exposes a contradiction.",
    content: "Theo's written shift note says he checked the control-room monitors at 9:15 PM. But the camera loop began at 9:14 PM, and the corridor sensor logs his credential away from the room at 9:15 PM. The two claims cannot both be true.",
  },
  {
    id: "clue_9", title: "The Recovery Envelope", teaser: "A final procedural detail narrows who could have planned the theft.",
    content: "The display bypass tool was returned to its sealed security envelope after the report. Its inventory seal was cut and replaced with a near-identical blank seal from the control desk—an access point managed only by the security chief.",
  },
];

const ALL_PROOF_IDS = ["clue_1", "clue_2", "clue_4", "clue_6"];
const REASONING = {
  clue_1: "The loop was deliberately started at the security console, so the theft required someone with access to that system.",
  clue_2: "Theo's credential secured the console key at the exact time the loop was set up.",
  clue_4: "The radio transcript and corridor sensor directly contradict Theo's claim that he remained in the control room.",
  clue_6: "A real power failure is ruled out; the darkness was staged to cover the movement during the camera loop.",
};

export function buildDemoCase({ premise = "A priceless artifact vanishes during a private gala.", difficulty = "medium" } = {}) {
  const config = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;
  const clues = CLUES.slice(0, config.clues);
  const suspects = SUSPECTS.slice(0, config.suspects);
  const proofClueIds = ALL_PROOF_IDS.filter((id) => clues.some((clue) => clue.id === id));
  const solution = {
    culpritId: "theo_mercer",
    motive: "Theo planned to sell the Star of Aster through a private broker. His role gave him privileged access, and the camera loop allowed him to create a clean window without triggering a visible break-in.",
    explanation: "Theo Mercer is the only suspect whose access and timeline explain the staged blackout. The camera loop was initiated from the security console, the console key was signed out under Theo's credential, and the radio/corridor records place him away from his claimed post.",
    timeline: "At 9:12 PM, Theo signs out the spare console key. At 9:14 PM, he loops the camera archive and stages the gallery blackout. At 9:15 PM, the corridor sensor places him by the display service route. By 9:16 PM, he is back on radio reporting the hall clear, then returns the bypass tool before the theft is investigated.",
    proofClueIds,
    clueReasoning: proofClueIds.map((clueId) => ({ clueId, reasoning: REASONING[clueId] })),
  };

  const brief = premise.trim();
  return {
    title: "The Last Light at the Auric Gallery",
    setting: "Auric Gallery · London · 9:17 PM",
    story: `At an invitation-only gala, the Star of Aster—a rare sapphire—vanishes from a sealed display case during a twelve-second blackout. No glass is broken. The alarm log shows a clean release, and every suspect has a reason to lie.\n\nCase brief: ${brief}\n\nYou have one job: compare the alibis with the evidence, uncover the contradiction, and name the person who orchestrated the darkness. Every detail matters; the solution is supported by multiple independent clues.`,
    suspects,
    clues,
    hints: [
      "Start with the timing. Decide whether the blackout was a genuine power failure or something deliberately staged.",
      "Compare the security console's access log with Theo's alibi. The strongest evidence is a contradiction between two records.",
      "The person who can create a blind spot and use the staff bypass tool has a different opportunity from the guests with a motive.",
    ].slice(0, config.hints),
    solution,
  };
}
