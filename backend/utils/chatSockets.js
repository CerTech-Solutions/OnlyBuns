const GroupMessageService = require("../services/groupMessageService");

module.exports = function(io) {
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("joinGroup", async ({ groupId, username }) => {
      socket.join(groupId);
      console.log(`${username} se priključio grupi ${groupId}`);

      const result = await GroupMessageService.getLast10Messages(groupId);
      console.log("Učitavanje poruka za grupu:", groupId, "Rezultat:", result);
      if (result.status === 'OK') {
        socket.emit("initialMessages", result.data);
      } else {
        socket.emit("error", { message: "Greška pri učitavanju poruka" });
      }
    });

    socket.on("sendMessage", async ({ groupId, username, text }) => {
      const result = await GroupMessageService.sendMessage(groupId, username, text);

      if (result.status === 'OK') {
        io.to(groupId).emit("newMessage", result.data);
      } else {
        socket.emit("error", { message: "Greška pri slanju poruke" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
};
