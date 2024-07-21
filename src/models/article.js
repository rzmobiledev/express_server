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
            foreignKey: 'articleId',
            otherKey: 'tagId'
      });

      Article.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Article.belongsTo(models.Category, {
        foreignKey: {
          name: 'categoryId',
          allowNull: true
        },
        as: "categories"
      });

      Article.hasMany(models.Gallery, {
        foreignKey: 'articleId'
      })
    }
  }
  Article.init({
    userId: DataTypes.NUMBER,
    categoryId: DataTypes.NUMBER,
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;};