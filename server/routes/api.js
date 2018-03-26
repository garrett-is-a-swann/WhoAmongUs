const express = require('express')
const router = express.Router();

// Components
const auth = require('./auth/auth.routes');
const lobby = require('./lobby/lobby.routes');

// Middleware
const auth_ = require('./auth/auth.middleware');

const config = require('../configs/sessionconfig.json');

const session = require('client-sessions');
router.use(session({
    cookieName: 'WhoAmongUs'
    ,secret: config.cookieKey
    ,duration: 45 * 60 * 1000 // 45 minutes
    ,activeDuration: 25 * 60 * 1000 // 25 minutes
}));




router.use('/auth', auth);

router.use('/lobby', auth_.isAuth);
router.use('/lobby', lobby);

router.route('*').all((req, res, next) => {
    next();
});

module.exports = router;
