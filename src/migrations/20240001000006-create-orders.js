'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      user_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      tanggal_order: {
        type:         Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      total_harga: {
        type:      Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      status: {
        type:         Sequelize.ENUM('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'),
        defaultValue: 'pending',
      },
      alamat_pengiriman: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      catatan: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
