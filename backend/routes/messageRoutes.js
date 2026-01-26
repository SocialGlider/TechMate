const express = require("express");
const { getConversations, getMessages, sendMessage } = require("../controllers/messageController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

// Conversations route must come before :userId route
router.get("/conversations", isAuthenticated, getConversations);
router.post("/send", isAuthenticated, sendMessage);
router.get("/:userId", isAuthenticated, getMessages);

module.exports = router;
