import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { formatMessageTime } from "../config/utils.js";
import { Search, Check, CheckCheck, CheckCircle } from "lucide-react"; // Import icons

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    setReadStatus,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const messageEndRef = useRef(null);

  // Fetching messages and subscribing to real-time updates
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current && messages.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when the user opens the chat
  useEffect(() => {
    if (messages.length) {
      messages.forEach((message) => {
        if (message.receiverId === authUser._id && !message.read) {
          setReadStatus(message._id); // Mark as read
        }
      });
    }
  }, [selectedUser._id, messages, authUser._id, setReadStatus]);

  // Filter messages based on the search query
  const filteredMessages = messages.filter((message) =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If messages are still loading, show a loading skeleton
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(to top, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4)), url('/images/chat-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <ChatHeader />

      {/* Search Bar */}
      <div
        className="p-2 bg-gray-100 rounded-lg shadow-sm border-b border-gray-300 mb-4 flex items-center space-x-2"
        style={{ backgroundColor: "#f1f5f9" }}
      >
        <Search className="text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          className="w-full p-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 rounded-md"
        />
      </div>

      {/* Messages container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: "calc(100vh - 150px)" }} // Adjust height to make space for header and search bar
      >
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500">No messages found</div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1 text-gray-500">
                  {formatMessageTime(message.createdAt)} {/* Format and display the message timestamp */}
                </time>
              </div>
              <div className="chat-bubble flex flex-col bg-blue-50 p-3 rounded-lg shadow-sm">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 transition-all"
                  />
                )}
                {message.text && <p className="text-gray-800">{message.text}</p>}
              </div>

              {/* Display Tick Icon based on message status */}
              <div className="chat-footer flex items-center mt-2 space-x-2">
                {message.read ? (
                  <CheckCheck className="text-blue-500" size={20} />
                ) : message.delivered ? (
                  <CheckCircle className="text-gray-500" size={20} />
                ) : (
                  <Check className="text-gray-500" size={20} />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers[selectedUser._id] && (
        <div className="text-sm text-gray-500 px-4 py-2 italic">
          {selectedUser.fullName} is typing...
        </div>
      )}

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
