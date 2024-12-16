'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat',
      });

      Message.belongsTo(models.User, {
        foreignKey: 'username',
        as: 'sender',
      });

      Message.belongsTo(models.Message, {
        foreignKey: 'replyTo',
        as: 'repliedMessage',
      });

      Message.hasMany(models.Reaction, {
        foreignKey: 'messageId',
        as: 'reactions',
      });
    }
  }

  Message.init({
    text: {
      type: DataTypes.TEXT,
      allowNull: true, 
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    reactions: {
        type: DataTypes.JSONB,
        allowNull: true, 
        defaultValue: [], 
      },
    replyTo: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
  }, {
    sequelize,
    timestamps: true,
    modelName: 'Message',
  });

  return Message;
};
