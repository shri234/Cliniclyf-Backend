const Joi = require("joi");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../../../models/order");
const Plan = require("../../../models/plan");
const Payment = require("../../../models/payment");

require("dotenv").config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const orderController = {
    createOrder: {
        validation: Joi.object({
            type: Joi.string().required(),
            planType: Joi.string().optional(),
            isAdmin: Joi.boolean().optional()
        }),

        handler: async (req, res) => {
            try {
                const { type, planType, isAdmin } = req.body;

                const planInstance = await Plan.findOne({ where: { userType: type, planType } });
                if (!planInstance) return res.status(404).json({ success: false, message: "Plan not found" });

                const plan = planInstance?.get({ plain: true });

                let razorpayOrder;
                if (planType === "PRO" && !isAdmin) {
                    razorpayOrder = razorpay.orders.create({
                        amount: plan.price * 100,
                        currency: plan.currency,
                        receipt: 'receipt_' + Math.random().toString(36).substring(),
                        payment_capture: 1
                    });
                }

                let order;
                if (razorpayOrder) {
                    order = await Order.create({ razorpay_order_id: razorpayOrder.id, user_id: req.user.id, orderableType: type, orderableId: plan.id, amount: plan.price });
                } else {
                    order = await Order.create({ user_id: req.user.id, orderableType: type, orderableId: plan.id, amount: plan.price, status: "PAID" });
                }

                res.status(201).json({ success: true, message: "Order created successfully", data: order });
            } catch (error) {
                console.log(error)
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    verifyOrder: {
        validation: Joi.object({
            razorpay_payment_id: Joi.string().required(),
            razorpay_order_id: Joi.string().required(),
            razorpay_signature: Joi.string().required(),
            payableId: Joi.string().uuid().required(),
            planType: Joi.string().required(),
            type: Joi.string().required()
        }),
        handler: async (req, res) => {
            try {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payableId, planType, type } = req.body;

                const planInstance = await Plan.findOne({ where: { userType: type, planType } });
                if (!planInstance) return res.status(404).json({ success: false, message: "Plan not found" });

                const plan = planInstance?.get({ plain: true });

                const generatedSignature = crypto
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                    .digest("hex");

                if (generatedSignature === razorpay_signature) {
                    const payment = await Payment.create({
                        payableId,
                        payableType: "ORDER",
                        razorpayOrderId: razorpay_order_id,
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
                        amount: plan.price,
                        currency: plan.currency,
                        status: 'PAID',
                    });

                    await Order.update({ status: "PAID" }, {
                        where: {
                            id: payableId
                        }
                    })

                    res.status(200).json({
                        success: true,
                        message: 'Payment verified successfully',
                        data: payment._id,
                        error: null,
                    });
                } else {
                    await Order.update({ status: 'FAILED' }, {
                        where: {
                            id: payableId
                        }
                    });

                    res.status(400).json({
                        success: false,
                        message: 'Payment verification failed',
                        data: null,
                        error: 'Invalid signature',
                    });
                }
            } catch (error) {
                console.error('Verify payment error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to verify payment',
                    data: null,
                    error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error',
                });
            }
        }
    },
    getOrders: {
        handler: async (req, res) => {
            try {
                const orders = await Order.find();
                res.status(200).json(orders);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getOrderById: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const order = await Order.findById(req.params.id);
                res.status(200).json(order);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    updateOrder: {
        validation: Joi.object({
            orderableType: Joi.string().required(),
            orderableId: Joi.string().required(),
            amount: Joi.number().required(),
            status: Joi.string().required(),
            paymentId: Joi.string().required(),
            paymentMethod: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const order = await Order.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true }
                );
                res.status(200).json(order);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    
    deleteOrder: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const order = await Order.findByIdAndDelete(req.params.id);
                res.status(200).json(order);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
}

module.exports = orderController;