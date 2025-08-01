const mongoose = require('mongoose');
const config = require('./config');

module.exports = async () => {
  console.log('📡 Connecting to MongoDB:', config.dbURL);

  try {

    if (!config.dbURL) {
      throw new Error('❌ Missing DB URL!');
    }
    await mongoose.connect(config.dbURL);

    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};
