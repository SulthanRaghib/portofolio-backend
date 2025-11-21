/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */

/**
 * @swagger
 * /api/env-check:
 *   get:
 *     summary: Environment variables check (Development only)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Environment variables status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 DATABASE_URL:
 *                   type: string
 *                   example: ✅ Exists
 *                 DIRECT_URL:
 *                   type: string
 *                   example: ✅ Exists
 *                 JWT_SECRET:
 *                   type: string
 *                   example: ✅ Exists
 *                 NODE_ENV:
 *                   type: string
 *                   example: development
 *                 CLOUDINARY_CLOUD_NAME:
 *                   type: string
 *                   example: ✅ Exists
 */
