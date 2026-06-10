const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Produk = sequelize.define('Produk', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_produk: { type: DataTypes.STRING(200), allowNull: false },
  brand_id:    { type: DataTypes.INTEGER, allowNull: false },
  kategori_id: { type: DataTypes.INTEGER, allowNull: false },
  harga:       { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  gambar:      { type: DataTypes.STRING(255), allowNull: true },
  deskripsi:   { type: DataTypes.TEXT, allowNull: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'produks' });

module.exports = Produk;
