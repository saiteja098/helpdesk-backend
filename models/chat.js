const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ChatSchema = new Schema({
    agent: {
        type: Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    fbId:{
        type: String,
        required: true
    },
    pageId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'offline',
    },
    email: {
        type: String,
    },
    conversations: {
        type: Array, 
    }
});

// Define the Chat model
const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
