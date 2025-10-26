const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    location: {
        address: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for userId and name to ensure uniqueness of skills per user
skillSchema.index({ userId: 1, name: 1 }, { unique: true });

// Update the updatedAt field on save
skillSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Skill', skillSchema);