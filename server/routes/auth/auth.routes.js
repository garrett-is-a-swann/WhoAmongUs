const express = require('express')
const router = express.Router();

const views = require('./auth.views')
const auth_ = require('./auth.middleware')

const config = require('../../configs/sessionconfig.json');

const session = require('client-sessions');
router.use(session({
    cookieName: 'WhoAmongUs'
    ,secret: config.cookieKey
    ,duration: 45 * 60 * 1000 // 45 minutes
    ,activeDuration: 25 * 60 * 1000 // 25 minutes
}));



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


router.route('/login')
.all((req, res, next) => {
    next();
}).post( async (req,res,next) => {
    auth_.authUser(req.body.username, req.body.password).then(resp => {
        console.log(resp);
        if(resp == true) {
            req.WhoAmongUs.username = true;
        }
        res.send({success:true, mode:1, message:'Authentication successful.'})
    }).catch(err => {
        console.log(err)
        res.json(err);
    });
})


router.route('/logout')
.all((req, res, next) => {
    next();
}).post((req, res) => {
    req.WhoAmongUs.reset();
    res.json({success: true, message:'Logout successful'});
});


module.exports = router;
