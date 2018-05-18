const socketio = require('socket.io');
const lobby = require('./lobby.views');
const cookie = require('cookie');

const db = require('../../db')


function init(io) {
    lobbyIO = io.of('/api/lobby');

    lobbyIO.on('connection', function (socket) {
        console.log("socket connected", socket.id);

        socket.on('i am', (url, fn) => {
            console.log('I am and my url is', url);
            socket.leave(socket.room);
            socket.join(url);
            socket.room = url;

            db.query(`
                SELECT lid, count(case when first_name is not null then 1 end)
                FROM (SELECT lid, first_name 
                        FROM wau.lobbyuser
                        WHERE lid = $1
                    ) _
                group by lid
                `, [url.substring(7,)], (err, resp) => {
                console.log('Check if game has started');
                if(resp.rows[0].count > 0) {
                    console.log('Redirect to game');
                    socket.emit('game start');
                }
                else {
                    console.log('Room not full yet tho.');
                }
            });

            fn(socket.id);
        });

        socket.on('game start', (to) => {
            socket.in(to).emit('game start');
        });

        socket.on('chat message', (to, payload) => {
            console.log('chat message to',to, payload);
            socket.broadcast.to(socket.room).emit('chat message', payload)
            console.log('message: ' + payload.msg);
        });

        socket.on('ask room status', (to) => {
            console.log("\tSomeone is asking for everyone's memes", to)
            socket.broadcast.to(to).emit('ask client status', to);
        });

        socket.on('report client status', (to, payload) => { 
            console.log('reporting status', to, payload)


            //TODO obfuscate playername
            socket.broadcast.in(to).emit('update client status', payload); // Broadcast?
            
        });


        socket.on('disconnect', function(){
            console.log('user disconnected', socket.id);
            lobby.purgeLobbyIOId(socket.id);
        });
    });
    return io;
}

module.exports = init;
