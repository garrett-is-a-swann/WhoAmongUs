const express = require('express')
const app = express();
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');


// Include Configs Here


module.exports = (server) => {
    // Include Routes Here
    const api = require('./routes/api')(server);



    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended:false}));

    router.use(express.static(path.join(__dirname, 'dist')));

    router.use((req, res, next) => {
        console.log('Time: %s --- Connection from %s -- For: %s', Date('GMT'), req.headers['x-forwarded-for'], req.path);
        next();
    });

    router.use('/api', api);

    // Catch-all route
    router.route('*')
    .all((req, res, next) => {
        next()
    })
    .get((req,res) => {
        res.sendFile(path.join(__dirname, 'dist/index.html'))
    })

    // Directory imports
    //router.use(express.static(path.join(__dirname, 'static')));
    //router.use(express.static(path.join(__dirname, 'configs')));

    return router;
}

