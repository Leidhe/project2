import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from datetime import datetime
from collections import defaultdict


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# List of the channels
rooms = ["lounge", "news", "test_100"]
# Messages is a dict with a pattern like {"channel": [["user", "message", "timestamp"]]}
messages_room = defaultdict(list)

# limit of messages allowed
limit = 100

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

    # Add new message to messages
    final_msg = [username, msg, date_time]
    if len(messages_room[room]) >= limit:
        messages_room[room].pop(0)

    messages_room[room].append(final_msg)

    list_messages = messages_room[room]

    emit("message", {'msg': msg, 'username': username,
                     'time_stamp': date_time ,'list_messages': list_messages}, room=room)


@socketio.on("join")
def join(data):
    username = data['username']
    room = data['room']
    print(room)
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
