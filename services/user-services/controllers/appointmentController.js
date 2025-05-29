const Joi = require("joi");
const Appointment = require("../../../models/appointment");

const appointmentController = {
    createAppointment: {
        validation: Joi.object({
            patient_id: Joi.string().required(),
            doctor_id: Joi.string().required(),
            clinic_id: Joi.string().required(),
            time: Joi.string().required(),
            status: Joi.string().required(),
            payment_id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const appointment = await Appointment.create(req.body);
                res.status(201).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getAppointment: {
        handler: async (req, res) => {
            try {
                const appointment = await Appointment.find();
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getAppointmentById: {
        handler: async (req, res) => {
            try {
                const appointment = await Appointment.findById(req.params.id);
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    updateAppointment: {
        validation: Joi.object({
            patient_id: Joi.string().required(),
            doctor_id: Joi.string().required(),
            clinic_id: Joi.string().required(),
            time: Joi.string().required(),
            status: Joi.string().required(),
            payment_id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const appointment = await Appointment.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true }
                );
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    deleteAppointment: {
        handler: async (req, res) => {
            try {
                const appointment = await Appointment.findByIdAndDelete(
                    req.params.id
                );
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
}

module.exports = appointmentController;