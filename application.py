import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from datetime import datetime
from collections import defaultdict


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# List of channels
rooms = ["test_100"]

## List of users
users = []

# Messages is a dict with a pattern like {"channel": [["user", "message", "timestamp"]]}
messages_room = defaultdict(list)

# limit of messages allowed
limit = 100

# only for test the limit of 100 messages
for x in range(100):
    now = datetime.now()  # current date and time
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")
    final_msg = ["user1", x, date_time]
    messages_room["test_100"].append(final_msg)

@app.route("/")
def index():
    return render_template("index.html", rooms=rooms)
    

@socketio.on("message")
def message(data):
    username = data['username']
    msg = data['msg']
    room = data['room']
    now = datetime.now()  # current date and time
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")
    remove = False

    # Add new message to messages
    final_msg = [username, msg, date_time]
    if len(messages_room[room]) >= limit:
        messages_room[room].pop(0)
        remove = True

    messages_room[room].append(final_msg)


    emit("message", {'msg': msg, 'username': username,
                     'time_stamp': date_time ,'remove': remove}, room=room)


@socketio.on("delete_one_message")
def delete_one_message(data):
    room = data['room']
    username = data['username']
    message = data['message']
    time_stamp = data['time_stamp']

    #delete message of the room
    delete_message = [username, message, time_stamp]
    print(delete_message)
    list_messages_room = messages_room[room]
    print(list_messages_room)
    list_messages_room.remove(delete_message)

    #save the resulting list in the dictionary 
    messages_room[room]= list_messages_room

    emit("delete_message", {'username': username, 'msg': message, 'time_stamp': time_stamp}, room=room)


@socketio.on("new_channel")
def new_channel(data):
    error = False
    channel = data['channel']
    if channel in rooms:
        error = True
        emit('add_a_channel', {'error': error})
    else:
        rooms.append(channel)
        emit('add_a_channel', {'channel': channel}, broadcast = True)
    
@socketio.on("check_username")
def check_username(data):
    username = data['username']
    if username in users:
        emit('check_user_wrong', {'username':username, 'error': True})
    else:
        users.append(username)
        emit('check_user_wrong', {'username':username, 'error': False})

    
@socketio.on("join")
def join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    list_messages = messages_room[room]
    emit("join_leave", {'msg': username +
                        " has joined the " + room + " room.", 'list_messages': list_messages, 'username': username,}, room=room)
@socketio.on("leave")
def leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    emit("join_leave", {'msg': username +
                        " has left the " + room + " room.", 'username': username,}, room=room)
