'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('produk_ukurans', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      produk_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'produks', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      ukuran_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'ukurans', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      stok: {
        type:         Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('produk_ukurans');
  },
};
