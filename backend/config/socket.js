const pool = require('./db')

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('join_room', async (postId) => {
            socket.join(`post_${postId}`)
            console.log(`User ${socket.id} joined room post_${postId}`)

            try {
                const messages = await pool.query(
                    'SELECT * FROM messages WHERE post_id = $1 ORDER BY created_at ASC',
                    [postId]
                )
                socket.emit('previous_messages', messages.rows)
            } catch (error) {
                console.log('Error loading messages:', error.message)
            }
        })

        socket.on('send_message', async (data) => {
            try {
                await pool.query(
                    'INSERT INTO messages (post_id, sender_id, message) VALUES ($1, $2, $3)',
                    [data.postId, socket.id, data.message]
                )
                io.to(`post_${data.postId}`).emit('receive_message', {
                    ...data,
                    senderId: socket.id,
                    timestamp: new Date()
                })
            } catch (error) {
                console.log('Error saving message:', error.message)
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })
}

module.exports = { initializeSocket }