const express = require('express')
const router = express.Router();

// Middleware
const auth_ = require('./auth/auth.middleware');
const config = require('../configs/sessionconfig.json');
const session = require('client-sessions');

module.exports = (server) =>{ 
    const io = require('socket.io')(server);
    
    router.use(session({
        cookieName: 'WhoAmongUs'
            ,secret: config.cookieKey
            ,duration: 2 * 60 * 60 * 1000 // 2 hours 
            ,activeDuration: 2 * 60 * 60 * 1000 // 2 hours
    }));


    // Components
    const auth = require('./auth/auth.routes');
    const lobby = require('./lobby/lobby.routes')(io);
    const lobbyio = require('./lobby/lobby.io')(io);



    router.use('/auth', auth);

    router.use('/lobby', auth_.isAuth);
    router.use('/lobby', lobby);

    router.route('*').all((req, res, next) => {
        next();
    });
    return router;
}
