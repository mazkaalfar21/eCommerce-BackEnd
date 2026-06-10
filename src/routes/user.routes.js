const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/',     verifyToken, isAdmin, ctrl.getAll);
router.get('/:id',  verifyToken, isAdmin, ctrl.getById);
router.post('/',    verifyToken, isAdmin, ctrl.create);
router.put('/:id',  verifyToken, isAdmin, ctrl.update);
router.delete('/:id', verifyToken, isAdmin, ctrl.remove);

module.exports = router;
