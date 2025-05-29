const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define(
    "Payment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        payableId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        payableType: {
            type: DataTypes.ENUM('APPOINTMENT', 'PRODUCT', 'ORDER'),
            allowNull: false,
        },
        razorpayOrderId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        razorpayPaymentId: {
            type: DataTypes.STRING,
            allowNull: true, // only after success
        },
        razorpaySignature: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'INR',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
            defaultValue: 'PENDING',
        }
    },
    {
        tableName: "payments",
        timestamps: true
    }
);


module.exports = Payment;