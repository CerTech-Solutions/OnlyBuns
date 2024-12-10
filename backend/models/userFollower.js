'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserFollower extends Model {
    static associate(models) {
      UserFollower.belongsTo(models.User, {
        foreignKey: 'followerId',
        as: 'follower',
        targetKey: 'username'
      });

      UserFollower.belongsTo(models.User, {
        foreignKey: 'followingId',
        as: 'following',
        targetKey: 'username'
      });
    }
  }
  UserFollower.init({
    followerId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'username'
      }
    },
    followingId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'username'
      }
    },
    followedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'UserFollower',
  });
  return UserFollower;
};