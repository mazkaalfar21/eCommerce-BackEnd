'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('produks', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      nama_produk: {
        type:      Sequelize.STRING(200),
        allowNull: false,
      },
      brand_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'brands', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      kategori_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'kategoris', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      harga: {
        type:      Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      gambar: {
        type:      Sequelize.STRING(255),
        allowNull: true,
      },
      deskripsi: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      is_featured: {
        type:         Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('produks');
  },
};
