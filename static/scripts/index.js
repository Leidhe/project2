if (!localStorage.getItem('username'))
    localStorage.setItem('username', "Manolo");



document.addEventListener('DOMContentLoaded', () => {

    

    let room;


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        socket.send("I am connected");

    });

    socket.on('message', data => {
        const username = localStorage.getItem('username');
        const span_user = document.createElement('span');
        const span_timestamp = document.createElement('span');
        const p = document.createElement('p');
        const br = document.createElement('br');
        if (data.time_stamp) {
            span_user.innerHTML = username
            span_timestamp.innerHTML = data.time_stamp;
            p.innerHTML = span_user.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;

            document.querySelector('#display-messages-pannel').append(p);
        }
        else{
            printSysMsg(data.msg)
        }

    });

    document.querySelector('#send_message').onclick = () => {
        socket.send({ 'msg': document.querySelector('#user_message').value, 'room': room });

        //Clear input area
        document.querySelector('#user_message').value = "";
    }

    //Room selection

    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML;
            if (newRoom == room) {
                msg = "You are already in " + room + "room.";
                printSysMsg(msg);
            }
            else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
            }

        }
    });

    //Leave room
    function leaveRoom(room) {
        const username = localStorage.getItem('username');
        socket.emit('leave', { 'username': username, 'room': room });
    }
    //Join room
    function joinRoom(room) {
        const username = localStorage.getItem('username');
        socket.emit('join', { 'username': username, 'room': room });

        //Clear
        document.querySelector('#display-messages-pannel').innerHTML = ""
    }

    //print system message
    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.innerHTML = msg;
        document.querySelector('#display-messages-pannel').append(p);

    }


});