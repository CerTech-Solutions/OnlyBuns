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
      references: {
        model: 'Users',
        key: 'username'
      }
    },
    followingId: {
      type: DataTypes.STRING,
      references: {
        model: 'Users',
        key: 'username'
      }
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'UserFollower',
  });
  return UserFollower;
};