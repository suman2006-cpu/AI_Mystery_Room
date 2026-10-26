# AI Mystery Room 🔎

A premium, responsive detective game where Groq creates the mystery and you connect the evidence. React + Vite + Tailwind CSS on the front end; Express, Mongoose, MongoDB Atlas, Zod and Groq on the back end.

## What is included

- Cinematic Nightshift UI refresh: ultraviolet/cyan/lime color system, editorial type, an original inline-SVG midnight manor scene, floating evidence cards, scanning beams, orbital motion, a seamless feature ticker, and responsive Home, Create Case, Investigation, Accusation and Results pages.
- CSS-first motion system with hover states, route entrances, micro-interactions, and a `prefers-reduced-motion` accessibility fallback. See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
- Groq AI case generation using structured JSON output. Default model: `openai/gpt-oss-120b` (editable via `GROQ_MODEL`).
- Easy / Medium / Hard with exact suspect, clue and hint counts.
- A curated demo mystery for immediate testing even before a Groq key is configured.
- Server-private culprit, server-only scoring, evidence discovery, progressive hints, and one final accusation.
- MongoDB persistence when configured; in-memory fallback for local demos.
- CORS allow-list, Helmet, Zod validation, rate limiting, clear API errors and automated rule tests.
- Deployment configuration and a full product spec in [`SPEC.md`](./SPEC.md).

## Requirements

- Node.js 20 or newer
- npm 10+ recommended
- Optional: a Groq API key from <https://console.groq.com/keys>
- Optional: MongoDB Atlas connection string

## Run locally

From this project root:

```bash
npm install
cp server/.env.example server/.env
```

Edit `server/.env`:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_real_groq_key_here
GROQ_MODEL=openai/gpt-oss-120b
MONGODB_URI=your_mongodb_atlas_connection_string
```

For a quick demo, `GROQ_API_KEY` and `MONGODB_URI` can be omitted. The site will use a curated mystery and temporary in-memory storage. Add a valid Groq key to generate new mysteries from the premise. MongoDB Atlas is recommended if cases should survive server restarts.

Start both apps from the root:

```bash
npm run dev
```

**Windows PowerShell:** use `npm.cmd` in place of `npm` if PowerShell blocks the `npm.ps1` script. For example, run `npm.cmd install`, then `npm.cmd run dev`.

Open **http://localhost:5173**. The API health check is at **http://localhost:5000/api/health**.

Run the backend rule tests:

```bash
npm test
```

Build the production frontend:

```bash
npm run build
```

## Environment variables

| Variable | Location | Required? | Description |
|---|---|---|---|
| `PORT` | server | No | API port, default `5000` |
| `NODE_ENV` | server | No | Use `production` on Render |
| `CLIENT_URL` | server | Production | Allowed frontend origin; separate multiple exact origins with commas |
| `GROQ_API_KEY` | server | For AI generation | Private Groq API key; never use a `VITE_` prefix |
| `GROQ_MODEL` | server | No | Groq model ID; defaults to `openai/gpt-oss-120b` |
| `MONGODB_URI` | server | Production recommended | MongoDB Atlas connection URI |
| `VITE_API_URL` | client/Vercel | Production | Base URL of the Render API, without `/api` (example: `https://your-api.onrender.com`) |

## Deploy the frontend to Vercel

1. Push the repository to GitHub.
2. In Vercel, import the repository.
3. Set **Root Directory** to `client`.
4. Keep build command as `npm run build` and output directory as `dist`.
5. Add `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com` under the Vercel environment variables. Apply it to Production and Preview if you use both.
6. Deploy and copy the exact production frontend URL.

`client/vercel.json` includes an SPA rewrite so nested React routes work on refresh.

## Deploy the backend to Render

1. Create a new Web Service and connect the same GitHub repository.
2. Set **Root Directory** to `server`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add these environment variables in Render:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://YOUR-VERCEL-APP.vercel.app` (the exact frontend origin, no trailing slash)
   - `GROQ_API_KEY=your_real_key`
   - `GROQ_MODEL=openai/gpt-oss-120b`
   - `MONGODB_URI=your_mongodb_atlas_uri`
6. In MongoDB Atlas, create a database user, allow the Render service's network access according to your deployment requirements, and use the URI in `MONGODB_URI`.
7. After Render deploys, test `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.
8. Update `VITE_API_URL` on Vercel to the Render URL, redeploy the frontend, then update `CLIENT_URL` on Render if the production Vercel URL changed.
9. Test case creation, clue discovery, hints, final accusation, and results on the deployed site.

The app intentionally does not silently fake AI responses if a configured Groq request fails. It reports a useful error so that an invalid key, unsupported model, exhausted quota or schema mismatch can be corrected. Use the curated demo toggle to demonstrate the full gameplay without AI access.

## API overview

- `GET /api/health`
- `POST /api/cases`
- `GET /api/cases/:id`
- `POST /api/cases/:id/clues/:clueId/discover`
- `POST /api/cases/:id/hints`
- `POST /api/cases/:id/accuse`
- `GET /api/cases/:id/result`

See [`SPEC.md`](./SPEC.md) for the full request/response contract, data model, scoring rules, security requirements and acceptance tests.

## Scoring

`max(0, (correct ? base score : 0) + (unique discovered clues × 5) − (hints used × 10))`

Base score: Easy 100, Medium 150, Hard 200. Scoring and the culprit check are enforced by the server.

## Submission

Project form supplied in the brief: <https://bit.ly/ai-mystery-room-sub-form>

Before submitting, add your repository URL and deployed frontend URL to the form, and run through the full case flow on the production site. Keep `.env` files and API keys out of GitHub.
