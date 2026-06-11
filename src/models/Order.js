const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  tanggal_order: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total_harga: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'),
    defaultValue: 'pending',
  },
  alamat_pengiriman: { type: DataTypes.TEXT, allowNull: true },
  catatan: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'orders' });

module.exports = Order;
//1345431.
