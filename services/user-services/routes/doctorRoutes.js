const express = require("express");
const multer = require("multer");

const { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, getAssignedDoctors, assignDoctor, dischargeDoctor } = require("../controllers/doctorController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");
const { storage } = require('../../../config/cloudinary.js');

const upload = multer({ storage });

const router = express.Router();

// Create a new doctor
router.post("/create", upload.single('photo'), validate("body", createDoctor.validation), authMiddleware, createDoctor.handler);

// Get all doctors
router.get("/get", getDoctors.handler);

// Get assigned doctors
router.get("/get-assign/:id", getAssignedDoctors.handler);

// assigned doctors
router.patch("/assign", assignDoctor.handler);

// discharge doctors
router.patch("/discharge", dischargeDoctor.handler);

// Get a specific doctor by ID
router.get("/:id", validate("params", getDoctorById.validation), getDoctorById.handler);

// Update a doctor
router.put("/update", upload.single("photo"), validate("body", updateDoctor.validation), authMiddleware, updateDoctor.handler);

// Delete a doctor
router.delete("/delete/:id", validate("params", deleteDoctor.validation), authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), deleteDoctor.handler);

module.exports = router;

