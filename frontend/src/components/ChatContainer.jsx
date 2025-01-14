import { useChatStore } from "../store/useChatStore.js";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { formatMessageTime } from "../config/utils.js";
import { SquareCheckBig, Check, CheckCheck, Search } from "lucide-react"; // Import icons

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

  // Effect to fetch messages and subscribe to message events
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle marking messages as read when the user opens the chat
  useEffect(() => {
    if (messages.length) {
      messages.forEach((message) => {
        if (message.receiverId === authUser._id && !message.read) {
          setReadStatus(message._id); // Mark as read
        }
      });
    }
  }, [selectedUser._id, messages, authUser._id, setReadStatus]);

  // Filtered messages based on search query
  const filteredMessages = messages.filter((message) =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If messages are still loading, show the skeleton loader
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
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Search bar */}
      <div className="p-1 bg-gray-100 rounded-lg shadow-sm border-b border-gray-300 mb-4 flex items-center space-x-2">
        <Search className="text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          className="w-full p-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 rounded-md"
        />
      </div>

      {/* Displaying the filtered messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
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

              {/* WhatsApp-like tick indicators */}
              <div className="flex items-center space-x-1 mt-2">
                {/* One tick (sent) */}
                {!message.delivered && !message.read && (
                  <SquareCheckBig className="text-gray-500" size={20} />
                )}

                {/* Two ticks (delivered) */}
                {message.delivered && !message.read && (
                  <div className="flex space-x-1">
                    <Check className="text-gray-500" size={20} />
                    <Check className="text-gray-500" size={20} />
                  </div>
                )}

                {/* Two blue ticks (read) */}
                {message.read && (
                  <div className="flex space-x-1">
                    <CheckCheck className="text-blue-500" size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Typing indicator */}
      {typingUsers[selectedUser._id] && (
        <div className="text-sm text-gray-500 px-4 py-2 italic">
          {selectedUser.fullName} is typing...
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
