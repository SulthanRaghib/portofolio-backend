/**
 * @swagger
 * /api/certifications:
 *   get:
 *     summary: Dapatkan semua certifications dengan pagination
 *     tags: [Certifications]
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
 *         description: Cari berdasarkan title, issuer, atau skills
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, issuer, issuedAt, createdAt]
 *           default: issuedAt
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
 *         description: List certifications berhasil diambil
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
 *                     $ref: '#/components/schemas/Certification'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 links:
 *                   $ref: '#/components/schemas/PaginatedLinks'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/certifications/{id}:
 *   get:
 *     summary: Dapatkan certification berdasarkan ID
 *     tags: [Certifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     responses:
 *       200:
 *         description: Certification ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certification'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/certifications:
 *   post:
 *     summary: Buat certification baru (Protected - requires JWT)
 *     tags: [Certifications]
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
 *               - issuer
 *               - issuedAt
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: AWS Certified Solutions Architect
 *               issuer:
 *                 type: string
 *                 example: Amazon Web Services
 *               issuedAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-01T00:00:00.000Z
 *               expirationAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2027-01-01T00:00:00.000Z
 *               credentialUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://www.credly.com/badges/xxxxx
 *               credentialId:
 *                 type: string
 *                 example: ABC123XYZ
 *               skills:
 *                 type: string
 *                 description: JSON array atau comma-separated string
 *                 example: '["AWS","Cloud Architecture","DevOps"]'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image/PDF file (jpg, jpeg, png, webp, pdf) max 10MB
 *     responses:
 *       201:
 *         description: Certification berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certification'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/certifications/{id}:
 *   put:
 *     summary: Update certification (Protected - requires JWT)
 *     tags: [Certifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               issuer:
 *                 type: string
 *               issuedAt:
 *                 type: string
 *                 format: date-time
 *               expirationAt:
 *                 type: string
 *                 format: date-time
 *               credentialUrl:
 *                 type: string
 *                 format: uri
 *               credentialId:
 *                 type: string
 *               skills:
 *                 type: string
 *                 description: JSON array atau comma-separated string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image/PDF file (opsional, hanya jika ingin ganti)
 *     responses:
 *       200:
 *         description: Certification berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certification'
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
 * /api/certifications/{id}:
 *   delete:
 *     summary: Hapus certification (Protected - requires JWT)
 *     tags: [Certifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certification ID
 *     responses:
 *       200:
 *         description: Certification berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Certification deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
