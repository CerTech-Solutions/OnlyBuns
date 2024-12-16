'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMember extends Model {
    static associate(models) {
      ChatMember.belongsTo(models.User, {
        foreignKey: 'username',
        as: 'user',
      });

      ChatMember.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat',
      });
    }
  }

  ChatMember.init({
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    timestamps: false,
    modelName: 'ChatMember',
  });

  return ChatMember;
};
