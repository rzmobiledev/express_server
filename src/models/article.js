'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    

    static associate(models) {
      Article.belongsToMany(models.Tag, {
            through: models.ArticleTag,
            as: 'tags',
            foreignKey: 'articleId'
    });
    }
  }
  Article.init({
    userId: DataTypes.NUMBER,
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};