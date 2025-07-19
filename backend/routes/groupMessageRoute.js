const express = require('express');
const router = express.Router();

const jwtParser = require('../utils/jwtParser');
const GroupMessageService = require('../services/groupMessageService');

// GET /api/messages/group/:groupId/last10 - poslednjih 10 poruka za grupu
router.get('/group/:groupId/last10',
  jwtParser.extractTokenUser,
  async (req, res) => {
    const { groupId } = req.params;

    const result = await GroupMessageService.getLast10Messages(groupId);
    return res.status(result.code).json(result.status === 'fail' ? { error: result.errors.message } : result.data);
  }
);

// GET /api/messages/group/:groupId - sve poruke za grupu
router.get('/group/:groupId',
  jwtParser.extractTokenUser,
  async (req, res) => {
    const { groupId } = req.params;

    const result = await GroupMessageService.getMessagesForGroup(groupId);
    return res.status(result.code).json(result.status === 'fail' ? { error: result.errors.message } : result.data);
  }
);

// POST /api/messages/group/send - slanje poruke
router.post('/group/send',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { groupId, text } = req.body;
    const senderUsername = req.user.username;

    if (!groupId || !text) {
      return res.status(400).json({ message: 'groupId i text su obavezni' });
    }

    const result = await GroupMessageService.sendMessage(groupId, senderUsername, text);
    return res.status(result.code).json(result.status === 'fail' ? { error: result.errors.message } : result.data);
  }
);

module.exports = router;
