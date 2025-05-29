require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./services/user-services/routes/authRoutes");
const clinicRoutes = require("./services/user-services/routes/clinicRoutes");
const doctorRoutes = require("./services/user-services/routes/doctorRoutes");
const planRoutes = require("./services/user-services/routes/planRoutes");
const orderRoutes = require("./services/user-services/routes/orderRoutes");
const subscriptionRoutes = require("./services/user-services/routes/subscriptionRoutes");
const ratingRoutes = require("./services/user-services/routes/ratingRoutes");
const dashboardRoutes = require("./services/admin-services/routes/dashboard");
const productRoutes = require("./services/user-services/routes/productRoutes");
const settingsRoutes = require("./services/user-services/routes/settingsRoutes");

const startAndSyncDB = require("./models");

const app = express();

startAndSyncDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ['http://localhost:3000']
}));
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/product", productRoutes);
app.use("/api/settings", settingsRoutes);


const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
