const express = require('express')
const router = express.Router();
const http = require('http').Server(express);

const game = require('./game.views');


//General game views
module.exports = (io) => {
    router.route('*').all((req, res, next) => {
        next();
    });

}
