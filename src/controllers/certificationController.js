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

// Helper to extract publicId and resource type from Cloudinary URL
const extractPublicIdAndResourceType = (url) => {
    if (!url || typeof url !== "string") return { publicId: null, resourceType: "image" };

    // If the URL includes the resource type segment (raw/image), prefer that
    if (url.includes("/raw/upload/")) {
        const filename = url.split("/raw/upload/").pop();
        const lastDot = filename.lastIndexOf(".");
        const publicId = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        return { publicId, resourceType: "raw" };
    }

    if (url.includes("/image/upload/")) {
        const filename = url.split("/image/upload/").pop();
        const lastDot = filename.lastIndexOf(".");
        const publicId = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        return { publicId, resourceType: "image" };
    }

    // Fallback to extension-based detection
    const filename = url.split("/").pop();
    const lastDot = filename.lastIndexOf(".");
    const ext = lastDot !== -1 ? filename.substring(lastDot + 1).toLowerCase() : "";
    const publicId = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
    const resourceType = ext === "pdf" ? "raw" : "image";
    return { publicId, resourceType };
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

        let orderBy = { issuedAt: "desc" }; // Default sort terbaru

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

        const protocol = req.protocol;
        const host = req.get("host");
        const baseUrl = `${protocol}://${host}${req.baseUrl}${req.path}`;

        const response = createPaginationResponse({
            page,
            limit,
            totalItems,
            data: certifications,
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

        res.json({ certification });
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

        // Parse skills: accept JSON array or comma-separated string
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
            return res.status(400).json({ message: "Image is required" });
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

        res.status(201).json({ message: "Certification created", certification });
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
            const { publicId, resourceType } = extractPublicIdAndResourceType(existingCert.image);
            try {
                if (publicId) {
                    await cloudinary.uploader.destroy(`portfolio-projects/${publicId}`, { resource_type: resourceType });
                }
            } catch (error) {
                console.error("Error deleting old image:", error);
            }
            imageUrl = req.file.path;
        }

        // Parse skills if provided
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

        res.json({ message: "Certification updated", certification });
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

        // Hapus gambar Cloudinary
        const { publicId, resourceType } = extractPublicIdAndResourceType(cert.image);
        try {
            if (publicId) {
                await cloudinary.uploader.destroy(`portfolio-projects/${publicId}`, { resource_type: resourceType });
            }
        } catch (error) {
            console.error("Cloudinary delete error:", error);
        }

        await prisma.certification.delete({ where: { id } });
        res.json({ message: "Certification deleted successfully" });
    } catch (error) {
        next(error);
    }
};