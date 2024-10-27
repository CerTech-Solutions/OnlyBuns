'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, {
        foreignKey: 'username',
        as: 'user'
      });
    }
  }
  Post.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      foreignKey: true,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    sequelize,
    timestamps: false,
    modelName: 'Post',
  });
  return Post;
};