const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ukuran = sequelize.define('Ukuran', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ukuran: { type: DataTypes.STRING(10), allowNull: false },
}, { tableName: 'ukurans' });

module.exports = Ukuran;
