/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Dapatkan semua projects dengan pagination
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Jumlah item per halaman (max 50)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan title, description, atau technologies
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter project featured
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, order, featured]
 *           default: createdAt
 *         description: Field untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 *     responses:
 *       200:
 *         description: List projects berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 links:
 *                   $ref: '#/components/schemas/PaginatedLinks'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Dapatkan project berdasarkan ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Buat project baru (Protected - requires JWT)
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - descriptionEn
 *               - descriptionId
 *               - technologies
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: E-Commerce Platform
 *               descriptionEn:
 *                 type: string
 *                 example: A full-stack e-commerce platform built with MERN stack
 *               descriptionId:
 *                 type: string
 *                 example: Platform e-commerce full-stack yang dibangun dengan MERN stack
 *               technologies:
 *                 type: string
 *                 description: JSON array atau comma-separated string
 *                 example: '["React","Node.js","MongoDB","Express"]'
 *               demoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://demo.example.com
 *               githubUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://github.com/username/repo
 *               featured:
 *                 type: boolean
 *                 example: true
 *               order:
 *                 type: integer
 *                 example: 1
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, jpeg, png, webp) max 10MB
 *     responses:
 *       201:
 *         description: Project berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project (Protected - requires JWT)
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               descriptionId:
 *                 type: string
 *               technologies:
 *                 type: string
 *                 description: JSON array atau comma-separated string
 *               demoUrl:
 *                 type: string
 *                 format: uri
 *               githubUrl:
 *                 type: string
 *                 format: uri
 *               featured:
 *                 type: boolean
 *               order:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (opsional, hanya jika ingin ganti gambar)
 *     responses:
 *       200:
 *         description: Project berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Hapus project (Protected - requires JWT)
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
