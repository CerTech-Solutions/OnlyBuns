const { Group, GroupUser, User } = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { getIO } = require('../utils/socket');

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
          where: { groupId, userUsername: username },
          defaults: {
            joinedAt: new Date()
          }
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

      console.log("Removing user from group:", groupId, "by", requestingUsername, "target:", targetUsername);
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

  async leaveGroup(groupId, username) {
    try {
      const groupUser = await GroupUser.findOne({ where: { groupId, userUsername: username } });
  
      if (!groupUser) {
        return new Result(StatusEnum.FAIL, 404, null, [{ message: "User is not in the group" }]);
      }
  
      const group = await Group.findByPk(groupId);
      if (group.adminUsername === username) {
        return new Result(StatusEnum.FAIL, 403, null, [{ message: "Admin cannot leave the group" }]);
      }
  
      await groupUser.destroy();
  
      return new Result(StatusEnum.OK, 200, { message: "Left the group successfully" });
    } catch (err) {
      console.error("Error in leaveGroup:", err);
      return new Result(StatusEnum.FAIL, 500, null, [{ message: "Internal error" }]);
    }
  }
  

  async getGroupMembers(groupId, requesterUsername) {
    try {
      const isMember = await GroupUser.findOne({
        where: {
          groupId,
          userUsername: requesterUsername
        }
      });

      if (!isMember) {
        return new Result(StatusEnum.FAIL, 403, null, [
          { message: 'You are not a member of this group.' }
        ]);
      }

      const members = await GroupUser.findAll({
        where: { groupId },
        attributes: ['userUsername']
      });

      const usernames = members.map(m => m.userUsername);

      return new Result(StatusEnum.SUCCESS, 200, usernames);
    } catch (err) {
      console.error("Error fetching group members:", err);
      return new Result(StatusEnum.FAIL, 500, null, [
        { message: 'Failed to fetch group members.' }
      ]);
    }
  }

  async removeUserFromGroup(groupId, requesterUsername, targetUsername) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        return new Result(StatusEnum.FAIL, 404, null, [
          { message: 'Group not found' }
        ]);
      }
  
      if (group.adminUsername !== requesterUsername) {
        return new Result(StatusEnum.FAIL, 403, null, [
          { message: 'Only the group admin can remove members.' }
        ]);
      }
  
      if (targetUsername === requesterUsername) {
        return new Result(StatusEnum.FAIL, 400, null, [
          { message: 'Admin cannot remove themselves.' }
        ]);
      }
  
      const deletedCount = await GroupUser.destroy({
        where: {
          groupId,
          userUsername: targetUsername
        }
      });
  
      if (deletedCount === 0) {
        return new Result(StatusEnum.FAIL, 404, null, [
          { message: 'User is not a member of this group.' }
        ]);
      }
  

      const io = getIO();
      io.emitToUser(targetUsername, 'forceLeaveGroup', {groupId});

      return new Result(StatusEnum.SUCCESS, 200, { removed: targetUsername });
    } catch (err) {
      console.error("Error removing user:", err);
      return new Result(StatusEnum.FAIL, 500, null, [
        { message: 'Failed to remove user.' }
      ]);
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
