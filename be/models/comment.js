'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comment.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      foreignKey: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      foreignKey: true,
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Comment',
    timestamps: false,
  });
  return Comment;
};