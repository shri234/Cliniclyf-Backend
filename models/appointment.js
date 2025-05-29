const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Appointment = sequelize.define(
    "Appointment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        patient_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        doctor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users', // Refers to `users` table
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        clinic_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users', // Refers to `users` table
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("scheduled", "cancelled", "completed"),
            allowNull: false,
            defaultValue: "scheduled",
        }
    },
    {
        tableName: "appointments",
        timestamps: true,
    }
);

module.exports = Appointment;
