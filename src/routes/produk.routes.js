const router = require('express').Router();
const ctrl = require('../controllers/produk.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { uploadProduk } = require('../middlewares/upload.middleware');

router.get('/', ctrl.getAll);
router.get('/featured', ctrl.getFeatured);
router.get('/:id', ctrl.getById);
router.post('/', verifyToken, isAdmin, uploadProduk, ctrl.create);
router.put('/:id', verifyToken, isAdmin, uploadProduk, ctrl.update);
router.delete('/:id', verifyToken, isAdmin, ctrl.remove);

module.exports = router;
