const asyncHandler = require('express-async-handler');
const axios = require('axios');

const BASE_URL = 'http://localhost:3050';

const ACCESS_TOKEN = "";

function verifyRequestSignature(req, res, buf, next) {
    var signature = req.headers["x-hub-signature-256"];
  
    if (!signature) {
      console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
    } else {
      var elements = signature.split("=");
      var signatureHash = elements[1];
      var expectedHash = crypto
        .createHmac("sha256", config.appSecret)
        .update(buf)
        .digest("hex");
      if (signatureHash != expectedHash) {
        throw new Error("Couldn't validate the request signature.");
      }
    }
  
    next();
  }

async function setupWebhooks(pageId, accessToken, verifyToken) {
    const webhookUrl = BASE_URL + '/webhook'; // Your webhook endpoint
    ACCESS_TOKEN = accessToken;
  
    try {
      const response = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/helpdesk`, {
        access_token: accessToken,
        subscribed_fields: ['messages', 'feed'], // Subscribe to messages and comments
        callback_url: webhookUrl,
        verify_token: verifyToken, // Your verify token for webhook verification
      });
  
      console.log('Webhook subscription successful:', response.data);
    } catch (error) {
      console.error('Error setting up webhooks:', error.response.data);
    }
  }


  const receiveEvents = asyncHandler((req, res) => {
    try {
        let body = req.body;

        console.log(`Received webhook:`);
        console.dir(body, { depth: null });

        if (body && body.object === "page" && body.entry && Array.isArray(body.entry)) {
            // Loop through each entry in the webhook payload
            body.entry.forEach(async (entry) => {

                const pageId = entry.id;

                if (entry.messaging && Array.isArray(entry.messaging)) {
                    // Handle received messages
                    await handleReceivedMessages(entry.messaging, pageId);
                }
                if (entry.changes && Array.isArray(entry.changes)) {
                    // Handle received comments
                    await handleReceivedComments(entry.changes, pageId);
                }
                // You can add more conditions to handle other types of events (e.g., post reactions)
            });

            // Returns a '200 OK' response to all requests
            res.status(200).send("EVENT_RECEIVED");
        } else {
            // Return a '404 Not Found' if event is not from a page subscription or if the payload is invalid
            res.sendStatus(404);
        }
    } catch (error) {
        console.error("Error parsing request body:", error);
        res.status(400).send("Error parsing request body");
    }
});

async function handleReceivedMessages(messages, pageId) {
    // Process and store received messages
    messages.forEach(async (message) => {
        // Extract relevant information from the message object
        const { sender, recipient, message: messageContent, timestamp } = message;

        // Save the message to the database
        await saveMessageToDatabase(sender.id, recipient.id, messageContent, timestamp, pageId);
    });
}

async function handleReceivedComments(comments, pageId) {
    // Process and store received comments
    comments.forEach(async (comment) => {
        // Extract relevant information from the comment object
        const { sender_id, post_id, comment_id, message, created_time } = comment.value;

        // Save the comment to the database
        await saveCommentToDatabase(sender_id, post_id, comment_id, message, created_time, pageId);
    });
}

async function saveMessageToDatabase(senderId, recipientId, messageContent, timestamp, pageId) {
    // Example implementation to save messages to the database using Mongoose
    try {
        const chat = await Chat.findOne({ fbId: senderId }); // Assuming each sender has a unique FB ID
        if (chat) {
            // Add the message to the existing conversation
            chat.conversations.push({
                name: 'direct_message', // Example conversation name
                context: messageContent, // Example context/message content
                status: 'received', // Example status
                time: timestamp // Example status
            });
            await chat.save();
        }else{
            // Create a new conversation
            const newChat = new Chat({
                name : userDetails.name,
                email : userDetails.email,
                status : userDetails.online_status,
                pageId: pageId,
                fbId: senderId,
                conversations: [{
                    name: 'direct_message', // Example conversation name
                    context: messageContent, // Example context/message content
                    status:'received', // Example status
                    time: timestamp // Example status
                }]
            });
            await newChat.save();
        }
    } catch (error) {
        console.error("Error saving message to database:", error);
    }
}

async function getUserDetails(userId, accessToken) {
    try {
        const response = await axios.get(`https://graph.facebook.com/${userId}?fields=email,name,online_status&access_token=${accessToken}`);
        const userData = response.data;
        return userData;
    } catch (error) {
        console.error('Error retrieving user details:', error.response.data);
        throw new Error('Failed to retrieve user details');
    }
}

async function saveCommentToDatabase(senderId, postId, commentId, message, createdTime, pageId) {
    // Example implementation to save comments to the database using Mongoose
    try {
        const chat = await Chat.findOne({ fbId: senderId }); // Assuming each commenter has a unique FB ID
        const userDetails = await getUserDetails(senderId, ACCESS_TOKEN);
        if (chat) {
            // Add the comment to the existing conversation
            chat.conversations.push({
                name: 'comment_reply',
                context: message,
                time: createdTime 
            });
            await chat.save();
        }else{
            // Create a new conversation
            const newChat = new Chat({
                name : userDetails.name,
                email : userDetails.email,
                status : userDetails.online_status,
                pageId: pageId,
                fbId: senderId,
                conversations: [{
                    name: 'comment_reply', // Example conversation name
                    context: message, // Example context/comment content
                    time: createdTime // Example status
                }]
            });
            await newChat.save();
        }
    } catch (error) {
        console.error("Error saving comment to database:", error);
    }
}


    const verifyWebhook = asyncHandler((req, res, buf, next) => {
        // Call verifyRequestSignature middleware
        verifyRequestSignature(req, res, buf, next);
      }, (req, res) => {
        
        // Parse the query params
          let mode = req.query["hub.mode"];
          let token = req.query["hub.verify_token"];
          let challenge = req.query["hub.challenge"];
        
          // Check if a token and mode is in the query string of the request
          if (mode && token) {
            // Check the mode and token sent is correct
            if (mode === "subscribe" && token === verifyToken) {
              // Respond with the challenge token from the request
              console.log("WEBHOOK_VERIFIED");
              res.status(200).send(challenge);
            } else {
              // Respond with '403 Forbidden' if verify tokens do not match
              res.sendStatus(403);
            }
          }
        });


module.exports = {
    receiveEvents,
    verifyWebhook,
    setupWebhooks,
}