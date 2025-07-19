const { Message, User, GroupUser } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { Op } = require('sequelize');

class GroupMessageService {
  async sendMessage(groupId, senderUsername, text) {
    try {

        console.log("🟡 Kreiraj poruku:", { groupId, senderUsername, text });

      const message = await Message.create({ groupId, senderUsername, text });
      return new Result(StatusEnum.SUCCESS, 201, message);
    } catch (error) {
        console.error("❌ Greska pri kreiranju poruke:", error);

      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }

  async getMessages(groupId, username) {
    try {
      console.log("🔍 Dohvatanje poruka za grupu:", groupId, "korisnik:", username);
      const groupUser = await GroupUser.findOne({
        where: { groupId, userUsername: username }
      });
  
      if (!groupUser) {
        return new Result(StatusEnum.FAIL, 404, null, { message: "User is not in the group" });
      }
  
      const joinedAt = groupUser.joinedAt;
  
      // Poslednjih 10 poruka pre ulaska
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
  
      // Sve poruke posle ulaska
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
