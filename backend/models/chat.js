'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {

        Chat.belongsToMany(models.User, {
        through: models.ChatMember,
        foreignKey: 'chatId',
        as: 'members',
      });

      Chat.hasMany(models.Message, {
        foreignKey: 'chatId',
        as: 'messages',
      });

      Chat.belongsTo(models.User, {
        foreignKey: 'username',
        as: 'creator',
      });
    }
  }

  Chat.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['private', 'group']], 
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        len: [1, 100], 
      },
    },
    background: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
  }, {
    sequelize,
    timestamps: true,
    modelName: 'Chat',
  });

  return Chat;
};
