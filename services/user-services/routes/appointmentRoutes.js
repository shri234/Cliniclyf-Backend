const express = require("express");

const { createAppointment, getAppointment, getAppointmentById, updateAppointment, deleteAppointment } = require("../controllers/appointmentController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

// Create a new appointment
router.post("/create", validate("body", createAppointment.validation), authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID, process.env.PATIENT_ID]), createAppointment.handler);

module.exports = router;