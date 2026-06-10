const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Brand = sequelize.define('Brand', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_brand: { type: DataTypes.STRING(100), allowNull: false },
  logo: { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: 'brands' });

module.exports = Brand;
