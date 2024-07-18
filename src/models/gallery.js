'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gallery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Gallery.belongsTo(models.User, {
        foreignKey: 'userId'
      });
      
      Gallery.belongsTo(models.Article, {
        foreignKey: 'articleId',
        targetKey: 'id'
      });
    }
  }
  Gallery.init({
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Gallery',
  });
  return Gallery;
};