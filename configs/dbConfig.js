const mongoose = require('mongoose');
require('dotenv').config();


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`mongodb+srv://saiteja_chenji:${process.env.MONGODB_PASSWORD}@cluster0.mllmmct.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'helpdesk'
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;