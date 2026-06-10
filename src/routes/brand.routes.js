const router = require('express').Router();
const ctrl = require('../controllers/brand.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { uploadBrand } = require('../middlewares/upload.middleware');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyToken, isAdmin, uploadBrand, ctrl.create);
router.put('/:id', verifyToken, isAdmin, uploadBrand, ctrl.update);
router.delete('/:id', verifyToken, isAdmin, ctrl.remove);

module.exports = router;
