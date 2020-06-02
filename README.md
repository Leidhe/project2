# Project 2 : Flack

#### Web Programming with Python and JavaScript

## You can try it on Heroku
#### https://project2-cs50-flack.herokuapp.com/


It is a simple chat application, in which users can send messages and view them in real time.

### Application.py

We have two lists called rooms and users, which store the channels and the users that are added to the application respectively. We also have a list-type dictionary called messages_ room with a pattern like {"channel": [["user", "message", "timestamp"]]}, which stores all messages from all channels.

This is the server side, which communicates with clients using sockets provided by Socket.IO.


### Static

There are custom CSS stylesheets that give a more attractive UI. There are also the two javascript files that communicate with the server to perform different actions, such as the name check or each time a user sends a message.

### Templates

There is only one file called index.html. Contains a navbar, a sidebar and the message display. In the sidebar we can see the different channels that we can access, in addition to being able to add new channels. In the message display we can see all the messages sent by users, with a limit of 100 messages per channel and be able to send messages to the channel.

### Personal Touch

My personal touch in this project is that users can delete their messages. A trash can icon appears when you hover your mouse over the corresponding message, and the message disappears with a CSS animation. It is also deleted from the server.
