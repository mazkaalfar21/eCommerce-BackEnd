const { Brand, Produk } = require('../models');
const path = require('path');
const fs   = require('fs');

// GET /api/brand
const getAll = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({ order: [['nama_brand', 'ASC']] });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

// GET /api/brand/:id
const getById = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand tidak ditemukan' });
    }
    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

// POST /api/brand
const create = async (req, res, next) => {
  try {
    const { nama_brand } = req.body;
    const logo = req.file ? `/uploads/brand/${req.file.filename}` : null;

    const brand = await Brand.create({ nama_brand, logo });
    res.status(201).json({ success: true, message: 'Brand berhasil dibuat', data: brand });
  } catch (error) {
    next(error);
  }
};

// PUT /api/brand/:id
const update = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand tidak ditemukan' });
    }

    const { nama_brand } = req.body;
    let logo = brand.logo;

    if (req.file) {
      if (brand.logo) {
        const oldPath = path.join(__dirname, '../../', brand.logo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      logo = `/uploads/brand/${req.file.filename}`;
    }

    await brand.update({ nama_brand, logo });
    res.json({ success: true, message: 'Brand diperbarui', data: brand });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/brand/:id
const remove = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand tidak ditemukan' });
    }

    // Cegah penghapusan jika brand masih dipakai produk
    const produkCount = await Produk.count({ where: { brand_id: req.params.id } });
    if (produkCount > 0) {
      return res.status(400).json({ success: false, message: 'Brand masih digunakan oleh produk' });
    }

    if (brand.logo) {
      const filePath = path.join(__dirname, '../../', brand.logo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await brand.destroy();
    res.json({ success: true, message: 'Brand berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
