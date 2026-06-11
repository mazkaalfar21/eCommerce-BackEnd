'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_details', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      order_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'orders', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      produk_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'produks', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      qty: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 1,
      },
      harga: {
        type:      Sequelize.DECIMAL(12, 2),
        allowNull: false,
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
    await queryInterface.dropTable('order_details');
  },
};
