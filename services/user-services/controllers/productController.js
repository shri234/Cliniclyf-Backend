const Joi = require("joi");
const Product = require("../../../models/product");
const Photo = require("../../../models/photo");
const Rating = require("../../../models/rating");
const User = require("../../../models/user");

const productController = {
    createProduct: {
        validation: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            photos: Joi.any().optional(),
            status: Joi.string().required(),
            category: Joi.string().required(),
            price: Joi.number().required(),
            discountType: Joi.string().required(),
            discountPercentage: Joi.string().required()
        }),

        handler: async (req, res) => {
            try {
                const { name, description, status, category, price, discountType, discountPercentage } = req.body;

                const product = await Product.create({ name, description, status, category, price: Number(price), discountType, discountPercentage });

                if (product) {
                    for (let file of req.files) {
                        await Photo.create({ photoable_id: product.id, url: file.path, name: file.originalname })
                    }
                }

                res.status(201).json({ success: true, message: "Product created successfully", data: null, error: null });
            } catch (error) {
                console.error(error.message);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    getProductById: {
        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const product = await Product.findOne({
                    where: { id }, include: [
                        {
                            model: Rating,
                            attributes: ['rating', 'review'],
                            include: [
                                {
                                    model: User,
                                    as: "givenBy",
                                    attributes: ['name', 'email'],
                                    include: [
                                        {
                                            model: Photo,
                                            attributes: ['id', 'url']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Photo,
                            attributes: ['url']
                        }
                    ]
                })

                res.status(200).json({ success: true, message: "Product fetched successfully", data: product, error: null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    getProducts: {
        handler: async (req, res) => {
            try {
                const products = await Product.findAll({
                    include: [
                        {
                            model: Photo,
                            attributes: ['id', 'url']
                        }
                    ]
                });

                res.status(200).json({ success: true, message: "Products fetched successfully", data: products, error: null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        }
    },

    updateProduct: {
        validation: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            photos: Joi.any().optional(),
            photoIds: Joi.any().optional(),
            status: Joi.string().required(),
            category: Joi.string().required(),
            price: Joi.number().required(),
            discountType: Joi.string().required(),
            discountPercentage: Joi.string().required()
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;
                let { name, description, status, photoIds, category, price, discountType, discountPercentage } = req.body;

                await Product.update({ name, description, status, category, price: Number(price), discountType, discountPercentage }, { where: { id } });

                if (!Array.isArray(photoIds)) photoIds = [photoIds];

                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const photoId = photoIds[i];

                    await Photo.update(
                        { url: file.path, name: file.originalname },
                        { where: { id: photoId, photoable_id: id } }
                    );
                }

                res.status(201).json({ success: true, message: "Product updated successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    deleteProduct: {

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                await Product.destroy({
                    where: {
                        id
                    }
                })

                res.status(201).json({ success: true, message: "Product deleted successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },
};

module.exports = productController;


