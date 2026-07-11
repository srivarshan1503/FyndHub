require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173', 'https://fyndhub.vercel.app', /\.vercel\.app$/],
    credentials: true
}))

const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/posts')

app.get('/', (req, res) => {
    res.json({ message: 'WhereIsMine API is running' })
})
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)

const pool = require('./config/db')
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to database:', err)
    } else {
        console.log('Connected to database:', res.rows[0].now)
    }
})

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

const { initializeSocket } = require('./config/socket')
initializeSocket(io)

const { startCronJobs } = require('./config/cronJobs')
startCronJobs()

server.listen(process.env.PORT || 5000, () => {
    console.log(`WhereIsMine server running on port ${process.env.PORT || 5000}`)
})