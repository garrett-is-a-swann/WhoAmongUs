const express = require('express')
const router = express.Router();

const crypto = require('crypto');
const hashconf = config.hash;

function hashPass(password, callback) {
    // generate a salt for pbkdf2
    crypto.randomBytes(hashconf.saltBytes, (err, salt) => {
        if (err) {
            return callback(err);
        }
        console.log(salt);

        crypto.pbkdf2(password, salt, hashconf.iterations, hashconf.hashBytes, 'sha512', (err, hash) => {

            if (err) {
                return callback(err);
            }

            var combined = [hash, salt];

            callback(null, combined);
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

module.exports = router;
