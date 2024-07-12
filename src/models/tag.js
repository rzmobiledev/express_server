'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  
    static associate(models) {
        Tag.belongsToMany(models.Article, {
            through: models.ArticleTag,
            as: 'articles',
            foreignKey: 'tagId',
            otherKey: 'articleId',
            onDelete: 'CASCADE',
        });
    }
  }
  Tag.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};