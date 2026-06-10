const { User, Order } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const where = {};
    if (search) where[Op.or] = [
      { nama: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
    if (role) where.role = role;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { nama, email, password, role, alamat, telepon } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

    const user = await User.create({ nama, email, password, role, alamat, telepon });
    res.status(201).json({ success: true, message: 'User berhasil dibuat', data: user });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const { nama, email, role, alamat, telepon, password } = req.body;

    // Cek email duplicate (kecuali milik sendiri)
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Email sudah digunakan' });
    }

    const updateData = { nama, email, role, alamat, telepon };
    // Hanya update password jika diisi
    if (password && password.trim() !== '') updateData.password = password;

    await user.update(updateData);
    res.json({ success: true, message: 'User diperbarui', data: user });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    // Jangan hapus diri sendiri
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
    }

    // Cek apakah user punya order
    const orderCount = await Order.count({ where: { user_id: req.params.id } });
    if (orderCount > 0) {
      return res.status(400).json({ success: false, message: `User memiliki ${orderCount} order, tidak bisa dihapus` });
    }

    await user.destroy();
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
