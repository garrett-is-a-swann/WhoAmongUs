/* This is the development server for the Mafia Game web app.
 * Its intent is to have "Plug and play" capability behind an
 *      arbitrary node server
 */
const express = require('express')
const http = require('http');

const app = express();

const server = http.createServer(app);

const port = process.env.PORT || '3002';
app.set('port', port);
app.set('trust proxy', '1.0.0.0')

server.listen(port, ()=> console.log(`API running on localhost:${ port }`));

const mafia = require('./server/app.js')(server)

// Forward everything to mafia router
app.use(mafia)
app.all('*', (req, res, next) => {
    next();
});



