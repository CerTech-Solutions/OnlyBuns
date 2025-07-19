'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // Grupni admin (jedan user)
      Group.belongsTo(models.User, {
        foreignKey: 'adminUsername',
        as: 'admin'
      });

      // Grupni članovi (many-to-many)
      Group.belongsToMany(models.User, {
        through: models.GroupUser,
        foreignKey: 'groupId',
        otherKey: 'userUsername',
        as: 'members'
      });

      // Poruke u grupi
      Group.hasMany(models.Message, {
        foreignKey: 'groupId',
        as: 'messages',
        onDelete: 'CASCADE'
      });
    }
  }
  Group.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    adminUsername: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Group',
    timestamps: false
  });
  return Group;
};
