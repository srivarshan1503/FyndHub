require('dotenv').config();
const pool = require('./config/db');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const { startCronJobs } = require('./config/cronJobs');

startCronJobs();

const express = require("express");
const app = express();
app.use(express.json());

const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get("/", (req, res) => {
    res.json({ message: "WhereIsMine API is running" });
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database:', res.rows[0].now);
    }
});


const http = require('http')
const { Server } = require('socket.io')

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

server.listen(process.env.PORT, () => {
    console.log(`WhereIsMine server running on port ${process.env.PORT}`)
})

const { initializeSocket } = require('./config/socket');
initializeSocket(io);






