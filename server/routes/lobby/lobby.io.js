const socketio = require('socket.io');
const lobby = require('./lobby.views');
const cookie = require('cookie');


function init(io) {
    lobbyIO = io.of('/api/lobby');

    lobbyIO.on('connection', function (socket) {
        console.log("socket connected", socket.id);

        socket.on('i am', (url, fn) => {
            console.log('I am and my url is', url);
            socket.leave(socket.room);
            socket.join(url);
            socket.room = url;



            fn(socket.id);
        });

        socket.on('chat message', (to, payload) => {
            console.log('chat message to',to);
            socket.broadcast.to(socket.room).emit('chat message', payload)
            console.log('message: ' + payload.msg);
        });

        socket.on('ask room status', (to) => {
            console.log('Hello', to)
            socket.broadcast.to(to).emit('ask client status', to);
        });

        socket.on('report client status', (to, payload) => { 
            console.log('reporting status', to, payload)


            //TODO obfuscate playername
            socket.broadcast.to(to).emit('update client status', payload); // Broadcast?
            
        });
    
        socket.on('test meme', payload => {
        })


        socket.on('disconnect', function(){
            console.log('user disconnected', socket.id);
            lobby.purgeLobbyIOId(socket.id);
        });
    });
    return io;
}

module.exports = init;
