const router = require('express').Router();
const ctrl = require('../controllers/export.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/produk/excel', verifyToken, isAdmin, ctrl.exportProdukExcel);
router.get('/produk/pdf', verifyToken, isAdmin, ctrl.exportProdukPDF);
router.get('/order/excel', verifyToken, isAdmin, ctrl.exportOrderExcel);
router.get('/order/pdf', verifyToken, isAdmin, ctrl.exportOrderPDF);

module.exports = router;
