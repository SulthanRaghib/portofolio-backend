// certificationController.js
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

// Helper: Generate thumbnail URL dari PDF (halaman tertentu, default hal 1)
const generatePDFThumbnail = (pdfUrl, options = {}) => {
    const { width = 800, height = 1000, page = 1, quality = "auto" } = options;
    const parts = pdfUrl.split("/upload/");
    if (parts.length !== 2) return pdfUrl;
    const [base, path] = parts;
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
            thumbnail: generatePDFThumbnail(pdfUrl, { page, width: 400 }),
        });
    }
    return previews;
};

// Helper: Detect if URL adalah PDF
const isPDFUrl = (url) => {
    return url && (url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf?"));
};

// Helper: Get PDF metadata dari Cloudinary
const getPDFMetadata = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: "raw",
            pages: true,
        });
        return {
            pages: result.pages || 1,
            format: result.format,
            bytes: result.bytes,
            url: result.secure_url,
        };
    } catch (error) {
        console.error("Error getting PDF metadata:", error);
        return { pages: 1, format: null, bytes: null, url: null };
    }
};

// Extract public_id dari Cloudinary URL
const extractPublicId = (url) => {
    if (!url || typeof url !== "string") return null;
    // mungkin termasuk extension .pdf
    const regex = /portfolio-certifications\/(.+?)(?:\.[^.]+)?$/;
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
                orderBy = { [sortBy]: sortOrder === "asc" ? "asc" : "desc" };
            }
        }

        const totalItems = await prisma.certification.count({ where });
        const certifications = await prisma.certification.findMany({
            where,
            orderBy,
            skip: calculateSkip(page, limit),
            take: limit,
        });

        const enhancedCertifications = certifications.map(cert => {
            const isPDF = isPDFUrl(cert.image);
            return {
                ...cert,
                isPDF,
                thumbnail: isPDF
                    ? generatePDFThumbnail(cert.image, { width: 400, height: 500 })
                    : cert.image,
                previewUrl: cert.image,
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
        let thumbnailUrl = certification.image;

        if (isPDF) {
            const publicId = extractPublicId(certification.image);
            if (publicId) {
                pdfMetadata = await getPDFMetadata(publicId);
                previews = generatePDFPreviewUrls(certification.image, pdfMetadata.pages);
                thumbnailUrl = generatePDFThumbnail(certification.image);
            }
        }

        res.json({
            certification: {
                ...certification,
                isPDF,
                thumbnail: thumbnailUrl,
                previewUrl: certification.image,
                pdfMetadata,
                previews
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
                } catch {
                    skills = skills.split(",").map(s => s.trim()).filter(Boolean);
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

        const uploaded = req.file.path; // multer-storage-cloudinary menyimpan path sebagai URL
        const isPDF = isPDFUrl(uploaded);

        // Jika PDF, kita dapat metadata dan previews
        let pdfPages = null;
        let thumbnailUrl = uploaded;
        let previewUrl = uploaded;
        let previews = [];

        if (isPDF) {
            const publicId = extractPublicId(uploaded);
            if (publicId) {
                const meta = await getPDFMetadata(publicId);
                pdfPages = meta.pages;
                thumbnailUrl = generatePDFThumbnail(uploaded, { width: 400 });
                previewUrl = uploaded;
                previews = generatePDFPreviewUrls(uploaded, pdfPages);
            }
        }

        const certification = await prisma.certification.create({
            data: {
                title,
                issuer,
                issuedAt: new Date(issuedAt),
                expirationAt: expirationAt ? new Date(expirationAt) : null,
                credentialUrl: credentialUrl || null,
                credentialId: credentialId || null,
                skills,
                image: uploaded,
                isPDF,
                pdfPages,
                thumbnail: thumbnailUrl,
                previewUrl,
                previews
            }
        });

        res.status(201).json({
            message: "Certification created",
            certification
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
        let isPDF = existingCert.isPDF;
        let pdfPages = existingCert.pdfPages;
        let thumbnailUrl = existingCert.thumbnail;
        let previewUrl = existingCert.previewUrl;
        let previews = existingCert.previews || [];

        if (req.file) {
            // Hapus file lama
            const publicIdOld = extractPublicId(existingCert.image);
            if (publicIdOld) {
                await cloudinary.uploader.destroy(publicIdOld, { resource_type: "raw", invalidate: true });
            }
            imageUrl = req.file.path;
            isPDF = isPDFUrl(imageUrl);

            if (isPDF) {
                const publicId = extractPublicId(imageUrl);
                if (publicId) {
                    const meta = await getPDFMetadata(publicId);
                    pdfPages = meta.pages;
                    thumbnailUrl = generatePDFThumbnail(imageUrl, { width: 400 });
                    previewUrl = imageUrl;
                    previews = generatePDFPreviewUrls(imageUrl, pdfPages);
                }
            } else {
                // jika bukan PDF, reset PDF related fields
                pdfPages = null;
                thumbnailUrl = imageUrl;
                previewUrl = imageUrl;
                previews = [];
            }
        }

        if (skills !== undefined) {
            if (typeof skills === "string") {
                try {
                    skills = JSON.parse(skills);
                } catch {
                    skills = skills.split(",").map(s => s.trim()).filter(Boolean);
                }
            }
            if (!Array.isArray(skills)) {
                return res.status(400).json({ message: "Skills must be an array or comma-separated string" });
            }
        }

        const updated = await prisma.certification.update({
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
                isPDF,
                pdfPages,
                thumbnail: thumbnailUrl,
                previewUrl,
                previews
            }
        });

        res.json({
            message: "Certification updated",
            certification: updated
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
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw", invalidate: true });
        }

        await prisma.certification.delete({ where: { id } });
        res.json({ message: "Certification deleted successfully" });
    } catch (error) {
        next(error);
    }
};
