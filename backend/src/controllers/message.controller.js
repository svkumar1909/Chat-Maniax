import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";

// Get users for sidebar (no changes here)
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages (include the read status)
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Return the messages with the read status
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send message (no changes except to save the read status)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Emit a new message event to the receiver
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark a message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params; // Get message ID from request
    const { userId } = req.user; // Get user ID (receiver) from the authenticated user

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the logged-in user is the receiver
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can't mark this message as read" });
    }

    // Update the message's read status to true if it hasn't been read yet
    if (!message.read) {
      message.read = true;
      await message.save();
    }

    // Emit a socket event to notify the sender that the message has been read
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", {
        messageId,
        readStatus: "seen", // Indicate the message has been seen
      });
    }

    // Send a response back to the client
    res.status(200).json({ message: "Message marked as read", message });
  } catch (error) {
    console.log("Error in markMessageAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
