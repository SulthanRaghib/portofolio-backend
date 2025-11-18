const express = require("express");
const router = express.Router();
const certController = require("../controllers/certificationController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// Public routes
router.get("/", certController.getAllCertifications);
router.get("/:id", certController.getCertificationById);


// Protected routes (Perlu login)
router.post("/", auth, upload.single("image"), certController.createCertification);
router.put("/:id", auth, upload.single("image"), certController.updateCertification);
router.delete("/:id", auth, certController.deleteCertification);

module.exports = router;