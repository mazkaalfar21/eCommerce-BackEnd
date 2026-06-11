const { User, Produk, Order, OrderDetail } = require('../models');
const { Op, fn, col } = require('sequelize');

// GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
  try {
    const [totalProduk, totalUser, totalOrder, pendapatan] = await Promise.all([
      Produk.count(),
      User.count(),
      Order.count(),
      Order.sum('total_harga', { where: { status: 'selesai' } }),
    ]);

    const orderByStatus = await Order.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'total'],
      ],
      group: ['status'],
    });

    res.json({
      success: true,
      data: {
        totalProduk,
        totalUser,
        totalOrder,
        totalPendapatan: pendapatan || 0,
        orderByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/chart
const getChart = async (req, res, next) => {
  try {
    // Penjualan per bulan selama 12 bulan terakhir
    const penjualanBulanan = await Order.findAll({
      attributes: [
        [fn('MONTH', col('tanggal_order')), 'bulan'],
        [fn('YEAR',  col('tanggal_order')), 'tahun'],
        [fn('SUM',   col('total_harga')),   'total'],
        [fn('COUNT', col('id')),            'jumlah_order'],
      ],
      where: {
        status: { [Op.in]: ['selesai', 'dikirim'] },
        tanggal_order: {
          [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
      group: [fn('YEAR', col('tanggal_order')), fn('MONTH', col('tanggal_order'))],
      order: [
        [fn('YEAR',  col('tanggal_order')), 'ASC'],
        [fn('MONTH', col('tanggal_order')), 'ASC'],
      ],
    });

    // Top 5 produk terlaris berdasarkan total qty terjual
    const produkTerlaris = await OrderDetail.findAll({
      attributes: [
        'produk_id',
        [fn('SUM', col('qty')), 'total_terjual'],
      ],
      include: [{ association: 'produk', attributes: ['nama_produk', 'gambar', 'harga'] }],
      group: ['produk_id', 'produk.id', 'produk.nama_produk', 'produk.gambar', 'produk.harga'],
      order: [[fn('SUM', col('qty')), 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: { penjualanBulanan, produkTerlaris },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getChart };
