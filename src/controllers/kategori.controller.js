const { Kategori } = require('../models');

// GET /api/kategori
const getAll = async (req, res, next) => {
  try {
    const data = await Kategori.findAll({ order: [['nama_kategori', 'ASC']] });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/kategori/:id
const getById = async (req, res, next) => {
  try {
    const data = await Kategori.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/kategori
const create = async (req, res, next) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const data = await Kategori.create({ nama_kategori, deskripsi });
    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data });
  } catch (error) {
    next(error);
  }
};

// PUT /api/kategori/:id
const update = async (req, res, next) => {
  try {
    const data = await Kategori.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    await data.update(req.body);
    res.json({ success: true, message: 'Kategori diperbarui', data });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/kategori/:id
const remove = async (req, res, next) => {
  try {
    const data = await Kategori.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    await data.destroy();
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
