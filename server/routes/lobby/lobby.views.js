const express = require('express')
const router = express.Router();

const auth_ = require('../auth/auth.middleware')

const db = require('../../db')

/*
    id SERIAL PRIMARY KEY
    ,hostid INTEGER NOT NULL
    ,name TEXT -- If null, source player's name
    ,active BOOLEAN DEFAULT false
    ,salt varchar(64) DEFAULT NULL -- NULL == false
    ,hash varchar(256) DEFAULT NULL
    ,rule_string TEXT NOT NULL 
    ,date_created TIMESTAMP NOT NULL DEFAULT current_timestamp
    */

// TODO(Garrett): Add password feature. Add rulestring, add public/private
function createLobby(username, name, capacity, public, password, rule_string ) {
    return new Promise((resolve, reject) => {
        try {
            name = name.length?name:username+"'s session"
            db.query("SELECT id FROM wau.user WHERE username = $1",[username],(err, res) => {
                db.query('INSERT INTO wau.lobby (hostid, name, rule_string, capacity, public) values ($1, $2, $3, $4, $5) RETURNING hostid, name;'
                    , [res.rows[0].id, name, rule_string, capacity, public], (errp, resp) => {
                    if(errp) {
                        reject(errp)
                    }
                    else {
                        console.log('Lobby:', resp.rows[0].hostid, resp.rows[0].name, 'created');
                        resolve({success:true, message:'Lobby created'});
                    }
                });
            });
        } catch (e) {
            console.log(e)
            reject(e)
        }
    });
}

// TODO Change this to get all lobbies, not just host lobbies?
function getMyLobbies(username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username, name, active, rule_string, l.salt='' as password, l.date_created, capacity
                FROM wau.lobby l
                JOIN wau.user u ON u.id = l.hostid
                WHERE u.username = $1
                `, [username], (err, res) => {
            if(err) {
                console.log('Unexpected Error:', err);
                reject(err);
            }
            else {
                console.log(res.rows);
                resolve(res.rows);
            }
        });
    });
}


// TODO Change this to get all lobbies, not just host lobbies?
function getLobbies() {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username, name, active, rule_string, l.salt='' as password, l.date_created, capacity
                FROM wau.lobby l
                JOIN wau.user u ON u.id = l.hostid
                `, [], (err, res) => {
            if(err) {
                console.log('Unexpected Error:', err);
                reject(err);
            }
            else {
                console.log(res.rows);
                resolve(res.rows);
            }
        });
    });
}



module.exports = {
    createLobby:createLobby
    ,getUserLobbies:getMyLobbies
    ,getLobbies:getLobbies
}


