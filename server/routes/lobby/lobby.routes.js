const express = require('express')
const router = express.Router();
const http = require('http').Server(express);

const lobby = require('./lobby.views');


//General lobby views
module.exports = (io) => {

    router.route('*').all((req, res, next) => {
        next();
    });

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
    
    router.route('/lobby-io')
    .post(async (req, res, next) => {
        try {
            // Do I care about parameters LOL NO.
            res.json(await lobby.registerLobbyIOId(req.body.lobby.split('/')[2], req.WhoAmongUs.uid, req.body.ioid));
        } catch(e) {
            console.log(e);
            res.json({success:false, message:'oh crap lmao'});
        }
    });

    router.route('/:id')
    // Get specific lobby info: Users, game rules, etc
    .get(async (req,res,next) => {
        try {
            var lobby_info  = await lobby.getLobbyContents(req.params.id, req.WhoAmongUs.uid, '');
            if(lobby_info.success) {
                console.log(lobby_info)
                res.json({success:true, json:lobby_info.json, capacity:lobby_info.capacity});
            } else {
                res.json({success:false, message:lobby_info.message});
            }

        } catch(e) {
            res.json({success:false, message:'You broke my code! SHAME.'});
        }
    })
    .post(async(req,res,next) => {
        try {
            var resp = await lobby.joinLobby(req.params.id, req.WhoAmongUs.uid, req.body.password);

            res.json( resp );
        } catch(e) {
            console.log(e);
            res.json({success:false, message:'You broke my code! SHAME.'});
        }
    })
    .put(async (req, res, next) => {
        console.log('Hello')
        res.json(await lobby.startGame(req.params.id, req.WhoAmongUs.uid));
    })
    .delete(async(req,res,next) => {
        res.json( await lobby.leaveLobby(req.WhoAmongUs.uid, req.params.id))
    })

    return router;
};
