const express = require("express");
const router = express.Router();
const certController = require("../controllers/certificationController");
const auth = require("../middleware/auth");
const { uploadCertification } = require("../config/cloudinary");

// Public routes
router.get("/", certController.getAllCertifications);
router.get("/:id", certController.getCertificationById);

// Protected routes - gunakan uploadCertification untuk PDF support
router.post("/", auth, uploadCertification.single("image"), certController.createCertification);
router.put("/:id", auth, uploadCertification.single("image"), certController.updateCertification);
router.delete("/:id", auth, certController.deleteCertification);

module.exports = router;