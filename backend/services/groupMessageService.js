const { Message, User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');

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

  async getLast10Messages(groupId) {
    try {
      const messages = await Message.findAll({
        where: { groupId },
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [{
          model: User,
          as: 'sender',
          attributes: ['username', 'name', 'surname']
        }],
        raw: false // ← OVO JE VAŽNO
      });
  
      console.log("📦 Poruke iz baze:", messages);
  
      return new Result(StatusEnum.SUCCESS, 200, messages.reverse());
    } catch (error) {
      console.error("❌ Greška pri dohvatanju poruka:", error);
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }
  
  async getMessagesForGroup(groupId) {
    try {
      const messages = await Message.findAll({
        where: { groupId },
        order: [['createdAt', 'ASC']],
        include: [{ model: User, as: 'sender', attributes: ['username', 'name', 'surname'] }]
      });

      return new Result(StatusEnum.SUCCESS, 200, messages);
    } catch (error) {
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }
}

module.exports = new GroupMessageService();
