const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
  // може и други полета: tel, avatar, role и т.н.
});

module.exports = mongoose.model('User', userSchema);
