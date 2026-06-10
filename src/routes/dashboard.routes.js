const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/summary', verifyToken, isAdmin, ctrl.getSummary);
router.get('/chart', verifyToken, isAdmin, ctrl.getChart);

module.exports = router;
