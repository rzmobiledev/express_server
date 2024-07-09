'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArticleTags', {

      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Articles',
          key: 'id'
        }
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },
  {
    timestamps: false
  });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ArticleTags');
  }
};