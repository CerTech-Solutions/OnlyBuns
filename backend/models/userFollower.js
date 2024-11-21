'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserFollower extends Model {
    static associate(models) {
      // define association here if needed
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