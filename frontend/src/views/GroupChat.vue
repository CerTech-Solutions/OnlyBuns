<template>
    <v-container fluid>
      <v-row>
        <!-- Leva kolona -->
        <v-col cols="3" class="pa-0">
          <v-toolbar flat>
            <v-toolbar-title>Chats</v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="dialog = true">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
  
          <v-list dense nav>
            <v-list-item
              v-for="group in groups"
              :key="group.id"
              :active="group.id === selectedGroupId"
              @click="selectGroup(group.id)"
            >
              <v-list-item-title>{{ group.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
  
        <!-- Desna kolona -->
        <v-col cols="9" class="pa-2">
          <div v-if="selectedGroupId" class="chat-box">
            <div class="messages" ref="chatMessages">
              <v-row
  v-for="msg in messages"
  :key="msg.id"
  :justify="msg.senderUsername === username ? 'end' : 'start'"
  class="mb-1"
>
  <v-col cols="auto" class="d-flex">
    <v-card
      :color="msg.senderUsername === username ? 'blue lighten-4' : 'grey lighten-3'"
      class="pa-3"
      style="max-width: 300px; border-radius: 12px; word-wrap: break-word;"
    >
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
  
            <div class="chat-input">
              <v-text-field
                v-model="newMessage"
                @keyup.enter="sendMessage"
                label="Pošalji poruku"
                dense
                hide-details
                variant="outlined"
              />
              <v-btn @click="sendMessage" color="primary">Send</v-btn>
            </div>
          </div>
          <div v-else class="text-center pa-10 grey--text">
            <v-icon size="64">mdi-chat</v-icon>
            <p>Izaberi grupu sa leve strane</p>
          </div>
        </v-col>
      </v-row>
  
      <!-- Dijalog za pravljenje grupe -->
      <v-dialog v-model="dialog" max-width="600px">
  <v-card>
    <v-card-title>
      <span class="text-h6">Create Group</span>
    </v-card-title>
    <v-card-text>
      <v-text-field v-model="newGroupName" label="Group name" />

      <v-text-field
        v-model="searchUser"
        label="Search users"
        @input="filterUsers"
        class="mb-2"
      />

      <!-- Horizontalni prikaz selektovanih korisnika -->
      <v-chip-group column class="mb-2">
        <v-chip
          v-for="user in selectedUsers"
          :key="user"
          closable
          @click:close="removeUser(user)"
          class="ma-1"
          color="blue lighten-3"
        >
          {{ user }}
        </v-chip>
      </v-chip-group>

     <!-- Horizontalna lista korisnika -->
     <div class="user-list-wrap">
  <div
    v-for="user in filteredUsers"
    :key="user.username"
    class="user-tile"
  >
    <div class="username">{{ user.username }}</div>
    <v-btn
      icon
      @click.stop="addUser(user)"
      :disabled="selectedUsers.includes(user.username)"
    >
      <v-icon large>mdi-account-plus</v-icon>
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

    </v-container>
  </template>
  
  <script>
  import { io } from "socket.io-client";
  import axiosInstance from "@/utils/axiosInstance";
  const socket = io("http://localhost:3000"); // promeni ako treba
  import { store } from '@/utils/store';

  export default {
    name: "GroupChatPage",

    computed:{
      store(){
        return this.store;
      }
    },
    data() {
      return {
        username: store.username, // trenutno hardkodirano
        groups: [],
        selectedGroupId: null,
        messages: [],
        newMessage: "",
        dialog: false,
        newGroupName: "",
        searchUser: "",
        filteredUsers: [],
        selectedUsers: [],
        allUsers: []
      };
    },
    mounted() {
      this.fetchGroups();
      this.fetchAllUsers();
    },
    methods: {
      async fetchGroups() {
        axiosInstance.get("/group/my-groups", { withCredentials: true })
          .then(response => {
            console.log("Fetched groups:", response.data);  
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
      async fetchAllUsers() {
        axiosInstance.get("/user/chatfollowing", { withCredentials: true })
          .then(response => {
            console.log("Fetched users:", response.data);
            this.allUsers = response.data;
            this.filteredUsers = this.allUsers.filter(user => user.username !== this.username);
          })
          .catch(error => {
            console.error("Error fetching users:", error);
          }); 
      },
      selectGroup(id) {
        this.selectedGroupId = id;
        this.messages = [];
        socket.emit("joinGroup", { groupId: id, username: this.username });
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
      },removeUser(username) {
  this.selectedUsers = this.selectedUsers.filter(u => u !== username);
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
            console.log("Group created:", response.data);
            this.groups.push(response.data);
            this.dialog = false;
            this.newGroupName = "";
            this.selectedUsers = [];
            this.searchUser = "";
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
      socket.on("initialMessages", (msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      });
  
      socket.on("newMessage", (msg) => {
        this.messages.push(msg);
        this.scrollToBottom();
      });
  
      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });
    }
  };
  </script>
  
  <style scoped>
  .chat-box {
    display: flex;
    flex-direction: column;
    height: 500px;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px;
  }
  .messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 8px;
  padding: 12px;
  background-color: #f9f9f9;
}

  .message {
    margin-bottom: 6px;
  }
  .chat-input {
    display: flex;
    gap: 8px;
  }

  .user-list-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 150px;
  overflow-y: auto;
  padding: 4px;
}

.user-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.username {
  font-size: 13px;
  margin-bottom: 4px;
  text-align: center;
  word-break: break-word;
}



  </style>
  