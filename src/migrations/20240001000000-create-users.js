'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
      },
      nama: {
        type:      Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type:      Sequelize.STRING(150),
        allowNull: false,
        unique:    true,
      },
      password: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type:         Sequelize.ENUM('admin', 'customer'),
        defaultValue: 'customer',
      },
      alamat: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      telepon: {
        type:      Sequelize.STRING(20),
        allowNull: true,
      },
      avatar: {
        type:      Sequelize.STRING(255),
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
    await queryInterface.dropTable('users');
  },
};
