const Joi = require("joi");

const User = require("../../../models/user");
const Doctor = require("../../../models/doctor");
const Photo = require("../../../models/photo");
const Address = require("../../../models/address");
const Rating = require("../../../models/rating");
const Order = require("../../../models/order");
const Subscription = require("../../../models/subscription");
const { where, Op } = require("sequelize");

const doctorController = {
    createDoctor: {
        validation: Joi.object({
            userId: Joi.string().required(),
            specialization: Joi.string().required(),
            age: Joi.string().required(),
            gender: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            about: Joi.string().required(),
            appointmentFee: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const { userId, specialization, age, gender, city, state, about, appointmentFee } = req.body;

                const doctorExists = await Doctor.findOne({ where: { user_id: userId } });
                if (doctorExists) return res.status(400).json({ success: false, message: "Doctor already exists", data: null, error: "Doctor already exists" });

                const doctor = await Doctor.create({ user_id: userId, specialization, age, gender, about, appointmentFee });

                if (doctor) {
                    await Address.create({ user_id: userId, city, state });

                    if (req.file) {
                        await Photo.create({ photoable_id: userId, url: req.file.path, name: req.file.originalname });
                    }
                }

                return res.status(201).json({ success: true, message: "Doctor created successfully", doctor });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get all doctors
    getDoctors: {
        handler: async (req, res) => {
            const query = {};
            if (req.query.search) {
                query.name = { [Op.iRegexp]: req.query.search };
            }

            try {
                const doctors = await Doctor.findAll({
                    include: [
                        {
                            model: User,
                            where: query,
                            include: [
                                {
                                    model: Address,
                                    attributes: ['city', 'state'],
                                    required: false
                                },
                                {
                                    model: Photo,
                                    attributes: ['url'],
                                    required: false
                                },
                                {
                                    model: Rating,
                                    as: "receivedBy",
                                    required: false
                                }
                            ],

                        },
                        {
                            model: User,
                            as: 'clinic', // alias matches the association
                            attributes: ['id', 'name', 'email'], // choose what clinic data you want
                            required: false
                        }
                    ]
                });

                return res.status(200).json({ success: true, message: "Doctors fetched successfully", data: doctors });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get assigned doctors
    getAssignedDoctors: {
        handler: async (req, res) => {
            const id = req.params.id;

            try {
                const doctors = await Doctor.findAll({
                    where: { clinic_id: id },
                    attributes: ['id', 'specialization'],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name']
                        }
                    ]
                });

                return res.status(200).json({ success: true, message: "Doctors fetched successfully", data: doctors });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    assignDoctor: {

        handler: async (req, res) => {
            try {
                const { doctorId, clinicId } = req.query;

                const doctor = await Doctor.findOne({ where: { user_id: doctorId } });
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await Doctor.update({ clinic_id: clinicId }, {
                    where: {
                        user_id: doctorId
                    }
                });

                return res.status(200).json({ success: true, message: "Doctor Assigned successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    dischargeDoctor: {

        handler: async (req, res) => {
            try {
                const { doctorId } = req.query;

                const doctor = await Doctor.findOne({ where: { user_id: doctorId } });
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await Doctor.update({ clinic_id: null }, {
                    where: {
                        user_id: doctorId
                    }
                });

                return res.status(200).json({ success: true, message: "Doctor Discharged successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    // Get a specific doctor by ID
    getDoctorById: {
        validation: Joi.object({
            id: Joi.string().uuid().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const doctor = await Doctor.findByPk(id, {
                    include: [
                        {
                            model: Address,
                            as: 'addresses',
                            attributes: ['street', 'city', 'state'],
                            where: { addressableId: id }
                        },
                        {
                            model: Photo,
                            as: "photos",
                            attributes: ['url'],
                            where: { photoableId: id }
                        },
                        {
                            model: Rating,
                            as: "ratings",
                            attributes: ['rating', 'review'],
                            where: { reviewableId: id },
                            required: false
                        }
                    ]
                });

                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                return res.status(200).json({ doctor });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Update a doctor  
    updateDoctor: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            photo: Joi.string().optional(),
            specialization: Joi.string().required(),
            age: Joi.string().required(),
            gender: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            about: Joi.string().required(),
            appointmentFee: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const { user_id, specialization, age, gender, city, state, about, appointmentFee } = req.body;

                const doctor = await Doctor.findOne({ where: { user_id } });
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await Doctor.update({ specialization, age, gender, about, appointmentFee }, {
                    where: {
                        user_id
                    }
                });

                await Address.update({ city, state }, {
                    where: {
                        user_id
                    }
                });

                if (req.file) {
                    await Photo.update({ url: req.file.path, name: req.file.originalname }, {
                        where: {
                            photoable_id: user_id
                        }
                    });
                }

                return res.status(200).json({ success: true, message: "Doctor updated successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    // Delete a doctor    
    deleteDoctor: {
        validation: Joi.object({
            id: Joi.string().uuid().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const doctor = await Doctor.findByPk(id);
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await doctor.destroy();

                return res.status(200).json({ message: "Doctor deleted successfully" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
};

module.exports = doctorController;