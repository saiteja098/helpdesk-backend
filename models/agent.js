const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for agents
const AgentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fb_accounts: {
    type: Set,
  },
  accessToken: {
    type: String,
  }
});

// Define the Agent model
const Agent = mongoose.model('Agent', AgentSchema);

module.exports = Agent;
