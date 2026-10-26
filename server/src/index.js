import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT || 5000);

async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri || uri.includes("cluster.example.mongodb.net")) {
    console.warn("[storage] MONGODB_URI is not configured; cases will use in-memory storage. They will reset when the server restarts.");
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 7000 });
    console.log("[storage] Connected to MongoDB Atlas.");
  } catch (error) {
    console.error("[storage] MongoDB connection failed; continuing in in-memory mode:", error.message);
  }
}

await connectDatabase();
const server = app.listen(port, () => {
  console.log(`[server] AI Mystery Room API listening on http://localhost:${port}`);
  console.log(`[server] Provider: ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "replace_me" ? (process.env.GROQ_MODEL || "openai/gpt-oss-120b") : "demo mode (configure GROQ_API_KEY for custom mysteries)"}`);
});

async function shutdown(signal) {
  console.log(`[server] ${signal} received; shutting down gracefully.`);
  server.close(async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
