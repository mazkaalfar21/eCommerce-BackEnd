'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ukurans', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      ukuran: {
        type:      Sequelize.STRING(10),
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
    await queryInterface.dropTable('ukurans');
  },
};
