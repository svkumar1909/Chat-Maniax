import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, markMessageAsRead } from "../controllers/message.controller.js";

const router = express.Router();

// Get users for sidebar 
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages for a specific user 
router.get("/:id", protectRoute, getMessages);

// Send a new message 
router.post("/send/:id", protectRoute, sendMessage);

// Mark a message as read
router.put("/read/:messageId", protectRoute, markMessageAsRead); // New route to mark messages as read

export default router;
