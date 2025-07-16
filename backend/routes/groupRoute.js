const express = require('express');
const router = express.Router();
const jwtParser = require('../utils/jwtParser');
const GroupService = require('../services/groupService');

router.post('/create',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (req.user == null) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    const  name  = req.body.name;
    if (!name) {
      return res.status(400).json({ errors: [{ message: 'Group name is required' }] });
    }

    const users = req.body.users || [];
    const result = await GroupService.createGroup(name, req.user.username);  
    console.log('Group creation result:', result);
    const addedUsers = await GroupService.addUsersToGroup(result.data.id, req.user.username, users);

    console.log('Add users result:', addedUsers);
    return res.status(result.code).json(result.status === 'FAIL' ? { errors: result.errors } : result.data);
  }
);

router.post('/:id/addUser',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (req.user == null) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    const { targetUsername } = req.body;
    const groupId = req.params.id;

    const result = await GroupService.addUserToGroup(groupId, req.user.username, targetUsername);
    return res.status(result.code).json(result.status === 'FAIL' ? { errors: result.errors } : result.data);
  }
);

router.delete('/:id/removeUser',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (req.user == null) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    const { targetUsername } = req.body;
    const groupId = req.params.id;

    const result = await GroupService.removeUserFromGroup(groupId, req.user.username, targetUsername);
    return res.status(result.code).json(result.status === 'FAIL' ? { errors: result.errors } : result.data);
  }
);

router.get('/my-groups',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (req.user == null) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    const result = await GroupService.getGroupsForUser(req.user.username);
    return res.status(result.code).json(result.status === 'FAIL' ? { errors: result.errors } : result.data);
  }
);

module.exports = router;
