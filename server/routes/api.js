const express = require('express')
const router = express.Router();

const auth = require('./auth/auth.routes');

router.use('/auth', auth);

router.route('*').all((req, res, next) => {
    console.log('Auth!!');
    next();
});

module.exports = router;
