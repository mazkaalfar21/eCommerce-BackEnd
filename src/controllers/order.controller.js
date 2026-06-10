const { Order, OrderDetail, Produk, User, Brand, Kategori, Ukuran, ProdukUkuran, sequelize } = require('../models');

const includeDetail = {
  model: OrderDetail,
  as: 'details',
  include: [
    {
      model: Produk,
      as: 'produk',
      include: [
        {
          model: Brand,
          as: 'brand'
        }
      ]
    }
  ]
};

// GET semua order (admin) / order milik user (customer)
const getAll = async (req, res, next) => {
  try {
    const where = req.user.role === 'customer' ? { user_id: req.user.id } : {};
    const { status, page = 1, limit = 10 } = req.query;
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nama', 'email'] },
        includeDetail,
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

// GET order by ID
const getById = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'customer') where.user_id = req.user.id;

    const order = await Order.findOne({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nama', 'email', 'telepon', 'alamat'] },
        includeDetail,
      ],
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

// POST checkout - dengan Database Transaction
const checkout = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { items, alamat_pengiriman, catatan } = req.body;
    // items: [{ produk_id, qty }]

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Keranjang kosong' });
    }

    let total_harga = 0;
    const orderDetails = [];

    for (const item of items) {
      const produk = await Produk.findByPk(item.produk_id, { transaction, lock: true });
      if (!produk) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: `Produk ID ${item.produk_id} tidak ditemukan` });
      }

      if (produk.stok < item.qty) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Stok "${produk.nama_produk}" tidak cukup (sisa: ${produk.stok})`
        });
      }

      const subtotal = parseFloat(produk.harga) * item.qty;
      total_harga += subtotal;

      orderDetails.push({
        produk_id: item.produk_id,
        qty: item.qty,
        harga: produk.harga
      });

      await produk.update(
        {
          stok: produk.stok - item.qty
        },
        { transaction }
      );
    }

    // Insert Order
    const order = await Order.create({
      user_id: req.user.id,
      total_harga,
      alamat_pengiriman: alamat_pengiriman || req.user.alamat,
      catatan,
    }, { transaction });

    // Insert Order Details
    const details = orderDetails.map(d => ({ ...d, order_id: order.id }));
    await OrderDetail.bulkCreate(details, { transaction });

    await transaction.commit();

    const result = await Order.findByPk(order.id, { include: [includeDetail] });
    res.status(201).json({ success: true, message: 'Checkout berhasil', data: result });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// PUT update status order (admin)
const updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    const { status } = req.body;
    const validStatus = ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    // Jika dibatalkan, kembalikan stok
    if (status === 'dibatalkan' && order.status !== 'dibatalkan') {
      const transaction = await sequelize.transaction();
      try {
        const details = await OrderDetail.findAll({ where: { order_id: order.id }, transaction });
        for (const detail of details) {
          const produk = await Produk.findByPk(detail.produk_id, { transaction });
          if (produk) await produk.update({ stok: produk.stok + detail.qty }, { transaction });
        }
        await order.update({ status }, { transaction });
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } else {
      await order.update({ status });
    }

    res.json({ success: true, message: 'Status order diperbarui', data: order });
  } catch (error) { next(error); }
};

// DELETE order (admin)
const remove = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Jika order belum dibatalkan, kembalikan stok dulu
    if (order.status !== 'dibatalkan') {
      const details = await OrderDetail.findAll({ where: { order_id: order.id }, transaction });
      for (const detail of details) {
        const produk = await Produk.findByPk(detail.produk_id, { transaction });
        if (produk) await produk.update({ stok: produk.stok + detail.qty }, { transaction });
      }
    }

    // Hapus order details dulu, lalu order
    await OrderDetail.destroy({ where: { order_id: order.id }, transaction });
    await order.destroy({ transaction });
    await transaction.commit();

    res.json({ success: true, message: 'Order berhasil dihapus' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// POST create order manual (admin)
const createManual = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user_id, items, alamat_pengiriman, catatan, status = 'pending' } = req.body;

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Items tidak boleh kosong' });
    }

    let total_harga = 0;
    const orderDetails = [];

    for (const item of items) {
      const produk = await Produk.findByPk(item.produk_id, { transaction, lock: true });
      if (!produk) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: `Produk ID ${item.produk_id} tidak ditemukan` });
      }
      if (produk.stok < item.qty) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Stok "${produk.nama_produk}" tidak cukup (sisa: ${produk.stok})` });
      }

      const subtotal = parseFloat(produk.harga) * item.qty;
      total_harga += subtotal;
      orderDetails.push({ produk_id: item.produk_id, qty: item.qty, harga: produk.harga });
      await produk.update({ stok: produk.stok - item.qty }, { transaction });
    }

    const order = await Order.create({ user_id, total_harga, alamat_pengiriman, catatan, status }, { transaction });
    await OrderDetail.bulkCreate(orderDetails.map(d => ({ ...d, order_id: order.id })), { transaction });
    await transaction.commit();

    const result = await Order.findByPk(order.id, { include: [includeDetail] });
    res.status(201).json({ success: true, message: 'Order berhasil dibuat', data: result });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = { getAll, getById, checkout, updateStatus, remove, createManual };
