document.addEventListener('DOMContentLoaded', () => {
    // Check username
    if (!localStorage.getItem('username')) {
        $('#username_modal').modal({ backdrop: 'static', keyboard: false });
    }
    // Set username
    $('#username_modal').on('hide.bs.modal', function (event) {
        var modal = $(this)
        var username = modal.find('.modal-body input').val();
        localStorage.setItem('username', username);
    })

    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // If you were on a channel before you left, you join that channel, if not a notice for you to join one
    var room = localStorage.getItem("room");

    if (room){
        joinRoom(room);
    }
    else{
        const choose_room = document.createElement('h2');
        var chat_pannel = document.getElementById("display-messages-pannel");

        choose_room.innerHTML = "Please choose a channel or create a new one"
        chat_pannel.append(choose_room);
    }

    // When join and leave a channel
    socket.on('join_leave', data => {
        const username = data.username;
        list_messages = data.list_messages;        
        if (list_messages && username == localStorage.getItem('username')) {
            list_messages.forEach(function (element) {
                var username = element[0];
                var msg = element[1];
                var time_stamp = element[2];
                chat_message(username, msg, time_stamp);
            });
        }
        printMessage(data.msg);

        //Scroll down to the bottom
        var element = document.getElementById("display-messages-pannel");
        element.scrollTop = element.scrollHeight;
    });

    // When a message is received
    socket.on('message', data => {
        username = data.username;
        time_stamp = data.time_stamp;
        list_messages = data.list_messages;
        msg = data.msg;
        remove = data.remove;
        //If there are more than 100 messages, the first one is deleted from the chat
        if(remove){
            var element = document.getElementById("display-messages-pannel");
            element.removeChild(element.firstChild);
        }
        chat_message(username, msg, time_stamp);

    });

    //To send a message
    document.querySelector('#send_message').onclick = () => {
        socket.send({ 'msg': document.querySelector('#user_message').value, 'username': localStorage.getItem('username'), 'room': room });

        //Clear input area
        document.querySelector('#user_message').value = "";
    }

    //Channel selection
    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML;
            if (room) {
                if (newRoom == room) {
                    msg = "You are already in " + room + " room.";
                    printMessage(msg);
                }
                else {
                    leaveRoom(room);
                    joinRoom(newRoom);
                    room = newRoom;
                }
            }
            else {
                joinRoom(newRoom);
                room = newRoom;
            }
        }
    });

    //Leave channel
    function leaveRoom(room) {
        const username = localStorage.getItem('username');
        socket.emit('leave', { 'username': username, 'room': room });
    }
    //Join channel
    function joinRoom(room) {
        const username = localStorage.getItem('username');
        localStorage.setItem("room", room);
        socket.emit('join', { 'username': username, 'room': room });
    }

    //When someone joins the channel
    function printMessage(msg) {
        const p = document.createElement('p');
        p.innerHTML = msg;
        document.querySelector('#display-messages-pannel').append(p);
    }

    //To create a message with its corresponding format in the chat
    function chat_message(username, msg, time_stamp) {
        const span_user = document.createElement('span');
        const span_timestamp = document.createElement('span');
        const container = document.createElement('div');
        const message = document.createElement('p');
        const br = document.createElement('br');
        span_timestamp.classList.add("time-right");

        span_user.innerHTML = username
        span_timestamp.innerHTML = time_stamp;
        message.innerHTML = msg;
        container.innerHTML = span_user.outerHTML + br.outerHTML + message.outerHTML + span_timestamp.outerHTML;
        container.classList.add("chat");

        document.querySelector('#display-messages-pannel').append(container);
    }


    function delete_message(msg) {
        //To implement
    }
});