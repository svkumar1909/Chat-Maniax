import { create } from "zustand";
import { axiosInstance } from "../config/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isDeletingProfilePic: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      if (res?.data) {
        set({ authUser: res.data });
        get().connectSocket();
      } else {
        set({ authUser: null });
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      if (res?.data) {
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
      } else {
        toast.error("Failed to create account.");
      }
    } catch (error) {
      console.log("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      if (res?.data) {
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        get().connectSocket();
      } else {
        toast.error("Invalid credentials or server error.");
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);

      if (res?.data) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } else {
        toast.error("Profile update failed.");
      }
    } catch (error) {
      console.log("Update profile error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteProfilePic: async () => {
    set({ isDeletingProfilePic: true });
    try {
      const res = await axiosInstance.delete("/auth/delete-profile-pic");

      if (res?.data) {
        set({ authUser: res.data });
        toast.success("Profile picture deleted successfully");
      } else {
        toast.error("Failed to delete profile picture.");
      }
    } catch (error) {
      console.log("Error in delete profile pic:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isDeletingProfilePic: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
