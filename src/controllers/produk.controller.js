const { Produk, Brand, Kategori, Ukuran, ProdukUkuran } = require('../models');
const { Op } = require('sequelize');
const path   = require('path');
const fs     = require('fs');

const includeRelasi = [
  { model: Brand,    as: 'brand',    attributes: ['id', 'nama_brand', 'logo'] },
  { model: Kategori, as: 'kategori', attributes: ['id', 'nama_kategori'] },
  {
    model: ProdukUkuran,
    as: 'stokUkuran',
    include: [{ model: Ukuran, as: 'ukuran', attributes: ['id', 'ukuran'] }],
  },
];

// GET /api/produk
const getAll = async (req, res, next) => {
  try {
    const {
      search, brand_id, kategori_id,
      page  = 1, limit = 12,
      sort  = 'createdAt', order = 'DESC',
    } = req.query;

    const where = {};
    if (search)      where.nama_produk = { [Op.like]: `%${search}%` };
    if (brand_id)    where.brand_id    = brand_id;
    if (kategori_id) where.kategori_id = kategori_id;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Produk.findAndCountAll({
      where,
      include:  includeRelasi,
      order:    [[sort, order]],
      limit:    parseInt(limit),
      offset,
      distinct: true, // mencegah duplikasi count akibat JOIN
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total:      count,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/produk/featured
// Harus didefinisikan sebelum /:id agar tidak tertimpa oleh route dinamis
const getFeatured = async (req, res, next) => {
  try {
    const data = await Produk.findAll({
      where:   { is_featured: true },
      include: includeRelasi,
      limit:   8,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/produk/:id
const getById = async (req, res, next) => {
  try {
    const data = await Produk.findByPk(req.params.id, { include: includeRelasi });
    if (!data) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// POST /api/produk
const create = async (req, res, next) => {
  try {
    const { nama_produk, brand_id, kategori_id, harga, deskripsi, is_featured, ukurans } = req.body;
    const gambar = req.file ? `/uploads/produk/${req.file.filename}` : null;

    const produk = await Produk.create({ nama_produk, brand_id, kategori_id, harga, gambar, deskripsi, is_featured });

    if (ukurans) {
      const list = typeof ukurans === 'string' ? JSON.parse(ukurans) : ukurans;
      for (const u of list) {
        if (u.ukuran_id) {
          await ProdukUkuran.create({ produk_id: produk.id, ukuran_id: u.ukuran_id, stok: u.stok || 0 });
        }
      }
    }

    const result = await Produk.findByPk(produk.id, { include: includeRelasi });
    res.status(201).json({ success: true, message: 'Produk berhasil dibuat', data: result });
  } catch (error) {
    next(error);
  }
};

// PUT /api/produk/:id
const update = async (req, res, next) => {
  try {
    const data = await Produk.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    let gambar = data.gambar;

    if (req.file) {
      if (data.gambar) {
        const oldPath = path.join(__dirname, '../../', data.gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      gambar = `/uploads/produk/${req.file.filename}`;
    }

    const { nama_produk, brand_id, kategori_id, harga, deskripsi, is_featured, ukurans } = req.body;
    await data.update({ nama_produk, brand_id, kategori_id, harga, gambar, deskripsi, is_featured });

    if (ukurans) {
      const list = typeof ukurans === 'string' ? JSON.parse(ukurans) : ukurans;
      for (const u of list) {
        if (u.ukuran_id) {
          // upsert: update jika sudah ada, insert jika belum
          await ProdukUkuran.upsert({ produk_id: data.id, ukuran_id: u.ukuran_id, stok: u.stok || 0 });
        }
      }
    }

    const result = await Produk.findByPk(data.id, { include: includeRelasi });
    res.json({ success: true, message: 'Produk diperbarui', data: result });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/produk/:id
const remove = async (req, res, next) => {
  try {
    const data = await Produk.findByPk(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    if (data.gambar) {
      const filePath = path.join(__dirname, '../../', data.gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await data.destroy();
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, getFeatured, create, update, remove };
