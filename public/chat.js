$(function () {
    const socket = io();

    // Обробка форми для приєднання
    $('#joinForm').submit(function (event) {
        event.preventDefault();
        const username = $('#username').val();
        const room = $('#room').val();
        socket.emit('join room', {username, room});

        $('#loginForm').hide();
        $('#chatContainer').show();
        $('#roomName').text(`Room: ${room}`);
        $('#userNamePl').text(`User: ${username}`);
        $('#userList').show();
    });

    // Надсилання повідомлень
    $('#chatForm').submit(function (event) {
        event.preventDefault();
        const message = $('#message').val();
        socket.emit('chat message', message);
        $('#message').val('');
    });

    // Обробка отриманих повідомлень
    socket.on('chat message', function (messageObj) {
        const messageHTML = `
      <div class="chat-message">
        <div class="message-header">
          <span>
            <p class="message-user">${messageObj.username} ${messageObj.timestamp}</p>
            <p class="message-text">${messageObj.content}</p>
          </span>
        </div>
      </div>
    `;
        $('#chatMessages').append(messageHTML);
        $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
    });

    // Обновлення списку користувачів
    socket.on('user list', function (users) {
        $('#userListContent').html(users.map(user => `<li>${user}</li>`).join(''));
    });
});
