/**
 * Model associations for the Cliniclyf application
 * This file defines all relationships between models
 */

// Import all models
const User = require('./user');
const Role = require('./role');
const Appointment = require('./appointment');
const Doctor = require('./doctor');
const Clinic = require('./clinic');
const Payment = require('./payment');
const Address = require('./address');
const Rating = require('./rating');
const Plan = require('./plan');
const Order = require('./order');
const Photo = require('./photo');
const Service = require('./service');
const Subscription = require('./subscription');
const Product = require('./product');

/**
 * Setup all model associations
 */
const setupAssociations = () => {
  User.hasOne(Doctor, { foreignKey: "user_id" });
  Doctor.belongsTo(User, { foreignKey: "user_id" });

  User.hasOne(Doctor, { foreignKey: "clinic_id", as: "clinic" });
  Doctor.belongsTo(User, { foreignKey: "clinic_id", as: "clinic" });

  User.hasOne(Clinic, { foreignKey: "user_id" });
  Clinic.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Address, { foreignKey: "user_id" });
  Address.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Photo, { foreignKey: "photoable_id" });
  Photo.belongsTo(User, { foreignKey: "photoable_id" });

  User.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(User, { foreignKey: "user_id" });

  User.hasMany(Subscription, { foreignKey: "subscriber_id", as: "subscribedFor" });
  Subscription.belongsTo(User, { foreignKey: "subscriber_id", as: "subscribedFor" });

  User.hasMany(Subscription, { foreignKey: "user_id", as: "subscribedBy" });
  Subscription.belongsTo(User, { foreignKey: "user_id", as: "subscribedBy" });

  User.hasMany(Rating, { foreignKey: "reviewable_id", as: "receivedBy" });
  Rating.belongsTo(User, { foreignKey: "reviewable_id", as: "receivedBy" });

  User.hasMany(Rating, { foreignKey: "user_id", as: "givenBy" });
  Rating.belongsTo(User, { foreignKey: "user_id", as: "givenBy" });

  User.hasMany(Service, { foreignKey: "user_id" });
  Service.belongsTo(User, { foreignKey: "user_id" });

  Plan.hasMany(Subscription, { foreignKey: "plan_id" });
  Subscription.belongsTo(Plan, { foreignKey: "plan_id" });

  Product.hasMany(Photo, { foreignKey: "photoable_id" });
  Photo.belongsTo(Product, { foreignKey: "photoable_id" });

  Product.hasMany(Rating, { foreignKey: "reviewable_id" });
  Rating.belongsTo(Product, { foreignKey: "reviewable_id" });
};


module.exports = setupAssociations;
