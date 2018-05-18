const socketio = require('socket.io');
const game = require('./game.views');
const lobby = require('../lobby/lobby.views');
const cookie = require('cookie');
const db = require('../../db')

function socketLookup(lid, name) {
    return new Promise((resolve, reject) => {
        db.query(`
            SELECT ioid
            FROM wau.lobbyuser
            WHERE lid = $1 and first_name = $2
            `, [lid, name], (err, res) => {
                resolve(res.rows[0].ioid);
            })
    })
}

function nameLookup(lid, io) {
    return new Promise((resolve, reject) => {
        db.query(`
            SELECT first_name, last_name
            FROM wau.lobbyuser
            WHERE lid = $1 and ioid = $2
            `, [lid, io], (err, res) => {
            console.log(err)
            if(!res.rows.length) {
                console.log('REFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGEREFRESH THE PAGE')
            }
            console.log('here', res.rows)
            resolve({first_name:res.rows[0].first_name, last_name:res.rows[0].last_name});
        })
    })
}

function getlid(url) {
    return url.split('/')[2];
}

function getTemporalEveryone(lid) {
    return new Promise((resolve, reject) => {
        db.query(`
            SELECT ioid
            FROM wau.lobbyuser 
                JOIN wau.role ON name = role
            WHERE lid = $1
                AND (faction = 1 OR (select period from wau.lobby where id = $1) = 'day')
            `, [getlid(lid)], (err, resp)=> {
            resolve(resp.rows)
        })
    });
}

function clockFactory(to) {
    return new Promise((res, rej) => {
        // Clock Setup
        db.query(`
            SELECT 
            phase_started as start, phase, phase_started + period_length as finish, period, current_timestamp + interval '07:00' /*what the actual fuck postgres*/ as now
            FROM 
            wau.lobby
            WHERE 
            id = $1
        `, [getlid(to)], (err, resp) => {

            var payload = {
                percentage: ((resp.rows[0].now - resp.rows[0].start) / (resp.rows[0].finish - resp.rows[0].start))*100
                ,start: resp.rows[0].start
                ,finish: resp.rows[0].finish
                ,now: resp.rows[0].now
                ,phase: resp.rows[0].phase
                ,day: resp.rows[0].period == 'day'
            }
            res(payload)
        })
    })
}

function init(io) {
    gameIO = io.of('/api/game');

    gameIO.on('connection', function (socket) {
        console.log("socket connected", socket.id);

        socket.on('i am', (url, fn) => {
            console.log('I am and my url is', url);
            socket.leave(socket.room);
            socket.join(url);
            socket.room = url;

            db.query(`
                SELECT first_name, last_name
                FROM wau.lobbyuser
                WHERE lid = $1
                `, [getlid(url)], (err, resp) => {
                console.log('players are:',resp.rows);
                fn(socket.id, resp.rows);
            });

        });


        socket.on('get bulletin', async (to) => {
            var player = await nameLookup(getlid(to), socket.id)
            console.log('GET BULL',getlid(to), player)
            db.query(`
                SELECT role, faction, first_name
                FROM wau.lobbyuser
                join wau.role on role = name
                WHERE lid = $1 and first_name = $2
                `, [getlid(to), player.first_name], async (err, resp) => {

                console.log(resp.rows)

                // TODO: Not just first day news.
                var payload = {
                    text: "Welcome, " + resp.rows[0].first_name + "! "
                    ,faction: resp.rows[0].faction == 0? 'Dog': 'Cat'
                }
                if(resp.rows[0].faction == 0) {
                    payload.text += "You are a dog whose goal is to remove the cats from this dog-only forum. Associate yourself with the players, some of which are cats. Every day (including today), you will vote to remove a player you think is a cat. You and your fellow dogs must move quickly though, because each night while you sleep the cats will come together to remove another from the forum!"
                } else {
                    payload.text += "You are a cat whose goal is to gain the majority in this dog-only forum. Associate yourself with the players, most of which are dogs. Every day (including today), you all will vote to remove a player from the forum. Each night while the dogs sleep, you and any fellow cats get a second vote to remove a dog from the forum!"
                }
                socket.emit('bulletin', payload);
            });
        });

        socket.on('chat message', async (to, payload) => {
            console.log('chat message to',to,payload);

            var player_from = await nameLookup(getlid(to), socket.id);
            db.query(`
                SELECT alive
                FROM wau.lobbyuser
                where lid = $1 and first_name = $2
                `,[getlid(to), player_from.first_name], async (err, resp) => {

                console.log(resp.rows[0].alive)
                if(resp.rows[0].alive){
                    payload.from = player_from.first_name;


                    if(payload.recipient){
                        var io = await socketLookup(getlid(to), payload.recipient);
                        socket.to(io).emit('chat message', payload)
                    } else {
                        socket.broadcast.to(to).emit('chat message', payload)
                    }
                    console.log('message: ' + payload.msg);
                }
            })

        });

        socket.on('ask room status', async (to) => {
            console.log("\tSomeone is asking for everyone's memes", to)
            socket.broadcast.to(to).emit('ask client status', to);


            db.query(`
                SELECT first_name, case when alive then 'mia' else 'dead' END as status
                FROM wau.lobbyuser
                WHERE lid = $1
                `,[getlid(to)], (err, res) => {

                for(var i=0; i < res.rows.length; i++) {
                    console.log(res.rows[i])
                    socket.emit('update client status', res.rows[i])
                }

            });


            var payload = await clockFactory(to);
            socket.emit('new clock info', payload);

        });


        socket.on('ask phase finished', async (to) =>{ 
            var payload = await clockFactory(to);
            if(payload.percentage > 100) {
                console.log('hullo')
                db.query(`
                    UPDATE wau.lobbyuser
                    set alive = false
                    WHERE lid = $1
                        AND first_name = (
                            SELECT first_name 
                            FROM wau.vote v
                                JOIN wau.lobbyuser lu on v.lid = lu.lid and fname = first_name
                                JOIN wau.role r on r.name = lu.role
                            WHERE v.lid = $1
                                and v.phase = (select phase from wau.lobby where id = $1)
                                and v.period = (select period from wau.lobby where id = $1)
                                and (faction = 1 or v.period = 'day')
                            group by first_name
                            order by count(v.real) desc, first_name asc
                            LIMIT 1
                        )
                    RETURNING *
                    `, [getlid(to)], (err, resp) => {

                    if( resp.rows.length ) {
                        new_status_payload ={
                            status: 'dead'
                            ,first_name: resp.rows[0].first_name
                        }
                        socket.broadcast.in(to).emit('update client status', new_status_payload); // Broadcast?
                        socket.emit('update client status', new_status_payload);
                    }

                    db.query(`
                        update wau.lobby
                        set phase_started = current_timestamp
                            ,phase = $3
                            ,period = $2
                            where id = $1
                        `,[getlid(to), payload.day?'night':'day', payload.day?payload.phase:payload.phase+1], async (err, resp) => {

                        console.log('Clock change')
                        socket.emit('new clock info', await clockFactory(to));
                    });

                })
            } else {
                socket.emit('new clock info', payload);
            }
        });


        socket.on('report client status', (to, payload) => { 
            console.log('reporting status', to, payload);


            db.query(`
                SELECT alive
                FROM wau.lobbyuser
                WHERE lid = $1 and first_name = $2
                `,[getlid(to), payload.first_name], (err, res) => {

                payload.status = res.rows[0].alive? payload.status: 'dead'

                socket.broadcast.in(to).emit('update client status', payload); // Broadcast?
                socket.emit('update client status', payload);
            });

            
        });


        socket.on('player vote', async (to, payload, fn) => {
            var player = await nameLookup(getlid(to), socket.id)
            console.log(player.first_name, 'just voted for', payload.vote);

            db.query(`
                INSERT INTO wau.vote
                (lid, phase, pname, fname, period)
                values
                ($1, (select phase from wau.lobby where id = $1), $2, $3, (select period from wau.lobby where id = $1))

                ON CONFLICT (phase, pname, real, period)

                DO UPDATE SET fname = $3;
                `,[getlid(to), player.first_name, payload.vote],(err, res) => {
            
                fn()

            })
        });
    
        socket.on('get player vote', async (to) => {
            db.query(`
                    SELECT fname as first_name, count(v.*) as total
                    FROM wau.vote v
                        JOIN wau.lobbyuser lu on v.lid = lu.lid and pname = first_name
                        JOIN wau.role r on r.name = lu.role
                    WHERE v.lid = $1
                        AND v.phase = (select phase from wau.lobby where id = $1)
                        AND v.period = (select period from wau.lobby where id = $1)
                        AND (faction = 1 or v.period = 'day')
                    GROUP by fname
                    ORDER by total, fname
                `, [getlid(to)], async (_, resp) => {
                    
                    var sendTo = await getTemporalEveryone(to);
                    console.log(sendTo, sendTo.length)
                    for(var i=0; i<sendTo.length; i++) {
                        console.log(sendTo[i].ioid, resp.rows)
                        socket.to(sendTo[i].ioid).emit('player vote', resp.rows)
                    }
                    // Why should i have to do this 4 srs.
                    socket.emit('player vote', resp.rows)
            })
        })

        socket.on('disconnect', function(){
            console.log('user disconnected', socket.id);
            lobby.purgeLobbyIOId(socket.id);
        });
    });
    return io;
}

module.exports = init;
