require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const errorHandler = require("./middleware/errorHandler");

// Swagger imports
const { swaggerUi, swaggerSpec } = require("../swagger/swagger");
const { basicAuth, docsRateLimiter, getSwaggerUiOptions } = require("../swagger/protectDocs");

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow Swagger UI resources
}));
app.use(cors());
// Increase body parser limits to allow larger JSON/payloads when appropriate.
// Note: Vercel serverless functions have a hard request-body size limit —
// large file uploads should be sent directly to Cloudinary/S3 from the client.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
});
app.use("/api", limiter);

// Swagger Documentation Route
// Protected dengan Basic Auth di production + rate limiter
app.use(
  "/api-docs",
  docsRateLimiter,
  basicAuth,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, getSwaggerUiOptions())
);

// Swagger JSON endpoint (untuk client tools)
app.get("/api-docs.json", docsRateLimiter, basicAuth, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Testing environment variables
app.get("/api/env-check", (req, res) => {
  res.json({
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Exists" : "❌ Missing",
    DIRECT_URL: process.env.DIRECT_URL ? "✅ Exists" : "❌ Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ Exists" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
      ? "✅ Exists"
      : "❌ Missing",
  });
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certifications", certificationRoutes)

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
