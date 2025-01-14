import mongoose from "mongoose";

// Message schema definition
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false, // Tracks whether the message has been read (false for unread, true for read)
    },
  },
  { timestamps: true }
);

// Create a method to mark the message as read
messageSchema.methods.markAsRead = function () {
  this.read = true;
  return this.save(); // Save the updated message
};

// Static method to get messages for a user with read status
messageSchema.statics.getMessagesByUsers = async function (userId1, userId2) {
  return this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  }).sort({ createdAt: 1 }); // Sorting by creation time to fetch messages in order
};

// Create the model based on the schema
const Message = mongoose.model("Message", messageSchema);

export default Message;
