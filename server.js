class Message {
    constructor(content, timestamp, username = "System") {
        this.content = content;
        this.timestamp = timestamp;
        this.username = username;
    }
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Статичні файли (HTML, CSS, JS)
app.use(express.static('public'));

// Головна сторінка
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Обробка підключення користувачів
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', (data) => {
        socket.username = data.username;
        socket.room = data.room;
        socket.join(data.room);

        const joinMessage = new Message(`Welcome, ${data.username}!`, new Date().toLocaleTimeString(), data.username);
        io.to(data.room).emit('chat message', joinMessage);
        io.to(data.room).emit('user list', getUsersInRoom(data.room));  // Оновлення списку користувачів
    });

    // Обробка надсилання повідомлень
    socket.on('chat message', (msgContent) => {
        const message = new Message(msgContent, new Date().toLocaleTimeString(), socket.username);
        io.to(socket.room).emit('chat message', message);
    });

    // Обробка відключення користувача
    socket.on('disconnect', () => {
        if (socket.username && socket.room) {
            const leaveMessage = new Message(`${socket.username} has left the room.`, new Date().toLocaleTimeString(), socket.username);
            io.to(socket.room).emit('chat message', leaveMessage);
            io.to(socket.room).emit('user list', getUsersInRoom(socket.room));
        }
    });
});

// Функція для отримання списку користувачів в кімнаті
function getUsersInRoom(room) {
    const clients = io.sockets.adapter.rooms.get(room) || [];
    return Array.from(clients).map(clientId => {
        return io.sockets.sockets.get(clientId).username;
    });
}

// Запуск сервера
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
