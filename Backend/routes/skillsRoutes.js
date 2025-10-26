const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

// Add or update a skill
router.post('/add', async (req, res) => {
    try {
        const { userId, skill } = req.body;

        if (!userId || !skill.name || !skill.level || !skill.category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // validate location
        if (!skill.location || !skill.location.coordinates || typeof skill.location.coordinates.lat !== 'number' || typeof skill.location.coordinates.lng !== 'number') {
            return res.status(400).json({ error: 'Missing or invalid location (lat/lng required)' });
        }

        // Try to find existing skill
        const existingSkill = await Skill.findOne({ userId, name: skill.name });

        let updatedSkill;
        if (existingSkill) {
            // Update existing skill
            existingSkill.level = skill.level;
            existingSkill.category = skill.category;
            existingSkill.location = skill.location;
            updatedSkill = await existingSkill.save();
        } else {
            // Create new skill
            updatedSkill = await Skill.create({
                userId,
                name: skill.name,
                category: skill.category,
                level: skill.level,
                location: skill.location
            });
        }

        // Get all skills for the user to return
        const allSkills = await Skill.find({ userId }).select('-__v -userId');

        res.status(201).json({
            message: 'Skill added successfully',
            skills: allSkills.map(s => ({
                name: s.name,
                level: s.level,
                category: s.category,
                location: s.location
            }))
        });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ error: 'Failed to add skill' });
    }
});

// Get user skills
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const skills = await Skill.find({ userId }).select('-__v -userId');
        res.json(skills.map(s => ({
            name: s.name,
            level: s.level,
            category: s.category,
            location: s.location
        })));
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// Get all skills (for Discover page)
router.get('/', async (req, res) => {
    try {
        const skills = await Skill.find({}).select('-__v');
        // Return a flat list of skills with userId included
        res.json(skills.map(s => ({
            id: s._id,
            userId: s.userId,
            name: s.name,
            level: s.level,
            category: s.category,
            location: s.location,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        })));
    } catch (error) {
        console.error('Error fetching all skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// Delete a skill
router.delete('/:userId/:skillName', async (req, res) => {
    try {
        const { userId, skillName } = req.params;
        await Skill.findOneAndDelete({ userId, name: skillName });

        // Get remaining skills
        const remainingSkills = await Skill.find({ userId }).select('-__v -userId');
        res.json({
            message: 'Skill deleted successfully',
            skills: remainingSkills.map(s => ({
                name: s.name,
                level: s.level,
                category: s.category
            }))
        });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

module.exports = router;