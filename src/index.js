require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
});
app.use("/api", limiter);

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

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
