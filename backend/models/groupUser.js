'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupUser extends Model {
    static associate(models) {
      // nije obavezno, koristi se kao through tabela
    }
  }
  GroupUser.init({
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups',
        key: 'id'
      }
    },
    userUsername: {
      type: DataTypes.STRING,
      references: {
        model: 'Users',
        key: 'username'
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'GroupUser',
    timestamps: false
  });
  return GroupUser;
};
