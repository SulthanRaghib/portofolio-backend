const prisma = require("../config/database");
const { cloudinary } = require("../config/cloudinary");
const {
    validateCertification,
    isValidUUID,
    sanitizeInput,
} = require("../utils/validation");
const {
    createPaginationResponse,
    getPaginationParams,
    calculateSkip,
} = require("../utils/pagination");

// Helper: Generate thumbnail URL dari PDF (halaman 1)
const generatePDFThumbnail = (pdfUrl, options = {}) => {
    const { width = 800, height = 1000, page = 1, quality = "auto" } = options;

    // Extract public_id dari URL Cloudinary
    const parts = pdfUrl.split("/upload/");
    if (parts.length !== 2) return pdfUrl;

    const [base, path] = parts;

    // Transformasi untuk PDF: ambil halaman pertama sebagai thumbnail
    const transformation = `w_${width},h_${height},c_fill,q_${quality},pg_${page}`;

    return `${base}/upload/${transformation}/${path}`;
};

// Helper: Generate preview URL untuk semua halaman PDF
const generatePDFPreviewUrls = (pdfUrl, totalPages = 1) => {
    const previews = [];

    for (let page = 1; page <= totalPages; page++) {
        previews.push({
            page,
            url: generatePDFThumbnail(pdfUrl, { page, width: 1200 }),
            thumbnail: generatePDFThumbnail(pdfUrl, { page, width: 400 })
        });
    }

    return previews;
};

// Helper: Detect if URL is PDF
const isPDFUrl = (url) => {
    return url && (url.endsWith('.pdf') || url.includes('.pdf?'));
};

// Helper: Get PDF metadata dari Cloudinary
const getPDFMetadata = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: "image", // PDF disimpan sebagai image di Cloudinary
            pages: true
        });

        return {
            pages: result.pages || 1,
            format: result.format,
            bytes: result.bytes,
            url: result.secure_url
        };
    } catch (error) {
        console.error("Error getting PDF metadata:", error);
        return { pages: 1 };
    }
};

// Extract public_id dari Cloudinary URL
const extractPublicId = (url) => {
    if (!url || typeof url !== "string") return null;

    const regex = /portfolio-certifications\/([^/.]+)/;
    const match = url.match(regex);
    return match ? `portfolio-certifications/${match[1]}` : null;
};

exports.getAllCertifications = async (req, res, next) => {
    try {
        const { search, sortBy, sortOrder } = req.query;
        const { page, limit } = getPaginationParams(req.query, 10, 50);

        const where = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { issuer: { contains: search, mode: "insensitive" } },
                { skills: { has: search } },
            ];
        }

        let orderBy = { issuedAt: "desc" };

        if (sortBy) {
            const validSortFields = ["title", "issuer", "issuedAt", "createdAt"];
            if (validSortFields.includes(sortBy)) {
                const direction = sortOrder === "asc" ? "asc" : "desc";
                orderBy = { [sortBy]: direction };
            }
        }

        const totalItems = await prisma.certification.count({ where });

        const certifications = await prisma.certification.findMany({
            where,
            orderBy,
            skip: calculateSkip(page, limit),
            take: limit,
        });

        // Enhance dengan thumbnail untuk PDF
        const enhancedCertifications = certifications.map(cert => {
            const isPDF = isPDFUrl(cert.image);

            return {
                ...cert,
                isPDF,
                thumbnail: isPDF
                    ? generatePDFThumbnail(cert.image, { width: 400, height: 500 })
                    : cert.image,
                previewUrl: cert.image
            };
        });

        const protocol = req.protocol;
        const host = req.get("host");
        const baseUrl = `${protocol}://${host}${req.baseUrl}${req.path}`;

        const response = createPaginationResponse({
            page,
            limit,
            totalItems,
            data: enhancedCertifications,
            baseUrl,
        });

        res.json(response);
    } catch (error) {
        next(error);
    }
};

exports.getCertificationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidUUID(id)) {
            return res.status(400).json({ message: "Invalid certification ID format" });
        }

        const certification = await prisma.certification.findUnique({ where: { id } });
        if (!certification) {
            return res.status(404).json({ message: "Certification not found" });
        }

        const isPDF = isPDFUrl(certification.image);
        let pdfMetadata = null;
        let previews = [];

        // Jika PDF, ambil metadata dan generate preview untuk semua halaman
        if (isPDF) {
            const publicId = extractPublicId(certification.image);
            if (publicId) {
                pdfMetadata = await getPDFMetadata(publicId);
                previews = generatePDFPreviewUrls(certification.image, pdfMetadata.pages);
            }
        }

        res.json({
            certification: {
                ...certification,
                isPDF,
                thumbnail: isPDF
                    ? generatePDFThumbnail(certification.image)
                    : certification.image,
                pdfMetadata,
                previews: isPDF ? previews : []
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.createCertification = async (req, res, next) => {
    try {
        let { title, issuer, issuedAt, expirationAt, credentialUrl, credentialId, skills } = req.body;

        title = sanitizeInput(title);
        issuer = sanitizeInput(issuer);
        if (credentialId) credentialId = sanitizeInput(credentialId);

        if (skills) {
            if (typeof skills === "string") {
                try {
                    skills = JSON.parse(skills);
                } catch (e) {
                    skills = skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0);
                }
            }
            if (!Array.isArray(skills)) {
                return res.status(400).json({ message: "Skills must be an array or comma-separated string" });
            }
        } else {
            skills = [];
        }

        const validation = validateCertification({ title, issuer, issuedAt, credentialUrl, credentialId, skills });
        if (!validation.isValid) {
            return res.status(400).json({ message: "Validation failed", errors: validation.errors });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image or PDF is required" });
        }

        const certification = await prisma.certification.create({
            data: {
                title,
                issuer,
                issuedAt: new Date(issuedAt),
                expirationAt: expirationAt ? new Date(expirationAt) : null,
                credentialUrl: credentialUrl || null,
                credentialId: credentialId || null,
                skills: skills,
                image: req.file.path,
            },
        });

        const isPDF = isPDFUrl(certification.image);

        res.status(201).json({
            message: "Certification created",
            certification: {
                ...certification,
                isPDF,
                thumbnail: isPDF
                    ? generatePDFThumbnail(certification.image)
                    : certification.image
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCertification = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidUUID(id)) return res.status(400).json({ message: "Invalid ID" });

        let { title, issuer, issuedAt, expirationAt, credentialUrl, credentialId, skills } = req.body;

        const existingCert = await prisma.certification.findUnique({ where: { id } });
        if (!existingCert) return res.status(404).json({ message: "Certification not found" });

        if (title) title = sanitizeInput(title);
        if (issuer) issuer = sanitizeInput(issuer);
        if (credentialId) credentialId = sanitizeInput(credentialId);

        let imageUrl = existingCert.image;
        if (req.file) {
            // Hapus file lama
            const publicId = extractPublicId(existingCert.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: "image",
                        invalidate: true
                    });
                } catch (error) {
                    console.error("Error deleting old file:", error);
                }
            }
            imageUrl = req.file.path;
        }

        if (skills !== undefined) {
            if (typeof skills === "string") {
                try {
                    skills = JSON.parse(skills);
                } catch (e) {
                    skills = skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0);
                }
            }
            if (!Array.isArray(skills)) {
                return res.status(400).json({ message: "Skills must be an array or comma-separated string" });
            }
        }

        const certification = await prisma.certification.update({
            where: { id },
            data: {
                title: title || existingCert.title,
                issuer: issuer || existingCert.issuer,
                issuedAt: issuedAt ? new Date(issuedAt) : existingCert.issuedAt,
                expirationAt: expirationAt ? new Date(expirationAt) : existingCert.expirationAt,
                credentialUrl: credentialUrl !== undefined ? credentialUrl : existingCert.credentialUrl,
                credentialId: credentialId !== undefined ? credentialId : existingCert.credentialId,
                skills: skills !== undefined ? skills : existingCert.skills,
                image: imageUrl,
            },
        });

        const isPDF = isPDFUrl(certification.image);

        res.json({
            message: "Certification updated",
            certification: {
                ...certification,
                isPDF,
                thumbnail: isPDF
                    ? generatePDFThumbnail(certification.image)
                    : certification.image
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteCertification = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidUUID(id)) return res.status(400).json({ message: "Invalid ID" });

        const cert = await prisma.certification.findUnique({ where: { id } });
        if (!cert) return res.status(404).json({ message: "Certification not found" });

        const publicId = extractPublicId(cert.image);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: "image",
                    invalidate: true
                });
            } catch (error) {
                console.error("Cloudinary delete error:", error);
            }
        }

        await prisma.certification.delete({ where: { id } });
        res.json({ message: "Certification deleted successfully" });
    } catch (error) {
        next(error);
    }
};