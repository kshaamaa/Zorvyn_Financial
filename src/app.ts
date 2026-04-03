import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { swaggerSpec } from "./config/swagger";
import { apiRateLimiter, errorHandler, notFoundHandler } from "./middleware";
import routes from "./routes";

const app = express();

// ─── Security Middleware ────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ─────────────────────────────────────
app.use(apiRateLimiter);

// ─── Request Parsing ───────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───────────────────────────────────────────
if (config.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

// ─── API Documentation ─────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Finance API Documentation",
  })
);

// ─── Health Check ──────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Finance Data Processing API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API Routes ────────────────────────────────────────
app.use("/api", routes);

// ─── 404 Handler ───────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────
app.use(errorHandler);

export default app;
