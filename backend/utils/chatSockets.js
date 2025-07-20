const GroupMessageService = require("../services/groupMessageService");
const { GroupUser } = require("../models"); // za proveru članstva

// Mapa korisnika: username → socket.id
const userSockets = new Map();

module.exports = function(io) {
  // Emit helper za slanje korisniku po username-u
  const emitToUser = (username, event, payload) => {
    const socketId = userSockets.get(username);
    if (socketId) {
      io.to(socketId).emit(event, payload);
    } else {
      console.warn(`⚠️ No socket found for user ${username}`);
    }
  };

  // Ekspozuj funkciju globalno
  io.emitToUser = emitToUser;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Registruj korisnika kada se frontend spoji
    socket.on("register", (username) => {
      userSockets.set(username, socket.id);
      socket.username = username;
      console.log(`Registered ${username} with socket ID ${socket.id}`);
    });

    // Korisnik ulazi u grupu
    socket.on("joinGroup", async ({ groupId, username }) => {
      // Ako je već bio u nekoj grupi — napusti je
      if (socket.currentGroupId && socket.currentGroupId !== groupId) {
        socket.leave(socket.currentGroupId);
        console.log(`${socket.username || "Unknown"} left group ${socket.currentGroupId}`);
      }
    
      // Zapiši novu grupu
      socket.currentGroupId = groupId;
      socket.username = username; // sigurnost
    
      socket.join(groupId);
      console.log(`${username} joined group ${groupId}`);
    
      const result = await GroupMessageService.getMessages(groupId, username);
      if (result.status === 'OK') {
        socket.emit("initialMessages", result.data);
      } else {
        socket.emit("error", { message: "Greška pri učitavanju poruka" });
      }
    });
    

    // Korisnik šalje poruku
    socket.on("sendMessage", async ({ groupId, username, text }) => {
      // ❗ Provera da li je još uvek član grupe
      const isMember = await GroupUser.findOne({
        where: { groupId, userUsername: username }
      });

      if (!isMember) {
        return socket.emit("forceLeaveGroup", { groupId });
      }

      const result = await GroupMessageService.sendMessage(groupId, username, text);
      if (result.status === 'OK') {
        io.to(groupId).emit("newMessage", result.data);
      } else {
        socket.emit("error", { message: "Greška pri slanju poruke" });
      }
    });

    socket.on("leaveGroup", ({ groupId }) => {
      socket.leave(groupId);
      console.log(`${socket.username} left group ${groupId}`);
    });
    
    // Diskonektuj korisnika
    socket.on("disconnect", () => {
      if (socket.username) {
        userSockets.delete(socket.username);
        console.log(` Disconnected: ${socket.username}`);
      } else {
        console.log(" Disconnected: unknown socket", socket.id);
      }
    });
  });
};
