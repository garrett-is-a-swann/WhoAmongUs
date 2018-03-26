const express = require('express')
const router = express.Router();

const lobby = require('./lobby.views');

router.route('/create')
.post((req,res,next) => {
    res.json({success:false, message:"Uh oh! We hit a snag. Our interweb guru's are taking a closer look!"});
})

router.route('/user-lobbies')
.get(async(req,res,next) => {
    res.json({success:true, json: await lobby.getUserLobbies(req.WhoAmongUs.username) });
})


module.exports = router;
