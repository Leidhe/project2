import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
rooms = ["lounge", "news"]

@app.route("/")
def index():
    return render_template("index.html", rooms=rooms)

@socketio.on("message")
def message(data):
    now = datetime.now() # current date and time
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")
    send({'msg': data['msg'] , 'time_stamp': date_time}, room=data['room'])

@socketio.on("join")
def join(data):

    join_room(data['room'])
    send({'msg': data['username'] + " has joined the " + data['room'] + " room."}, room = data['room'])

@socketio.on("leave")
def leave(data):

    leave_room(data['room'])
    send({'msg': data['username'] + " has left the " + data['room'] + " room."}, room = data['room'])
