# AI Mystery Room — Product & Engineering Specification

**Version:** 1.0.0  
**Status:** Implementation blueprint  
**AI provider:** Groq API (server-side only)  
**Architecture:** React + Vite + Tailwind CSS frontend, Express + Mongoose backend, MongoDB Atlas persistence

## 1. Product overview

AI Mystery Room is an interactive, browser-based detective game. A player supplies a mystery premise and difficulty; the server asks Groq to create a self-consistent case with suspects, sealed evidence, progressive hints and a single culprit. Players inspect evidence, compare alibis, request optional hints, and submit one final accusation. Only then does the server reveal the culprit, motive, timeline and evidence-based explanation.

### Problem statement
Many AI story experiences are passive or easy to spoil. This project turns AI-generated fiction into a structured, playable investigation with evidence-gated clues, server-authoritative scoring, input validation, persistent progress and a complete deployed user journey.

### Target users
Students, casual puzzle fans, aspiring detectives, and anyone who enjoys fair-play whodunits. The experience should be understandable on a phone without sacrificing the richer case-file layout on desktop.

### Success measures
- A new player can create or start a case without onboarding.
- A player can inspect every clue, use available hints, and submit one final accusation.
- The displayed score agrees with the server's scoring function.
- The culprit and solution fields are absent from active-case responses.
- The full create → investigate → accuse → results flow works in production.

## 2. Scope

### Required features
1. Home page describing the experience and the three-step flow.
2. Case creator with premise field and Easy / Medium / Hard options.
3. Server-generated story, suspects, clues, hints, and private solution.
4. Evidence locker that reveals clue content only after a server-side discovery action.
5. Suspect profiles and alibis.
6. Hint requests with a limited number of progressive hints.
7. Accusation screen with one final selection.
8. Results screen with verdict, score breakdown, culprit, motive, timeline, and proof clues.
9. MongoDB persistence when configured and in-memory fallback for local demo development.
10. Responsive, keyboard-accessible UI; visible loading, empty, error, and disabled states.
11. API validation, rate limits, safe errors, CORS policy, HTTP security headers, and environment-based secrets.

### Optional enhancements for future versions
User accounts, leaderboards, saved case library, daily challenges, hint explanations, audio ambience, a shareable spoiler-safe case link, and analytics. These are intentionally excluded from the MVP to keep the deadline achievable.

### Limitations
- No authentication is required in the MVP; anyone holding a case ID may interact with that case.
- In-memory cases disappear when the API process restarts. Use MongoDB Atlas for deployed persistence.
- Without `GROQ_API_KEY`, the server creates a clearly marked curated demo mystery. AI-generated custom mysteries require a valid Groq key and a supported model ID.
- A language model can generate imperfect fiction; the app validates structure and clue references but cannot formally prove every natural-language deduction. The prompt requires a fair solution with independent evidence.

## 3. Technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React, Vite, React Router, Axios | Responsive pages and API interactions |
| Styling | Tailwind CSS plus custom CSS | Design tokens, layout, responsive states, motion |
| Backend | Node.js, Express | API, validation, game state, scoring |
| AI | Groq SDK + Groq chat completions | Generate structured mystery content |
| Validation | Zod | Validate user input and generated mystery structure |
| Database | MongoDB Atlas + Mongoose | Store private solution and player progress |
| Hosting | Vercel (frontend), Render (backend) | Production deployment |

## 4. User flow

1. Player opens the home page.
2. Player selects **Create your mystery**, writes a premise, and chooses a difficulty.
3. The frontend sends the premise and difficulty to `POST /api/cases`.
4. The server validates the request, generates structured JSON with Groq (or uses a demo case when not configured), validates counts and IDs, and stores the complete case including the private solution.
5. The server returns a public-safe case response, excluding the solution and undiscovered clue contents.
6. Player reads the briefing and examines clues. Each successful discovery is recorded server-side and is idempotent.
7. Player may request one of the available progressive hints. The server selects the next hint and stores the deduction penalty.
8. Player visits the final accusation page and selects one suspect.
9. The backend validates the suspect, closes the case, computes the score, and then returns the final result.
10. The result page displays the verdict, score breakdown, culprit, motive, timeline and proof clues. The player can start another mystery.

## 5. Page specifications

### Home (`/`)
- Product introduction and clear call to action.
- Three-step explanation and difficulty overview.
- Premium dark dossier visual system with warm brass accents.

### Create case (`/create`)
- Premise input: 12–600 characters.
- Difficulty selection with exact case counts.
- Preset premise ideas.
- Optional demo switch.
- Loading state, API errors, and disabled submit state.

### Investigation (`/case/:id`)
- Case title, setting, difficulty, briefing and provider indicator.
- Clue cards with teaser text before discovery and content afterward.
- Suspect cards with profile and alibi.
- Progress meter and potential score.
- Progressive hints with remaining count.
- Link to the final accusation.

### Accusation (`/case/:id/accuse`)
- Suspect selection, stated alibi, explicit irreversible-action warning.
- Submit only when a valid suspect is selected.
- Exactly one final accusation is allowed per case.

### Results (`/case/:id/results`)
- Correct / incorrect verdict.
- Server-calculated score and itemized breakdown.
- Culprit's name, role, motive, narrative explanation and timeline.
- Proof clues and their connection to the culprit.
- Start-new-case action.

### Shared interaction states
- Initial data load, generation progress, clue reveal in progress, hint request in progress, final submission in progress, API/network errors, missing cases, completed cases, and exhausted hints.
- Layout adapts to narrow mobile widths; buttons and controls retain visible focus states.

## 6. Difficulty and scoring rules

| Difficulty | Suspects | Clues | Hints | Correct accusation base |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 points |
| Medium | 4 | 7 | 3 | 150 points |
| Hard | 5 | 9 | 3 | 200 points |

**Final score:** `max(0, (correct ? baseScore : 0) + (uniqueDiscoveredClues × 5) − (hintsUsed × 10))`.

- Each clue can award points once, no matter how often the discovery endpoint is called.
- Hints can be requested only in sequence and only up to the configured hint count.
- The score is calculated by the backend, never accepted from the browser.
- A completed case cannot be changed or accused again.
- Potential score shown before accusation assumes a correct answer; it is not a final score.

## 7. AI output contract and validation

Groq must return one JSON object with this structure:

```json
{
  "title": "string",
  "setting": "string",
  "story": "string",
  "suspects": [
    { "id": "suspect_1", "name": "string", "role": "string", "profile": "string", "alibi": "string" }
  ],
  "clues": [
    { "id": "clue_1", "title": "string", "teaser": "string", "content": "string" }
  ],
  "hints": ["string"],
  "solution": {
    "culpritId": "suspect_1",
    "motive": "string",
    "explanation": "string",
    "timeline": "string",
    "proofClueIds": ["clue_1", "clue_2"],
    "clueReasoning": [{ "clueId": "clue_1", "reasoning": "string" }]
  }
}
```

Validation requirements:
- Exact suspect / clue / hint counts for the selected difficulty.
- Unique suspect and clue IDs.
- Culprit ID must match a suspect.
- At least two proof clues; every proof and reasoning reference must point to an existing clue.
- All strings have bounded lengths; malformed or partial output is rejected and retried once.
- The server never returns `solution` on an active case. Clue content is returned only when discovered, except when a case is complete.
- Groq model IDs are configurable using `GROQ_MODEL`; default in this project is `openai/gpt-oss-120b`. Check the current Groq model catalog before deployment.

## 8. Backend API contract

Base path: `/api`

### `GET /health`
Returns service status, provider mode, storage mode, and server timestamp.

### `POST /cases`
Request:

```json
{ "premise": "A painting vanishes during a storm.", "difficulty": "medium", "demo": false }
```

Success: `201 { "case": <public case>, "message": "..." }`.

### `GET /cases/:id`
Returns the active public case and player progress. Does not return the private solution or sealed clue contents. If completed, the safe result summary is available because the accusation has already been submitted.

### `POST /cases/:id/clues/:clueId/discover`
No body required. Marks a clue discovered, then returns its now-visible content and updated progress. Repeated discovery requests do not add extra score.

### `POST /cases/:id/hints`
No body required. Returns `{ "hint": { "number": 1, "text": "..." }, "case": <public case> }`. Returns `409` when hints are exhausted or the case is complete.

### `POST /cases/:id/accuse`
Request: `{ "suspectId": "suspect_1" }`. Returns the completed case and the result. Returns `409` if already completed and `400` for an unknown suspect ID.

### `GET /cases/:id/result`
Returns the solution and final score only for a completed case. Returns `409` until an accusation is submitted.

### Error format

```json
{ "error": { "code": "CASE_NOT_FOUND", "message": "We couldn't find this case." } }
```

Expected status codes include `400` invalid input, `403` disallowed origin, `404` missing route/case/clue, `409` invalid game-state transition, `429` rate limit, `502` AI generation failure, and `500` unexpected server error.

## 9. Data model

`MysteryCase` contains:
- Public fields: title, premise, setting, story, difficulty, provider.
- Suspects: ID, name, role, profile and alibi.
- Clues: ID, title, teaser and content (content is never included in a sealed public response).
- Private fields: generated hints and `solution` (culprit ID, motive, explanation, timeline, proof clue IDs, clue reasoning).
- Progress: discovered clue IDs, revealed hints, final accusation, correctness, score and completion timestamp.
- Created and updated timestamps.

The solution field is configured as `select: false` in Mongoose and loaded explicitly only within server-side game services. Do not add it to client DTOs before completion.

## 10. Security and abuse considerations

- Keep Groq and MongoDB credentials in server environment variables only.
- Never commit `.env` files or paste secrets into the frontend.
- Apply Helmet, request-size limits, CORS allow-list, Zod validation, rate limits, and generic public error messages.
- Treat the premise as untrusted text in the AI prompt.
- Score, discovered clues, hint sequence and verdict are server-authoritative.
- Do not trust any IDs supplied by the client without validating that they belong to the case.
- Add user authentication and per-user case ownership before exposing private or valuable persistent cases in a larger public service.

## 11. Test plan and acceptance criteria

- Unit-test score logic, minimum score, and exact demo-case counts.
- Test all three difficulty levels through the create endpoint.
- Test invalid premise, invalid difficulty, unknown clue, unknown suspect, duplicate discovery, exhausted hints, duplicate accusation, and result-before-accusation.
- Inspect active-case API responses and verify they contain neither `solution`, `culpritId`, nor undiscovered clue content.
- Test correct and incorrect accusation score paths.
- Test server behavior with a valid Groq key, an invalid key, rate-limit responses, and no key (demo mode).
- Test MongoDB persistence when `MONGODB_URI` is set and in-memory mode without it.
- Test deployed frontend → deployed API → MongoDB/Groq integration on mobile and desktop.

Project is complete when all three difficulty levels run end-to-end, no solution is revealed prematurely, the backend computes final score, results agree with the game state, and the full flow works on the deployed website.
