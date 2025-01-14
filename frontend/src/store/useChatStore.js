import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../config/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {}, // Track typing status of users

  // Fetch users for sidebar
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages for the selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a new message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Subscribe to socket events related to messaging
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Listen for incoming messages
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Listen for typing event
    socket.on("typing", (data) => {
      const { userId } = data;
      set((state) => {
        const typingUsers = { ...state.typingUsers, [userId]: true };
        return { typingUsers };
      });
    });

    // Listen for stop-typing event
    socket.on("stop-typing", (data) => {
      const { userId } = data;
      set((state) => {
        const typingUsers = { ...state.typingUsers };
        delete typingUsers[userId]; // Remove the typing user
        return { typingUsers };
      });
    });

    // Handle mark as read event from the other user
    socket.on("message-read", (messageId) => {
      set((state) => {
        const updatedMessages = state.messages.map((message) =>
          message._id === messageId ? { ...message, read: true } : message
        );
        return { messages: updatedMessages };
      });
    });
  },

  // Unsubscribe from all socket events
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stop-typing");
    socket.off("message-read");
  },

  // Set selected user for chatting
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Notify when the user starts or stops typing
  notifyTyping: (isTyping) => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (isTyping) {
      socket.emit("start-typing", { userId: useAuthStore.getState().authUser._id, recipientId: selectedUser._id });
    } else {
      socket.emit("stop-typing", { userId: useAuthStore.getState().authUser._id, recipientId: selectedUser._id });
    }
  },

  // Method to set message as read
  setReadStatus: (messageId) => {
    const socket = useAuthStore.getState().socket;

    // Emit a socket event to mark the message as read
    socket.emit("mark-message-as-read", { messageId, senderId: useAuthStore.getState().authUser._id });

    // Update the local state to reflect the read status
    set((state) => ({
      messages: state.messages.map((message) =>
        message._id === messageId ? { ...message, read: true } : message
      ),
    }));
  },
}));
