const express = require("express");

const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");
const { getStats, getRecentActivities, getEarningsStats, getSubscriptionStats, getDashboardStats, getReportStats } = require("../controllers/dashboard");

const router = express.Router();


router.get("/stats", authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), getStats);

router.get("/recent-activities", authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), getRecentActivities);

// router.get("/earnings-stats", authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), getEarningsStats);
router.get("/earnings-stats", getEarningsStats);

// router.get("/subscription-stats", authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), getSubscriptionStats);
router.get("/subscription-stats", getSubscriptionStats);

router.get("/dashboard-stats", authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), getDashboardStats);

router.get("/reports", authMiddleware, roleMiddleware([process.env.SUPER_ADMIN_ID]), getReportStats);

module.exports = router;
