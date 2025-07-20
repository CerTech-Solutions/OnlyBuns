const { Message, User, GroupUser } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { Op } = require('sequelize');

class GroupMessageService {
  async sendMessage(groupId, senderUsername, text) {
    try {


      const message = await Message.create({ groupId, senderUsername, text });
      return new Result(StatusEnum.SUCCESS, 201, message);
    } catch (error) {
        console.error("❌ Greska pri kreiranju poruke:", error);

      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }

  async getMessages(groupId, username) {
    try {
      const groupUser = await GroupUser.findOne({
        where: { groupId, userUsername: username }
      });
  
      if (!groupUser) {
        return new Result(StatusEnum.FAIL, 404, null, { message: "User is not in the group" });
      }
  
      const joinedAt = groupUser.joinedAt;
  
      
      const previousMessages = await Message.findAll({
        where: {
          groupId,
          createdAt: { [Op.lte]: joinedAt }
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [{
          model: User,
          as: 'sender',
          attributes: ['username', 'name', 'surname']
        }]
      });
  
      
      const newerMessages = await Message.findAll({
        where: {
          groupId,
          createdAt: { [Op.gt]: joinedAt }
        },
        order: [['createdAt', 'ASC']],
        include: [{
          model: User,
          as: 'sender',
          attributes: ['username', 'name', 'surname']
        }]
      });
  
      const all = [...previousMessages.reverse(), ...newerMessages];
  
      return new Result(StatusEnum.SUCCESS, 200, all);
    } catch (error) {
      console.error("❌ Greška pri dohvatanju poruka:", error);
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }
  
}

module.exports = new GroupMessageService();
