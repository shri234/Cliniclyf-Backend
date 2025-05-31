const express = require("express");
const multer = require("multer");

const { authController, userController } = require("../controllers/authController");
const validate = require("../../../middleware/validateMiddleware"); // Request validation middleware
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { storage } = require('../../../config/cloudinary.js');

const upload = multer({ storage });

const router = express.Router();

router.post("/register", 
            // validate("body", authController.register.validation), 
            authController.register.handler);
router.post("/login", validate("body", authController.login.validation), authController.login.handler);

router.put("/update", authMiddleware, validate("body", userController.updateUser.validation), userController.updateUser.handler)

router.patch("/settings-update", upload.single('site_logo'), authMiddleware, validate("body", userController.updateSetting.validation), userController.updateSetting.handler)

router.get("/", (req, res) => {
  res.json({ message: "Auth Routes Working!" });
});



module.exports = router;
