const express = require('express');

const { authMiddleware } = require('../../../middleware/authMiddleware');
const { getSettings, upsertSetting } = require('../controllers/settingsController');

const router = express.Router();

router.post('/', authMiddleware, upsertSetting.handler);
router.get('/', authMiddleware, getSettings.handler);

module.exports = router;