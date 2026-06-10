const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/',              verifyToken, ctrl.getAll);
router.get('/:id',           verifyToken, ctrl.getById);
router.post('/checkout',     verifyToken, ctrl.checkout);
router.post('/manual',       verifyToken, isAdmin, ctrl.createManual);
router.put('/status/:id',    verifyToken, isAdmin, ctrl.updateStatus);
router.delete('/:id',        verifyToken, isAdmin, ctrl.remove);

module.exports = router;
