const express = require('express')
const router = express.Router();

const auth = require('./auth/auth.views');

router.use('/auth', auth);

router.all('*', (req, res, next) => {
    console.log('Auth!!');
    next();
});

module.exports = router;
