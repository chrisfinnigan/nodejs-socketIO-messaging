let express = require('express');
let app = express()
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let port = process.env.PORT || 3000
let userList = []

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.listen(port, () => {
    console.log('Listening on port *: 3000');
});

io.on('connection', (socket) => {
    console.log('SOCKET.IO: User Connected', socket.id)

    // Handle Disconnect
    socket.on('disconnect', () => {
        userList = userList.filter(i => i.socketId !== socket.id)
        io.emit('contactsList', userList)
    });

    // Handle Attaching Username to the socket
    socket.on('attachUser', (username) => {
        userList.push({'username': username, 'socketId': socket.id}) 
        io.emit('contactsList', userList)
    });

    //Handle Connection Emits
    socket.emit('userConnected', socket.id)
    
    //Handle UI Events
    socket.on('handleActivity', (data) => {
        console.log('SOCKET.IO: New Activity Recieved', data)
        if (data.private === true) {
            socket.emit('updateActivityFeed', data);
        } else {
            if (data.sendTo == 'all') {
                socket.broadcast.emit('updateActivityFeed', data);
            } else {
                io.to(data.sendTo).emit('updateActivityFeed', data)
            }
        }
    });

    socket.on('clearActivityFeed', (data) => {
        console.log('SOCKET.IO: Clear Activity Feed', data)
        socket.emit('clearActivityFeed', data);        
    });
});