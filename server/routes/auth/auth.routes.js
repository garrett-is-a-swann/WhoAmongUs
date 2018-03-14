const express = require('express')
const router = express.Router();

const views = require('./auth.views')

const asyncMiddleware = fn =>
(req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};




router.post('/validate-username', (req, res, next) => {
    views.checkUsername(req.body.username).then((resp)=>{
        res.json(resp);
    }).catch((err) => {
        console.log('Error: api/auth/validate-username', err);
    })
});

router.post('/validate-email', (req, res, next) => {
    views.checkEmail(req.body.email).then((resp) => { 
        res.json(resp);
    }).catch((err) => {
        console.log('Error: api/auth/validate-email', err);
    });
});


router.route('/register')
.all((req, res, next) => {
    next();
})
.get((req,res,next) => {
    next(new Error('Not implemented'));})
.post(async (req,res,next) => {
    try {
        if( (resp = await views.createUser(req.body)).success )
            res.json(resp);
        else
            res.json(resp)
    } catch(e) {
        console.log(e);
        res.json({success:false, message:"Uh oh! We hit a snag. Our interweb guru's are taking a closer look!"});
    }
})
.put((req,res,next) => {
    next(new Error('Not implemented'));
})
.delete((req,res,next) => {
    next(new Error('Not implemented'));
})

router.route('/login')
.all((req, res, next) => {
    next();
})
.get((req,res,next) => {
    next(new Error('Not implemented'));
})
.post((req,res,next) => {
    res.json({success:false, msg:'Not yet implemented. Sorry LOL'});
})
.put((req,res,next) => {
    next(new Error('Not implemented'));
})
.delete((req,res,next) => {
    next(new Error('Not implemented'));
})


module.exports = router;
