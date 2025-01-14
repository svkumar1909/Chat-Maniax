import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Adjust for your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store user socket connections
const userSocketMap = {}; // {userId: socketId}

// Track typing users for specific recipients
let typingUsers = {}; // {recipientId: {userId: typing}}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Associate socket connection with userId from the client
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Broadcast updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle start-typing event
  socket.on("start-typing", (data) => {
    const { userId, recipientId } = data;

    // Add user to the typing status of the recipient
    if (!typingUsers[recipientId]) typingUsers[recipientId] = {};
    typingUsers[recipientId][userId] = true;

    console.log(`${userId} started typing to ${recipientId}`);

    // Notify recipient about the typing user
    socket.broadcast.to(userSocketMap[recipientId]).emit("typing", { userId });
  });

  // Handle stop-typing event
  socket.on("stop-typing", (data) => {
    const { userId, recipientId } = data;

    // Remove user from the typing status of the recipient
    if (typingUsers[recipientId] && typingUsers[recipientId][userId]) {
      delete typingUsers[recipientId][userId];
    }

    console.log(`${userId} stopped typing to ${recipientId}`);

    // Notify recipient about the stop-typing event
    socket.broadcast.to(userSocketMap[recipientId]).emit("stop-typing", { userId });
  });

  // Handle message delivery event
  socket.on("message-delivered", (data) => {
    const { messageId, senderId, receiverId } = data;

    // Emit message delivered event to the receiver
    socket.broadcast.to(userSocketMap[receiverId]).emit("message-delivered", {
      messageId,
      senderId,
    });

    console.log(`Message ${messageId} delivered to ${receiverId}`);
  });

  // Handle mark-message-as-read event
  socket.on("mark-message-as-read", (data) => {
    const { messageId, senderId, receiverId } = data;

    // Emit message-read event to the sender (broadcast)
    socket.broadcast.to(userSocketMap[senderId]).emit("message-read", {
      messageId,
      receiverId,
      readStatus: "seen", // Indicate that the message has been seen
    });

    console.log(`Message ${messageId} marked as read by ${receiverId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    // Clean up the user from the socket map
    delete userSocketMap[userId];

    // Clean up typing status
    for (let recipientId in typingUsers) {
      delete typingUsers[recipientId][userId];
    }

    // Broadcast updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
