
function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('user connected : ', socket.id);


        socket.on('join_room', (postId) => {
            socket.join(`post_${postId}`);
            console.log(`user ${socket.id} joined room post_${postId}`);
        });

        socket.on('send_message', (data) => {
            data.senderId = socket.id;
            data.timestamp = new Date();
            io.to(`post_${data.postId}`).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected : ', socket.id);
        });
    });
}

module.exports = { initializeSocket };
