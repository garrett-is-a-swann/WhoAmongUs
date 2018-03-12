const express = require('express')
const router = express.Router();

const db = require('../../db')

const asyncMiddleware = fn =>
(req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};


const checkUsername = new Promise(username => {
} )


router.post('/validate-username', (req, res, next) => {
    console.log('asdf');
    const username = req.body.username;
    if(/^[a-zA-Z0-9._!@$~|-]{4,64}$/.exec(username) == null) {
        res.json({success:false, message:'Error: Improper format for username.'});
        return
    }
    db.query('SELECT username FROM wau.userlogin WHERE username = $1', [username], (err, qres) => {
        if(err) {
            console.log(err);
            return;
        }
        if(qres.rowCount) {
            console.log(qres.rows[0].username);
            const resp = {success: false, message:qres.rows[0].username+' has been taken.'}
            console.log(resp)
            res.json(resp);
        }
        else {
            const resp = {success: true, message:username+' is available.'}
            console.log(resp)
            res.json(resp);
        }

    })
})


router.all('/register', (req, res, next) => {
    console.log('post>>>')
    next();
})
.get((req,res,next) => {
    next(new Error('Not implemented'));
})
.post((req,res,next) => {
})
.put((req,res,next) => {
    next(new Error('Not implemented'));
})
.delete((req,res,next) => {
    next(new Error('Not implemented'));
})

router.all('/login', (req, res, next) => {
    next();
})
.get((req,res,next) => {
    next(new Error('Not implemented'));
})
.post((req,res,next) => {
})
.put((req,res,next) => {
    next(new Error('Not implemented'));
})
.delete((req,res,next) => {
    next(new Error('Not implemented'));
})


module.exports = router;
