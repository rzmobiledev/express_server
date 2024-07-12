'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArticleTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ArticleTag.belongsTo(models.Article, {
        foreignKey: 'articleId'
      });

      ArticleTag.belongsTo(models.Tag, {
        foreignKey: 'tagId'
      })
    }
  }
  ArticleTag.init({
    articleId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ArticleTag',
  });
  return ArticleTag;
};