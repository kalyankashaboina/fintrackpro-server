const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String 
  },
  profilePic: { 
    type: String, 
    default: '' 
  },
  provider: {
    type: String,
    enum: ['local', 'google'], 
    default: 'local',         
  },
  resetToken: String,
  resetTokenExpiry: Date
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);