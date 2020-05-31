document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        // Check username
        if (!localStorage.getItem('username')) {
            $('#username_modal').modal({ backdrop: 'static', keyboard: false });
        }
        // Set username
        $('#username_modal').on('hidden.bs.modal', function (event) {
            var modal = $(this);
            var username = modal.find('.modal-body input').val();
            check_username(username);
        });


        var room = localStorage.getItem("room");
         // If you were on a channel before you left, you join that channel, if not a notice for you to join one
        if (room) {
            joinRoom(room);
        }
        else {
            const choose_room = document.createElement('h2');
            var chat_pannel = document.getElementById("display-messages-pannel");
            choose_room.classList = "join_leave";
            choose_room.innerHTML = "Please choose a channel or create a new one"
            chat_pannel.append(choose_room);
        }
    });

    var room = localStorage.getItem("room");

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

    //Deleting own message for all
    socket.on('delete_message', data => {
        username = data.username;
        time_stamp = data.time_stamp;
        msg = data.msg;
        var chats = document.getElementsByClassName("chat")

        //Search the message in DOM
        for (i = 0; i < chats.length; i++) {

            var childs = chats[i].children;
            var username1 = childs[0].innerHTML;
            var message1 = childs[2].innerHTML;
            var time_stamp1 = childs[3].innerHTML;

            if (username != localStorage.getItem('username')) {

                //when found it removes the message from DOM
                if (username1 == username && time_stamp1 == time_stamp && message1 == msg) {
                    chats[i].remove();
                    break;
                }
            }
        }
    });

    socket.on('add_a_channel', data => {
        var channel = data.channel;
        var error = data.error;

        if (error) {
            alert("Channel exists");
        }
        else {
            const rooms = document.querySelector('#rooms');
            const new_room = document.createElement('li');
            new_room.classList.add("select-room");
            new_room.innerHTML = channel;
            rooms.append(new_room);
        }
    });

    socket.on('check_user_wrong', data => {
        var username = data.username;
        var error = data.error;
        if(error){
            alert("Username already exists")
            $('#username_modal').modal({ backdrop: 'static', keyboard: false });
        }

        else{
            localStorage.setItem('username', username);
        }
    });

    //To send a message
    document.querySelector('#send_message').onclick = () => {
        socket.send({ 'msg': document.querySelector('#user_message').value, 'username': localStorage.getItem('username'), 'room': room });

        //Clear input area
        document.querySelector('#user_message').value = "";
    }

    //Channel selection
    document.addEventListener('click', event => {
        const element = event.target;
        if (element.className === 'select-room') {
            let newRoom = element.innerHTML;
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

    //Add a channel
    document.querySelector('#btn-add-channel').onclick = () => {
        var new_channel = document.querySelector('#add-new-channel').value;
        socket.emit('new_channel', { 'channel': new_channel });
        //Clear input
        document.querySelector('#add-new-channel').value = "";
    }

    //Check if the username exists on server
    function check_username(username){
        socket.emit('check_username', { 'username': username });

    }

    //Leave channel
    function leaveRoom(room) {
        const username = localStorage.getItem('username');
        socket.emit('leave', { 'username': username, 'room': room });

        //Clear chat pannel
        document.querySelector('#display-messages-pannel').innerHTML = "";
    }

    //Join channel
    function joinRoom(room) {
        document.querySelector('#display-messages-pannel').innerHTML = "";
        const username = localStorage.getItem('username');
        localStorage.setItem("room", room);
        socket.emit('join', { 'username': username, 'room': room });
    }

    //When someone joins the channel
    function printMessage(msg) {
        const p = document.createElement('p');
        p.classList.add("join_leave");
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

        container.classList = "chat";

        //To remove own messages only

        if (username == localStorage.getItem("username")) {
            delete_icon = document.createElement("i");
            delete_icon.classList.add("delete_button");
            delete_icon.classList.add("fa-trash-o");
            delete_icon.classList.add("fa-lg");

            container.innerHTML = delete_icon.outerHTML + span_user.outerHTML + br.outerHTML + message.outerHTML + span_timestamp.outerHTML;
            container.classList = "chat_own";
        }

        else { container.innerHTML = span_user.outerHTML + br.outerHTML + message.outerHTML + span_timestamp.outerHTML; }

        document.querySelector('#display-messages-pannel').append(container);
        var element = document.getElementById("display-messages-pannel");
        element.scrollTop = element.scrollHeight;
    }
    //Call the server to delete the message
    function delete_message(username, message, time_stamp) {
        var room = localStorage.getItem("room");
        socket.emit('delete_one_message', { 'username': username, 'message': message, 'time_stamp': time_stamp, 'room': room });
    }

    //When anyone press a delete_icon for delete a message
    document.addEventListener('click', event => {
        const element = event.target;
        if (element.className === 'delete_button fa-trash-o fa-lg') {
            var div = element.parentElement;
            var childs = div.children;
            var username = childs[1].innerHTML;
            var message = childs[3].innerHTML;
            var time_stamp = childs[4].innerHTML;
            console.log(username, message, time_stamp);

            delete_message(username, message, time_stamp);
            element.parentElement.style.animationPlayState = 'running';
            element.parentElement.addEventListener('animationend', () => {
                element.parentElement.remove();
            });
        }
    });
});