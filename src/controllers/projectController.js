const prisma = require("../config/database");
const { cloudinary } = require("../config/cloudinary");
const {
  validateProject,
  isValidUUID,
  sanitizeInput,
} = require("../utils/validation");

exports.getAllProjects = async (req, res, next) => {
  try {
    const { featured, limit } = req.query;

    const where = featured === "true" ? { featured: true } : {};

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit ? parseInt(limit) : undefined,
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi UUID
    if (!isValidUUID(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    let {
      title,
      descriptionEn,
      descriptionId,
      technologies,
      demoUrl,
      githubUrl,
      featured,
      order,
    } = req.body;

    // Sanitize inputs
    title = sanitizeInput(title);
    descriptionEn = sanitizeInput(descriptionEn);
    descriptionId = sanitizeInput(descriptionId);

    // Parse technologies jika string
    if (typeof technologies === "string") {
      try {
        technologies = JSON.parse(technologies);
      } catch (e) {
        return res.status(400).json({
          message: `Invalid technologies format, must be an array like ["Tech1", "Tech2"]`,
        });
      }
    }

    // Validasi data
    const validation = validateProject({
      title,
      descriptionEn,
      descriptionId,
      technologies,
      demoUrl,
      githubUrl,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const project = await prisma.project.create({
      data: {
        title,
        descriptionEn,
        descriptionId,
        image: req.file.path,
        technologies,
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        featured: featured === "true" || featured === true,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi UUID
    if (!isValidUUID(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    let {
      title,
      descriptionEn,
      descriptionId,
      technologies,
      demoUrl,
      githubUrl,
      featured,
      order,
    } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Sanitize inputs
    if (title) title = sanitizeInput(title);
    if (descriptionEn) descriptionEn = sanitizeInput(descriptionEn);
    if (descriptionId) descriptionId = sanitizeInput(descriptionId);

    let imageUrl = existingProject.image;

    if (req.file) {
      // Hapus gambar lama dari Cloudinary
      const publicId = existingProject.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`portfolio-projects/${publicId}`);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
      imageUrl = req.file.path;
    }

    // Parse technologies jika string
    if (technologies && typeof technologies === "string") {
      try {
        technologies = JSON.parse(technologies);
      } catch (e) {
        return res.status(400).json({ message: "Invalid technologies format" });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title || existingProject.title,
        descriptionEn: descriptionEn || existingProject.descriptionEn,
        descriptionId: descriptionId || existingProject.descriptionId,
        image: imageUrl,
        technologies: technologies || existingProject.technologies,
        demoUrl: demoUrl !== undefined ? demoUrl : existingProject.demoUrl,
        githubUrl:
          githubUrl !== undefined ? githubUrl : existingProject.githubUrl,
        featured:
          featured !== undefined
            ? featured === "true" || featured === true
            : existingProject.featured,
        order: order !== undefined ? parseInt(order) : existingProject.order,
      },
    });

    res.json({ message: "Project updated", project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi UUID
    if (!isValidUUID(id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Hapus gambar dari Cloudinary
    const publicId = project.image.split("/").pop().split(".")[0];
    try {
      await cloudinary.uploader.destroy(`portfolio-projects/${publicId}`);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};
