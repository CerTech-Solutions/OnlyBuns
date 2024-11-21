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
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    likes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [] // {username: String, likedAt: Date}
    },
    likesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    comments: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [] // {username: String, content: String, commentedAt: Date}
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'Post',
  });
  return Post;
};