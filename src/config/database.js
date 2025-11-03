// Import dari generated folder (sesuaikan dengan path generate Anda)
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

module.exports = prisma;
