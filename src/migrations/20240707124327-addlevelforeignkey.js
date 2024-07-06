'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Users', 'Authlevel', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Authlevels',
        key: 'id'
      },
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('User', 'Authlevel', {
      type: Sequelize.INTEGER,
      references: {
        model: Authlevels,
        key: 'id'
      },
      allowNull: false
    });
  }
};
