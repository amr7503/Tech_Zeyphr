const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { config } = require('dotenv');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const Project = require('./models/Project');
const Notification = require('./models/Notification');
const skillsRoutes = require('./routes/skillsRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});


// FRONTEND_ORIGIN: allow overriding via env (set this in Render to your frontend URL).
// We allow multiple known frontend hosts (preview, production, localhost for local testing).
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://tech-zeyphr-1.onrender.com';
const FRONTEND_ALT_ORIGIN = process.env.FRONTEND_ALT_ORIGIN || 'https://tech-zeyphr.onrender.com';
const LOCAL_DEV_ORIGIN = process.env.LOCAL_DEV_ORIGIN || 'http://localhost:4173';

const allowedOrigins = [FRONTEND_ORIGIN, FRONTEND_ALT_ORIGIN, LOCAL_DEV_ORIGIN].filter(Boolean);

// Log incoming origin for debugging (useful to inspect Render logs when diagnosing 502/CORS)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) console.log('[CORS] Incoming request Origin:', origin);
    next();
});

const corsOptions = {
    origin: function (origin, callback) {
        // allow if no origin (e.g., server-to-server or same-origin requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            console.warn('[CORS] Blocked origin:', origin);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use("/skills", skillsRoutes);
app.use("/projects", projectRoutes);
app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes);
app.use("/chat", chatRoutes);

app.get('/health', (req, res) => {
    console.log('Health check endpoint hit!');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Backend is working!'
    });
});


// create HTTP server and attach Socket.IO for real-time chat
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join a room (e.g., project or conversation id)
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // message payload: { room: string, from: string, text: string, timestamp?: number }
    socket.on('sendMessage', (payload) => {
        if (!payload || !payload.room) return;
        // broadcast to everyone in the room (including sender)
        io.to(payload.room).emit('receiveMessage', { ...payload, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Expose the backend's public origin (used for absolute links, webhooks, or manifests).
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'https://tech-zeyphr.onrender.com';

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server (with Socket.IO) is listening on port ${PORT}`);
    console.log(`FRONTEND_ORIGIN: ${FRONTEND_ORIGIN}`);
    console.log(`BACKEND_ORIGIN: ${BACKEND_ORIGIN}`);
});

// Schedule daily EOD notifications at 23:59 server time
try {
    cron.schedule('59 23 * * *', async () => {
        try {
            console.log('[EOD Scheduler] Running daily notifications job');
            const projects = await Project.find({});
            const today = new Date();
            const dayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));

            for (const proj of projects) {
                const message = `Reminder: You are a member of project '${proj.title}'. Please review and contribute updates.`;
                for (const member of proj.members) {
                    // Avoid duplicate notifications for same project same day
                    const existing = await Notification.findOne({
                        userId: member.userId,
                        projectId: proj._id,
                        createdAt: { $gte: dayStart }
                    });
                    if (!existing) {
                        await Notification.create({ userId: member.userId, projectId: proj._id, message });
                        console.log(`[EOD Scheduler] Notification created for user ${member.userId} project ${proj._id}`);
                    }
                }
            }
        } catch (err) {
            console.error('[EOD Scheduler] Error while creating notifications:', err);
        }
    });
    console.log('[EOD Scheduler] Scheduled daily notifications at 23:59');
} catch (err) {
    console.warn('[EOD Scheduler] node-cron not available or failed to schedule. Install node-cron to enable EOD notifications.');
}
