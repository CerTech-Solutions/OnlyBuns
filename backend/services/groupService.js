const { Group, GroupUser, User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');

class GroupService {
  async createGroup(name, adminUsername) {
    try {
      const group = await Group.create({ name, adminUsername });

      await GroupUser.create({
        groupId: group.id,
        userUsername: adminUsername
      });

      return new Result(StatusEnum.SUCCESS, 201, group);
    } catch (error) {
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }

  async addUsersToGroup(groupId, requestingUsername, users) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        return new Result(StatusEnum.FAIL, 404, null, { message: "Group not found" });
      }
  
      if (group.adminUsername !== requestingUsername) {
        return new Result(StatusEnum.FAIL, 403, null, { message: "Only admin can add users" });
      }
  
      const results = [];
  
      for (const username of users) {
        const user = await User.findByPk(username);
        if (!user) {
          results.push({ username, added: false, reason: "User not found" });
          continue;
        }
  
        const [membership, created] = await GroupUser.findOrCreate({
          where: { groupId, userUsername: username }
        });
  
        results.push({ username, added: created });
      }
  
      return new Result(StatusEnum.SUCCESS, 200, results);
    } catch (error) {
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }
  

  async removeUserFromGroup(groupId, requestingUsername, targetUsername) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        return new Result(StatusEnum.FAIL, 404, null, { message: "Group not found" });
      }

      if (group.adminUsername !== requestingUsername) {
        return new Result(StatusEnum.FAIL, 403, null, { message: "Only admin can remove users" });
      }

      const deleted = await GroupUser.destroy({
        where: { groupId, userUsername: targetUsername }
      });

      return new Result(StatusEnum.SUCCESS, 200, { removed: deleted > 0 });
    } catch (error) {
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }

  async getGroupsForUser(username) {
    try {
      const groups = await Group.findAll({
        include: {
          model: User,
          as: 'members',
          where: { username },
          attributes: [],
          through: { attributes: [] }
        }
      });

      return new Result(StatusEnum.SUCCESS, 200, groups);
    } catch (error) {
      return new Result(StatusEnum.FAIL, 500, null, { message: error.message });
    }
  }
}

module.exports = new GroupService();
