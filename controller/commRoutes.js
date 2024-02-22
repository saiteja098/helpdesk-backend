const express = require('express');
const router = express.Router();
const commService = require('../services/commService');
const verifyJWT = require('../middlewares/verifyJWT');

router.use(verifyJWT);
// API to get documents based on pageId in Chat collection
router.route('/chats/:pageId')
    .get(commService.getConversationsByPageId);


// API to send replies to page users (DMs or comments)
router.route('/send-reply')
         .post(commService.sendMessage)