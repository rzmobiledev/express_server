'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'Users', 
      'role', 
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Authlevels',
          key: 'id'
        },
        allowNull: false
      }
    ),

    await queryInterface.addColumn(
      'Users',
      'active', 
      {
        type: Sequelize.BOOLEAN
      }
    ),

    await queryInterface.addColumn(
      'Users',
      'deletedAt', 
      {
        type: Sequelize.DATE
      }
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'active');
    await queryInterface.removeColumn('Users', 'deletedAt');
  }
};
