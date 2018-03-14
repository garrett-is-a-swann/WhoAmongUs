/* This is the development server for the Mafia Game web app.
 * Its intent is to have "Plug and play" capability behind an
 *      arbitrary node server
 */
const express = require('express')
const mafia = require('./server/app.js')
const http = require('http');

const app = express();


// Forward everything to mafia router
app.use(mafia)
app.all('*', (req, res, next) => {
    console.log('Hi!!!!')
    next();
});

const port = process.env.PORT || '3002';
app.set('port', port);
app.set('trust proxy', '1.0.0.0')

const server = http.createServer(app);

server.listen(port, ()=> console.log(`API running on localhost:${ port }`));
