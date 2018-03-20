const express = require('express')
const router = express.Router();

const config = require('../../configs/sessionconfig.json');
const hashconf = config.hashconf;
const crypto = require('crypto');

const views = require('./auth.views')




// "Private"

function verifyPassword(password, hash, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, Buffer(salt, 'hex'), hashconf.iterations, hashconf.hashBytes, 'sha512', (err, verify) => {
            if (err) { // wtf lmao
                console.log('wtf lmao', err);
                reject(err);
            }
            resolve(verify.toString('hex') == hash);
        });
    });
}

// Public

function authUser(username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(username)
            const username_check = await views.checkUsername(username);
            console.log('hello+!!!!', username_check)
            if(username_check.mode == 0) {
                reject({success:false, mode: 0, message:'Username is not in use.'});
                return;
            }
            if(username_check.mode == -1) {
                reject(username_check);
                return;
            }
            const password_check = await views.checkPassword(password)
            if(password_check.mode != 1) {
                reject(password_check);
                return;
            }
            hashbrowns = await views.getUserHash(username);
            verifyPassword(password, hashbrowns.hash, hashbrowns.salt).then(resp => {
                if(resp) {
                    resolve(true)
                } else {
                    reject({success:false, mode:0, message:'Incorrect password.'})
                }
            }).catch(e => {
                console.log(e)
                reject(e)
            });
        } catch(e) {
            console.log(e);
            reject(e)
        }
        
    });
}

module.exports = {
    router:router
    ,verifyPassword:verifyPassword
    ,authUser:authUser
};
