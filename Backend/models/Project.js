const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    adminId: {
        type: String,
        required: true,
        index: true
    },
    members: [{
        userId: String,
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    progress: {
        completed: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed', 'on-hold'],
        default: 'planning'
    },
    tags: [String],
    startDate: Date,
    endDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps on save
projectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Project', projectSchema);