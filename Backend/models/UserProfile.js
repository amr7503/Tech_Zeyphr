const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  displayName: { type: String },
  bio: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

userProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
