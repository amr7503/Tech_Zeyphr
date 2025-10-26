const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
