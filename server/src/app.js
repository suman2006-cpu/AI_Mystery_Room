import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import caseRoutes from "./routes/caseRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import { GameError } from "./services/caseService.js";
import { storageMode } from "./storage/caseRepository.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost:\d+$/.test(origin))) {
      callback(null, true);
      return;
    }
    callback(new Error("This website origin is not permitted by the API CORS configuration."));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "40kb" }));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 45,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please pause briefly and try again." } },
});
const generationLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: { code: "GENERATION_RATE_LIMITED", message: "Mystery creation is limited to five requests per minute. Please wait a moment." } },
});
app.use("/api", apiLimiter);
app.use("/api/cases", (req, res, next) => req.method === "POST" && req.path === "/" ? generationLimiter(req, res, next) : next());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-mystery-room-api",
    provider: process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "replace_me" ? "groq" : "demo",
    storage: storageMode(),
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/cases", caseRoutes);
app.use("/api/players", playerRoutes);
app.get("/", (_req, res) => res.json({ name: "AI Mystery Room API", health: "/api/health" }));
app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "The requested API route does not exist." } }));

app.use((error, _req, res, _next) => {
  if (error instanceof GameError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  if (error?.name === "ZodError") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "The submitted data did not pass validation." } });
  }
  if (error?.message?.includes("CORS")) {
    return res.status(403).json({ error: { code: "ORIGIN_NOT_ALLOWED", message: error.message } });
  }
  if (error?.code === "GROQ_NOT_CONFIGURED") {
    return res.status(503).json({ error: { code: error.code, message: "Groq is not configured. Add GROQ_API_KEY to your server environment, or select the demo mode to play a curated mystery." } });
  }
  if (error?.code === "GROQ_GENERATION_FAILED") {
    console.error("Groq generation error:", error.cause?.message || error.message);
    return res.status(502).json({ error: { code: error.code, message: "The AI couldn't compose a reliable mystery this time. Try again, or use the demo case. Check your Groq key, selected model, and usage limits if this continues." } });
  }
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "INVALID_JSON", message: "Request body must contain valid JSON." } });
  }
  if (error?.status === 429) {
    return res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again in a moment." } });
  }
  console.error("Unhandled API error:", error);
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong on the server. Please try again." } });
});

export default app;
