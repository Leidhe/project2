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

    if (room) {
        joinRoom(room);
    }
    else {
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
        if (remove) {
            var element = document.getElementById("display-messages-pannel");
            element.removeChild(element.firstChild);
        }
        chat_message(username, msg, time_stamp);

    });

    socket.on('delete_message', data => {
        username = data.username;
        time_stamp = data.time_stamp;
        msg = data.msg;
        var chats = document.getElementsByClassName("chat")
        console.log(chats);
        for(i = 0;i < chats.length; i++){

            var childs = chats[i].children;
            var username1 = childs[0].innerHTML;
            var message1 = childs[2].innerHTML;
            var time_stamp1 = childs[3].innerHTML;

            console.log(username1,message1,time_stamp1);
            console.log(username,msg,time_stamp);
            console.log(username == username1);
            console.log(message1 == msg);
            console.log(time_stamp1 == time_stamp);


            if (username1 == username && time_stamp1 == time_stamp && message1 == msg) {
                chats[i].remove();
            }
        }
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

        //Clear chat pannel
        document.querySelector('#display-messages-pannel').innerHTML = "";
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

        //To remove own messages only

        if (username == localStorage.getItem("username")) {
            delete_button = document.createElement("button");
            delete_button.classList.add("delete_button");
            delete_button.type = "button";
            delete_button.innerHTML = "Remove";
            container.innerHTML = span_user.outerHTML + br.outerHTML + message.outerHTML + span_timestamp.outerHTML + delete_button.outerHTML;
        }


        else { container.innerHTML = span_user.outerHTML + br.outerHTML + message.outerHTML + span_timestamp.outerHTML; }
        container.classList.add("chat");

        document.querySelector('#display-messages-pannel').append(container);
    }

    function delete_message(username, message, time_stamp) {
        var room = localStorage.getItem("room");
        socket.emit('delete_one_message', { 'username': username, 'message': message, 'time_stamp': time_stamp, 'room': room });
    }

    document.addEventListener('click', event => {
        const element = event.target;
        if (element.className === 'delete_button') {
            var div = element.parentElement;
            var childs = div.children;
            var username = childs[0].innerHTML;
            var message = childs[2].innerHTML;
            var time_stamp = childs[3].innerHTML;

            console.log(username);
            console.log(message);

            console.log(time_stamp);

            delete_message(username, message, time_stamp);
            element.parentElement.style.animationPlayState = 'running';
            element.parentElement.addEventListener('animationend', () => {
                element.parentElement.remove();
            });
        }
    });
});



