'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'group'
      });

      Message.belongsTo(models.User, {
        foreignKey: 'senderUsername',
        as: 'sender'
      });
    }
  }
  Message.init({
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderUsername: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Message',
    updatedAt: false
  });
  return Message;
};
