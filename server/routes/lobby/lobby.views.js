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

                        
    lid integer UNIQUE
    ,uid integer
    ,first_name varchar(12) default null
    ,last_name varchar(12) default null
    ,PRIMARY KEY (lid, uid)
    ,FOREIGN KEY (lid) REFERENCES wau.lobby (id)
    ,FOREIGN KEY (uid) REFERENCES wau.user (id)
    */


// TODO(Garrett): Add password feature. Add rulestring, add public/private
function createLobby(username, name, capacity, public, password, rule_string ) {
    return new Promise( async (resolve, reject) => {
        try {
            // Validate lobby name.
            name = name.length?name:username+"'s session";

            // Do passwords
            var resp = !password? {hash:null, salt:null}: await auth_.hashPass(password);
            db.query("SELECT id FROM wau.user WHERE username = $1",[username],(err, res) => {
                db.query('INSERT INTO wau.lobby (hostid, name, rule_string, capacity, public, hash, salt) values ($1, $2, $3, $4, $5, $6, $7) RETURNING hostid, name, id;'
                    , [res.rows[0].id, name, rule_string, capacity, public, resp.hash, resp.salt], async (errp, resp) => {
                    if(errp) {
                        reject(errp)
                    }
                    else {
                        try{
                            var join_resp = await joinLobby(resp.rows[0].hostid, resp.rows[0].id);
                            resolve({success:true, message:'Lobby created.'});
                        } catch (e) {
                            console.log(e);
                            reject({success:false, message:'There was an error. Our #1 meme professional is on duty to solve this for you.'});
                        }
                    }
                });
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
}

function getMyLobbies(username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT l.id, username, name, active, rule_string, l.salt IS NOT NULL as password, l.date_created, capacity, true as enrolled, players
                FROM wau.lobby l
                JOIN wau.user u ON u.id = l.hostid
                LEFT JOIN ( 
                    SELECT count(*) as players, lid
                    FROM wau.lobbyuser 
                    GROUP BY lid
                    ) lu ON l.id = lu.lid
                WHERE u.username = $1
                ORDER BY l.date_created desc
                `, [username], (err, res) => {
            if(err) {
                console.log('Unexpected Error:', err);
                reject(err);
            }
            else {
                resolve(res.rows);
            }
        });
    });
}

function getLobbies(uid) {
    return new Promise((resolve, reject) => {
        db.query(`
                SELECT l.id, username, name, active, rule_string, l.salt IS NOT NULL as password, 
                    l.date_created, capacity, enrolled, players
                FROM wau.lobby l
                JOIN wau.user u
                    ON u.id = l.hostid
                LEFT JOIN (
                    SELECT count(uid) as players, lid, bool_or(uid::varchar = $1) as enrolled
                    FROM wau.lobbyuser
                    GROUP BY lid
                    ) lu ON l.id = lu.lid
                WHERE u.username = $1
                    OR l.public = true
                ORDER BY l.date_created desc
                `, [uid], (err, res) => {
            if(err) {
                console.log('Unexpected Error:', err);
                reject(err);
            }
            else {
                resolve(res.rows);
            }
        });
    });
}



function joinLobby(reqUser, lid) {
    return new Promise((resolve,rej)=>{
        console.log('INSERT INTO wau.lobbyuser (lid, uid) VALUES ($1, $2);', lid, reqUser);
        db.query(`
                INSERT INTO wau.lobbyuser (lid, uid) VALUES ($1, $2);
                `, [lid, reqUser], (err, res) =>{
            if(err) {
                console.log('Error in query: joinLobby query 1')
                rej({success:false, message:'There was an error. Our #1 meme professional is on duty to solve this for you.'});
            }
            else {
                resolve({success:true, message:'Successfuly joined lobby.'});
            }
        });
    });
}



function leaveLobby(uid, lid) {
    return new Promise((resolve,rej)=>{
        db.query(`
                delete from wau.lobbyuser lu
                where exists (
                    select id
                    from wau.lobby
                    where date_started is null
                        and id = $2
                    )
                    and lu.uid = $1
                    and lu.lid = $2
                `, [uid, lid], (err, res) =>{
            if(err) {
                console.log('Error in query: leaveLobby query 1')
                rej({success:false, message:'There was an error. Our #1 meme professional is on duty to solve this for you.'});
            }
            else {
                console.log(lid, uid);
                resolve({success:true, message:'Successfully left lobby.'});
            }
        });
    });
}


module.exports = {
    createLobby:createLobby
    ,getUserLobbies:getMyLobbies
    ,getLobbies:getLobbies
    ,joinLobby:joinLobby
    ,leaveLobby:leaveLobby
}
