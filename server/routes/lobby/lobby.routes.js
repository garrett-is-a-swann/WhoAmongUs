const express = require('express')
const router = express.Router();

const lobby = require('./lobby.views');

//General lobby views

router.route('/create')
.post((req,res,next) => {
    if( req.body.name != undefined && req.body.capacity && req.body.public != undefined && (req.body.password || req.body.password == null || req.body.password == false)){
        lobby.createLobby(req.WhoAmongUs.username, req.body.name, req.body.capacity, req.body.public, req.body.password, '').then(resp => { // '' is rule_string, but not checked so ''
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
    res.json({success:true, json: await lobby.getLobbies(req.WhoAmongUs.uid) });
})

//Specific lobby views

router.route('/lobby/:id')
.get(async(req,res,next) => {
    // Get specific lobby info: Users, game rules, etc
    console.log('get lobby', req.params.id)
    res.json({success:false, message:'Not yet implemented'})
})
.post(async(req,res,next) => {
    console.log('post lobby', req.params.id);
    console.log(req.WhoAmongUs);
    res.json( await lobby.joinLobby(req.WhoAmongUs.uid, req.params.id));
    // Sign up for a lobby
})
.delete(async(req,res,next) => {
    console.log('delete lobby', req.params.id)
    // Delete my lobby.
    res.json( await lobby.leaveLobby(req.WhoAmongUs.uid, req.params.id))
})

module.exports = router;
