const express = require('express')
const router = express.Router();

const lobby = require('./lobby.views');

router.route('/create')
.post((req,res,next) => {
    console.log( req.body.name , req.body.capacity , req.body.public , (req.body.password || req.body.password == null))
    if( req.body.name != undefined && req.body.capacity && req.body.public && (req.body.password || req.body.password == null || req.body.password == false)){
        lobby.createLobby(req.WhoAmongUs.username, req.body.name, req.body.capacity, req.body.public, req.body.password || false, '').then(resp => { // '' is rule_string, but not checked so ''
            res.send(resp);
        }).catch(err=> {
            res.send(err);
        });
    }
    else
        res.send({success:false, message:'Whoops'})


})

router.route('/user-lobbies')
.get(async(req,res,next) => {
    res.json({success:true, json: await lobby.getUserLobbies(req.WhoAmongUs.username) });
})

router.route('/lobbies')
.get(async(req,res,next) => {
    res.json({success:true, json: await lobby.getLobbies() });
})

module.exports = router;
