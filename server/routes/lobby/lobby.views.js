const express = require('express')
const router = express.Router();

const auth_ = require('../auth/auth.middleware')

const crypto = require('crypto');

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

function createLobby(username, name, rule_string) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                    `WITH sub AS ( SELECT id, a.name, b.rule_string FROM wau.user
                            JOIN
                            (SELECT $2 as name)a ON 1=1
                            JOIN
                            (SELECT $3 as rule_string)b ON 1=1
                            WHERE username = $1
                            )
                    INSERT INTO wau.lobby (hostid, name, rule_string)
                        SELECT id, name, rule_string FROM sub;`
                    , [username, name.length?name:username+"'s session", rule_string], (err, res) => {
                if(err) {
                    console.log(err)
                    reject(err)
                }
                else {
                    console.log({hash:res.rows[0].hash, salt:res.rows[0].salt, username:username})
                    resolve({hash:res.rows[0].hash, salt:res.rows[0].salt, username:username})
                }
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
        db.query(`SELECT username, name, active, rule_string, l.salt='' as password, l.date_created
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

module.exports = {
    getUserLobbies:getMyLobbies
}
