const express = require('express')
const router = express.Router();

const config = require('../../configs/sessionconfig.json');


const session = require('client-sessions');
router.use(session({
    cookieName: 'WhoAmongUs'
    ,secret: config.cookieKey
    ,duration: 30 * 60 * 1000
    ,activeDuration: 5 * 60 * 1000
}));

const crypto = require('crypto');
const hashconf = config.hashconf;

function hashPass(password) {
    // generate a salt for pbkdf2
    return new Promise((resolve, reject) => {
        crypto.randomBytes(hashconf.saltBytes, (err, salt) => {
            if (err) {
                reject(err);
                return;
            }
            crypto.pbkdf2(password, salt, hashconf.iterations, hashconf.hashBytes, 'sha512', (err, hash) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({hash:hash, salt:salt});
            });
        });
    });
}

function verifyPassword(password, combined, callback) {
    crypto.pbkdf2(password, Buffer(combined[1],'hex'), hashconf.iterations, hashconf.hashBytes, 'sha512', (err, verify) => {
        if (err) {
            return callback(err, false);
        }
        console.log(combined);
        console.log(verify.toString('hex'));

        callback(null, verify.toString('hex') == combined[0]);
    });
}

module.exports = {router:router
    ,hashPass:hashPass
};
