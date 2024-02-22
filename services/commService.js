const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const asyncHandler = require('express-async-handler');

// API to get documents based on pageId in Chat collection

const getConversationsByPageId = asyncHandler(async (req, res) => {
    try {
        const { pageId } = req.params;
        const chats = await Chat.find({ pageId });
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { pageId, recipientId, messageContent } = req.body;

        // Your code to send the reply to the recipient based on pageId

        res.status(200).json({ message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = {
    getConversationsByPageId,
    sendMessage
}