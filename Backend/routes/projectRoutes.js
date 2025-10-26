const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Create a new project
router.post('/create', async (req, res) => {
    try {
        const { title, description, category, adminId, tags, startDate, endDate } = req.body;
        console.log('Received project data:', { title, description, category, adminId, tags });

        if (!title || !description || !category || !adminId) {
            const missingFields = [];
            if (!title) missingFields.push('title');
            if (!description) missingFields.push('description');
            if (!category) missingFields.push('category');
            if (!adminId) missingFields.push('adminId');
            
            return res.status(400).json({ 
                error: 'Missing required fields', 
                missingFields,
                receivedData: { title, description, category, adminId }
            });
        }

        const project = await Project.create({
            title,
            description,
            category,
            adminId,
            tags: tags || [],
            startDate: startDate || null,
            endDate: endDate || null,
            members: [{
                userId: adminId,
                role: 'admin',
                joinedAt: new Date()
            }],
            status: 'planning', // Set default status
            progress: { completed: 0, lastUpdated: new Date() } // Set initial progress
        });

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ 
            error: 'Failed to create project',
            details: error.message,
            receivedData: req.body
        });
    }
});

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get project by ID
router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Join a project
router.post('/:projectId/join', async (req, res) => {
    try {
        // Allow session user id first (if you have auth), fallback to provided userId
        const { userId: bodyUserId } = req.body;
        const userId = (req.session && req.session.userId) ? req.session.userId : bodyUserId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required to join a project' });
        }
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is already a member
        if (project.members.some(member => member.userId === userId)) {
            return res.status(400).json({ error: 'User is already a member' });
        }

        project.members.push({
            userId,
            role: 'member',
            joinedAt: new Date()
        });

        await project.save();
        res.json({
            message: 'Successfully joined project',
            project
        });
    } catch (error) {
        console.error('Error joining project:', error);
        res.status(500).json({ error: 'Failed to join project' });
    }
});

// Update project progress (admin only)
router.patch('/:projectId/progress', async (req, res) => {
    try {
        const { progress } = req.body;
        // Prefer authenticated user from session, fallback to adminId in body
        const requesterId = (req.session && req.session.userId) ? req.session.userId : req.body.adminId;
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify admin (must be the project creator/admin)
        if (project.adminId !== requesterId) {
            return res.status(403).json({ error: 'Only project admin can update progress', requesterId, projectAdminId: project.adminId });
        }

        project.progress = {
            completed: progress,
            lastUpdated: new Date()
        };

        // Update status based on progress: completed if 100, otherwise in-progress
        if (typeof progress === 'number') {
            if (progress >= 100) {
                project.status = 'completed';
            } else if (progress > 0) {
                project.status = 'in-progress';
            } else {
                // keep planning if progress is 0 and status was planning
                if (project.status === 'planning') {
                    project.status = 'planning';
                } else {
                    project.status = 'in-progress';
                }
            }
        }

        await project.save();
        res.json({
            message: 'Progress updated successfully',
            project
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Failed to update progress', details: error.message, receivedData: req.body });
    }
});

// Update project status (admin only)
router.patch('/:projectId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const requesterId = (req.session && req.session.userId) ? req.session.userId : req.body.adminId;
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.adminId !== requesterId) {
            return res.status(403).json({ error: 'Only project admin can update status', requesterId, projectAdminId: project.adminId });
        }

        project.status = status;
        await project.save();
        res.json({ message: 'Status updated successfully', project });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status', details: error.message, receivedData: req.body });
    }
});

module.exports = router;