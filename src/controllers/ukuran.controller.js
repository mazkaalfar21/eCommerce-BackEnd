const { Ukuran } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const data = await Ukuran.findAll({ order: [['ukuran', 'ASC']] });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const data = await Ukuran.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Ukuran tidak ditemukan' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const data = await Ukuran.create({ ukuran: req.body.ukuran });
    res.status(201).json({ success: true, message: 'Ukuran berhasil dibuat', data });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const data = await Ukuran.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Ukuran tidak ditemukan' });
    await data.update({ ukuran: req.body.ukuran });
    res.json({ success: true, message: 'Ukuran diperbarui', data });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const data = await Ukuran.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Ukuran tidak ditemukan' });
    await data.destroy();
    res.json({ success: true, message: 'Ukuran berhasil dihapus' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
