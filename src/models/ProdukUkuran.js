const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProdukUkuran = sequelize.define('ProdukUkuran', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  produk_id: { type: DataTypes.INTEGER, allowNull: false },
  ukuran_id: { type: DataTypes.INTEGER, allowNull: false },
  stok:      { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'produk_ukurans' });

module.exports = ProdukUkuran;
