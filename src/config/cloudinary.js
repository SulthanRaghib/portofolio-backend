const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage untuk gambar (projects)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "portfolio-projects",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
  },
});

// Storage untuk PDF (certifications)
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === "application/pdf";

    return {
      folder: "portfolio-certifications",
      resource_type: isPDF ? "raw" : "image", // "raw" untuk PDF
      allowed_formats: isPDF ? ["pdf"] : ["jpg", "jpeg", "png", "webp"],
      format: isPDF ? "pdf" : undefined,
      eager: [
        { width: 600, format: "jpg", page: 1 }  // generate preview
      ]
    };
  },
});


const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB untuk gambar
});

const uploadCertification = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB untuk PDF
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPG, PNG, WebP) and PDF files are allowed"));
    }
  },
});

module.exports = {
  cloudinary,
  upload: uploadImage, // untuk projects (backward compatibility)
  uploadCertification
};