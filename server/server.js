require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting (Disabled for development)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 1000 // limit each IP to 1000 requests per windowMs
// });
// app.use('/api', limiter);

// Basic Route
app.get('/', (req, res) => {
    res.send('Sports Event Management System API is running...');
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_match', (matchId) => {
        socket.join(matchId);
        console.log(`User joined match: ${matchId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Export io to be used in controllers
app.set('socketio', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
