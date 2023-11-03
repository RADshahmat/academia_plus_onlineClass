const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
app.get('/kaka', (req, res) => {
  res.render('kaka')
})
const DISCONNECT_TIMEOUT = 2000;
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    // Handle message events
    socket.on('message', message => {
      io.to(roomId).emit('createMessage', message);
    });

    socket.on('disconnect', () => {
      // Set a timeout to wait for 5 seconds before removing the user's grid
      const disconnectTimeout = setTimeout(() => {
        const room = Object.keys(socket.rooms)[1]; // Get the roomId from socket.rooms object
        const userId = socket.id; // Get the userId from socket.id
        socket.to(room).emit('user-disconnected', userId);
        socket.leave(room); // Make sure the socket leaves the room
      }, DISCONNECT_TIMEOUT);
  
      // Handle disconnecting event
      socket.on('disconnecting', () => {
        // Clear the disconnect timeout if the user sends a disconnecting signal
        clearTimeout(disconnectTimeout);
      });
    });
  });
});


server.listen(process.env.PORT||3030)
