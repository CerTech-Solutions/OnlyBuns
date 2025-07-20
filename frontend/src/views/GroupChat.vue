<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="3" class="pa-0" style="overflow-y: auto; border-right: 1px solid #e0e0e0;">
        <v-toolbar flat dense class="px-4 py-2">
          <v-toolbar-title class="text-h6">Chats</v-toolbar-title>
          <v-spacer />
          <v-btn icon color="primary" @click="dialog = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-toolbar>

        <v-list nav dense>
          <v-list-item v-for="group in groups" :key="group.id" :active="group.id === selectedGroupId"
            @click="selectGroup(group)" rounded>
            <v-list-item-title class="font-weight-medium">{{ group.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col
  cols="9"
  class="pa-0 d-flex flex-column"
  style="height: calc(100vh - 64px);"
>        <div v-if="selectedGroupId"
  class="d-flex flex-column"
  style="height: 100%; overflow: hidden;">
          <v-toolbar flat color="grey lighten-4">
            <v-toolbar-title class="text-h6">{{ currentGroupName }}</v-toolbar-title>
            <v-spacer />
            <v-menu v-model="menu" location="bottom right">
              <template #activator="{ props }">
                <v-btn icon v-bind="props" color="grey-darken-3" class="ma-1">
  <v-icon>mdi-dots-vertical</v-icon>
</v-btn>
              </template>

              <v-list>
                <v-list-item v-if="store.username !== currentGroupAdmin" @click="exitGroup">
                  <v-list-item-title>Exit Group</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="store.username === currentGroupAdmin" @click="showAdminSettings = true">
                  <v-list-item-title>Admin Settings</v-list-item-title>
                </v-list-item>
              </v-list>

            </v-menu>

          </v-toolbar>

          <div class="messages" ref="chatMessages">
            <v-row v-for="msg in messages" :key="msg.id" :justify="msg.senderUsername === username ? 'end' : 'start'"
              class="mb-1">
              <v-col cols="auto" class="d-flex">
                <v-card :color="msg.senderUsername === username ? 'primary lighten-5' : 'grey lighten-3'" class="pa-3"
                  style="max-width: 320px; border-radius: 16px; word-wrap: break-word; animation: fadeIn 0.3s ease;">
                  <div class="text-caption text-grey-darken-1 mb-1">
                    {{ msg.sender?.name || msg.senderUsername }} {{ msg.sender?.surname || '' }}
                  </div>
                  <div class="text-body-1">{{ msg.text }}</div>
                  <div class="text-caption text-grey-darken-1 mt-1 text-right">
                    {{ formatTime(msg.createdAt) }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div class="chat-input pa-3 d-flex" style="border-top: 1px solid #e0e0e0;">
            <v-text-field v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..."
              variant="solo" density="comfortable" hide-details class="flex-grow-1" />
            <v-btn @click="sendMessage" icon color="primary" class="ml-2">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </div>
        </div>

        <div v-else class="text-center pa-10 grey--text">
          <v-icon size="64">mdi-chat</v-icon>
          <p>Select a group from the left to start chatting</p>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">Create Group</v-card-title>
        <v-card-text>
          <v-text-field v-model="newGroupName" label="Group name" outlined dense class="mb-4" />
          <v-text-field v-model="searchUser" label="Search users" @input="filterUsers" outlined dense />

          <v-chip-group column class="my-2">
            <v-chip v-for="user in selectedUsers" :key="user" closable @click:close="removeUser(user)"
              color="blue lighten-3" class="ma-1">
              {{ user }}
            </v-chip>
          </v-chip-group>

          <div class="user-list-wrap">
            <div v-for="user in filteredUsers" :key="user.username" class="user-tile">
              <div class="username">{{ user.username }}</div>
              <v-btn icon @click.stop="addUser(user)" :disabled="selectedUsers.includes(user.username)">
                <v-icon>mdi-account-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="resetDialog">Cancel</v-btn>
          <v-btn color="primary" @click="createGroup">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAdminSettings" max-width="600">
      <v-card>
        <v-card-title>
          Admin Settings
          <v-spacer />
          <v-btn color="primary" @click="openAddMembersDialog" size="small">
            <v-icon left>mdi-account-plus</v-icon>
            Add Members
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-list dense>
            <v-list-item v-for="user in currentGroupMembers" :key="user" class="py-1" style="min-height: 32px;">
              <div class="d-flex align-center justify-space-between w-100">
                <span style="font-size: 14px;">{{ user }}</span>
                <v-btn icon size="x-small" color="error" @click="openRemoveConfirm(user)"
                  :disabled="user === currentGroupAdmin" class="ml-2">
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </div>
            </v-list-item>
          </v-list>

        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showAdminSettings = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmRemoveDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Removal</v-card-title>
        <v-card-text>Are you sure you want to remove <strong>{{ userToRemove }}</strong> from this group?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="confirmRemoveDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmRemove">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddMembersDialog" max-width="600px">
      <v-card>
        <v-card-title>Add Members</v-card-title>
        <v-card-text>
          <v-text-field v-model="searchUser" label="Search users" @input="filterUsers" outlined dense />

          <v-chip-group column class="my-2">
            <v-chip v-for="user in selectedUsers" :key="user" closable @click:close="removeUser(user)"
              color="blue lighten-3" class="ma-1">
              {{ user }}
            </v-chip>
          </v-chip-group>

          <div class="user-list-wrap">
            <div v-for="user in filteredUsers" :key="user.username" class="user-tile">
              <div class="username">{{ user.username }}</div>
              <v-btn icon @click.stop="addUser(user)" :disabled="selectedUsers.includes(user.username)">
                <v-icon>mdi-account-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeAddMembersDialog">Cancel</v-btn>
          <v-btn color="primary" @click="confirmAddMembers">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { io } from "socket.io-client";
import axiosInstance from "@/utils/axiosInstance";
const socket = io("http://localhost:3000"); 
import { store } from '@/utils/store';

export default {
  computed: {
    store() {
      return store;
    }
  },
  data() {
    return {
      username: store.username,
      currentGroupAdmin: "",
      groups: [],
      selectedGroupId: null,
      currentGroupName: "",
      messages: [],
      newMessage: "",
      dialog: false,
      newGroupName: "",
      searchUser: "",
      filteredUsers: [],
      selectedUsers: [],
      allUsers: [],
      showAddMembersDialog: false,
      showAdminSettings: false,
      currentGroupMembers: [],
      confirmRemoveDialog: false,
      userToRemove: null,
      menu: false,
    };
  },
  mounted() {
    this.fetchGroups();
    this.fetchAllUsers();
    if (this.username) {
      socket.emit("register", this.username );
    } else {
      console.error("Username is not set.");
    }

  },
  beforeUnmount() {
  if (this.selectedGroupId && this.username) {
    socket.emit("leaveGroup", {
      groupId: this.selectedGroupId,
      username: this.username,
    });
  }
},
  methods: {
    async fetchGroups() {
      axiosInstance.get("/group/my-groups", { withCredentials: true })
        .then(response => {
          this.groups = response.data;
          if (this.groups.length > 0) {
            this.selectedGroupId = this.groups[0].id;
            socket.emit("joinGroup", { groupId: this.selectedGroupId, username: this.username });
          }
        })
        .catch(error => {
          console.error("Error fetching groups:", error);
        });
    },
    async exitGroup() {
      if (!this.selectedGroupId) return;

      try {
        await axiosInstance.post(`/group/${this.selectedGroupId}/leave`, {}, { withCredentials: true });

        alert("You have left the group.");

        this.groups = this.groups.filter(group => group.id !== this.selectedGroupId);

        this.selectedGroupId = null;
        this.currentGroupName = "";
        this.messages = [];
        this.currentGroupMembers = [];

      } catch (err) {
        console.error("Failed to leave group:", err);
        alert("Failed to leave group.");
      }
    },
    async fetchAllUsers() {
      axiosInstance.get("/user/chatfollowing", { withCredentials: true })
        .then(response => {
          this.allUsers = response.data;
          this.filteredUsers = this.allUsers.filter(user => user.username !== this.username);
        })
        .catch(error => {
          console.error("Error fetching users:", error);
        });
    },
    async removeMember(username) {
      try {
        await axiosInstance.post(`/group/${this.selectedGroupId}/remove-member`, { username }, { withCredentials: true });
        this.currentGroupMembers = this.currentGroupMembers.filter(u => u.username !== username);
      } catch (err) {
        console.error("Failed to remove member:", err);
      }
    },
    selectGroup(group) {
      this.selectedGroupId = group.id;
      this.fetchGroupMembers(group.id);
      this.currentGroupName = group.name;
      this.currentGroupAdmin = group.adminUsername;
      this.messages = [];
      socket.emit("joinGroup", { groupId: group.id, username: this.username });
    },
    async fetchGroupMembers(groupId) {
      try {
        const res = await axiosInstance.get(`/group/${groupId}/members`, { withCredentials: true });
        this.currentGroupMembers = res.data;
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    },
    sendMessage() {
      const text = this.newMessage.trim();
      if (!text) return;
      socket.emit("sendMessage", {
        groupId: this.selectedGroupId,
        username: this.username,
        text
      });
      this.newMessage = "";
    }, removeUser(username) {
      this.selectedUsers = this.selectedUsers.filter(u => u !== username);
    },
    openRemoveConfirm(username) {
      this.userToRemove = username;
      this.confirmRemoveDialog = true;
    },

    async confirmRemove() {
      try {
        await axiosInstance.post(`/group/${this.selectedGroupId}/remove-member`, {
          username: this.userToRemove
        }, { withCredentials: true });

        this.confirmRemoveDialog = false;
        this.userToRemove = null;
        await this.fetchGroupMembers(this.selectedGroupId);
      } catch (err) {
        console.error("Failed to remove member:", err);
        alert("Failed to remove member.");
      }
    },
    openAddMembersDialog() {
      this.searchUser = "";
      this.selectedUsers = [];

      const memberUsernames = this.currentGroupMembers.map(u => typeof u === 'string' ? u : u.username);

      this.filteredUsers = this.allUsers.filter(u =>
        u.username !== this.username &&
        !memberUsernames.includes(u.username)
      );

      this.showAddMembersDialog = true;
    },

    closeAddMembersDialog() {
      this.showAddMembersDialog = false;
      this.selectedUsers = [];
      this.searchUser = "";
      this.filteredUsers = this.allUsers.filter(user => user.username !== this.username); // Dodaj ovo
    },

    async confirmAddMembers() {
      try {
        const res = await axiosInstance.post(`/group/${this.selectedGroupId}/add-members`, {
          users: this.selectedUsers
        }, { withCredentials: true });


        this.closeAddMembersDialog();
        await this.fetchGroupMembers(this.selectedGroupId);
      } catch (err) {
        console.error("Failed to add members:", err);
        alert("Failed to add members.");
      }
    },

    resetDialog() {
      this.dialog = false;
      this.newGroupName = "";
      this.selectedUsers = [];
      this.searchUser = "";
      this.filteredUsers = this.allUsers.filter(user => user.username !== this.username);
    }
    ,
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatMessages;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    filterUsers() {
      const query = this.searchUser.toLowerCase();
      this.filteredUsers = this.allUsers.filter(
        user =>
          user.username !== this.username &&
          user.username.toLowerCase().includes(query)
      );
    },
    addUser(user) {
      if (!this.selectedUsers.includes(user.username)) {
        this.selectedUsers.push(user.username);
      }
    },
    formatTime(datetime) {
      const date = new Date(datetime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    async createGroup() {

      if (!this.newGroupName.trim() || this.selectedUsers.length === 0) {
        alert("Please enter a group name and select at least one user.");
        return;
      }
      axiosInstance.post("/group/create", {
        name: this.newGroupName,
        users: this.selectedUsers
      }, { withCredentials: true })
        .then(response => {
          this.groups.push(response.data);
          this.dialog = false;
          this.newGroupName = "";
          this.selectedUsers = [];
          this.searchUser = "";
          this.filteredUsers = this.allUsers.filter(user => user.username !== this.username);

        })
        .catch(error => {
          console.error("Error creating group:", error);
          alert("Failed to create group. Please try again.");
        });

      // this.dialog = false;
      // this.newGroupName = "";
      // this.selectedUsers = [];
      // this.searchUser = "";
      // this.fetchGroups();
    }
  },
  created() {
    socket.off("newMessage"); 
socket.on("newMessage", (msg) => {
  this.messages.push(msg);
  this.scrollToBottom();
});

socket.off("initialMessages");
socket.on("initialMessages", (msgs) => {
  this.messages = msgs;
  this.scrollToBottom();
});

socket.off("forceLeaveGroup");
socket.on("forceLeaveGroup", ({ groupId }) => {
  if (groupId === this.selectedGroupId) {
    alert("You have been removed from the group.");
    this.selectedGroupId = null;
    this.currentGroupName = "";
    this.messages = [];
    this.currentGroupMembers = [];
  }
});


}};
</script>

<style scoped>
html,
body,
.v-application {
  background-color: #f5f7fb;
  font-family: 'Inter', sans-serif;
}

.v-col.pa-0[style*="border-right"] {
  background-color: #fff;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.v-list-item {
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

.v-list-item--active {
  background-color: #e3f2fd !important;
  border-left: 4px solid #2196f3;
}

.v-list-item-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-toolbar {
  box-shadow: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff !important;
}

.v-toolbar-title {
  font-weight: 600;
  color: #333;
}

.messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  background-color: #f9fafc;
  scroll-behavior: smooth;
  max-height: 100%;
}




.v-card.pa-3 {
  box-shadow: none;
  transition: transform 0.2s;
}

.v-card.pa-3:hover {
  transform: translateY(-1px);
}

.v-card .text-caption {
  font-size: 12px;
  line-height: 1;
}

.v-card .text-body-1 {
  font-size: 14px;
  line-height: 1.4;
}

/* === CHAT INPUT === */
.chat-input {
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  padding: 16px;
}

.v-text-field input {
  font-size: 14px;
}

.v-btn {
  transition: all 0.2s;
}

.v-btn:hover {
  opacity: 0.9;
}

.v-dialog .v-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  font-weight: 600;
  font-size: 16px;
}

.user-list-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 160px;
  overflow-y: auto;
  padding: 6px;
}

.user-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  padding: 6px;
  font-size: 13px;
  background: transparent; 
  border-radius: 0;         
  transition: none;      
}

.username {
  margin-bottom: 4px;
  text-align: center;
  font-weight: 500;
  color: #333;
  word-break: break-word;
}
</style>
