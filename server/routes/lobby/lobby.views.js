const express = require('express')
const router = express.Router();

const auth_ = require('../auth/auth.middleware')

const db = require('../../db')


const ERR_MSG = 'There was an error. Our #1 meme professional is on duty to solve this for you.'

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
            db.query(`
                    SELECT id 
                    FROM wau.user 
                    WHERE username = $1
                    `,[username],(err, res) => {
                db.query(`
                        INSERT INTO wau.lobby 
                            (hostid, name, rule_string, capacity, public, hash, salt)
                        values 
                            ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING hostid, name, id;
                        `, [res.rows[0].id, name, rule_string, capacity, public, resp.hash, resp.salt], async (errp, resp) => {
                    if(errp) {
                        reject(errp)
                    }
                    else {
                        try{
                            var join_resp = await joinLobby(resp.rows[0].hostid, resp.rows[0].id, password);
                            resolve({success:true, message:'Lobby created.'});
                        } catch (e) {
                            console.log(e);
                            reject({success:false, message:ERR_MSG});
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


function getLobbyHash(lid) {
    return new Promise((resolve, reject) => {
        try {
            db.query(`
                    SELECT hash, salt
                    FROM wau.lobby
                    WHERE id = $1;
                `, [lid], (err, res) => {
                if(err) {
                    console.log(err)
                    reject(err)
                }
                else {
                    resolve({hash:res.rows[0].hash, salt:res.rows[0].salt, lid:lid})
                }
            });
        } catch (e) {
            console.log(e)
            reject(e)
        }
    });
}


function joinLobby(reqUser, lid, password) {
    return new Promise( async (resolve,reject)=>{
        var hashbrowns = await getLobbyHash(lid);

        if(hashbrowns.hash) { 
            try {
            var resp = await auth_.verifyPassword(password, hashbrowns.hash, hashbrowns.salt);
            if(!resp) {
                resolve({success:false, message:'Incorrect password.'});
                return;
            }
            } catch(e) {
                console.log(e);
                reject(e);
                return;
            }
        }
        if(resp != false) {
            try {
                db.query(`
                        INSERT INTO wau.lobbyuser 
                        (lid, uid) 
                        SELECT $1, $2
                        WHERE (
                            SELECT count(*)
                            FROM wau.lobbyuser
                            WHERE lid = $1 )
                            < (
                            SELECT capacity
                            FROM wau.lobby
                            WHERE id = $1 )
                        RETURNING *
                        `, [lid, reqUser], (err, res) =>{
                    if(err) {
                        console.log('Error in query: joinLobby query')
                        reject({success:false, message:ERR_MSG});
                        return;
                    }
                    else {
                        if(res.rows[0]) {
                            resolve({success:true, message:'Successfuly joined lobby.'});
                        } else {
                            resolve({success:false, message:'Room is at capacity.'});
                        }
                        return;
                    }
                });
            } catch(e) {
                console.log(e);
            }
        }
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
                            and id = lu.lid
                    )
                    AND (lu.uid = $1
                    OR $1 in (select hostid from wau.lobby l where l.id = $2))
                `, [uid, lid], (err, res) =>{
            if(err) {
                console.log('Error in query: leaveLobby query')
                rej({success:false, message:ERR_MSG});
            }
            else {
                resolve({success:true, message:'Successfully left lobby.'});
            }
        });
    });
}


function getLobbyOwner(lid) {
    new Promise(async (res, rej) => { 
        db.query(`
            SELECT hostid, 
            FROM wau.lobby
            WHERE id = $1
            `, [lid], (err, res) => {
                if(err) {
                    console.log('Error in query: getLobbyOwner');
                    rej({success:false, message:ERR_MSG})
                } else {
                    resolve({success:true, json:{hostid:res.rows[0].hostid}});
                }
            })
    });

}

function getLobbyUsers(lid) {
    return new Promise(async (res, rej) => { 
        db.query(`
            SELECT username,hostid = uid as ishost
            FROM wau.user u
            INNER JOIN wau.lobbyuser lu ON u.id = uid
            INNER JOIN wau.lobby l ON lid = l.id
            WHERE lid = $1
            `, [lid], (err, resp) => {
                if(err) {
                    console.log('Error in query: getLobbyContents');
                    rej({success:false, message:ERR_MSG})
                } else {
                    res({success:true, json:{users:resp.rows}});
                }
            })
    });
}

function isLobbyUser(lid, uid) {
    return new Promise((res, rej) => {
        db.query(`
            SELECT $1 = lid as lid, $2 in (select uid from wau.lobbyuser where lid = $1) as uid, hash, salt
            FROM wau.lobbyuser
            INNER JOIN wau.lobby on lid = id
            WHERE lid = $1
            `, [lid, uid], (err, resp) => { 
            if(err) {
                console.log('Error in query: getLobbyUser');
                rej({success:false, message:ERR_MSG});
            } else {
                res({success:true, json:resp.rows[0]});
            }

        })

    });
}

module.exports = {
    createLobby:createLobby
    ,getUserLobbies:getMyLobbies
    ,getLobbies:getLobbies
    ,joinLobby:joinLobby
    ,leaveLobby:leaveLobby
    ,getLobbyContents: (lid, uid, pass) => {
        return new Promise( async (resolve,reject)=>{
            var lobby_info = await isLobbyUser(lid, uid);
            if(lobby_info.json.lid && lobby_info.json.uid || false /* Maybe check password here */) {
                var users = await getLobbyUsers(lid);
                resolve({success:true, message:"here you go lol.", json:{users:users.json.users}})
            } else {
                resolve({success:false, message:"You don't have authentication for this room.", json:{}})
            }

        });
    }
    ,registerLobbyIOId: (lid, uid, ioid) => {
        return new Promise((res, rej) => {
            db.query(`
                UPDATE wau.lobbyuser
                set ioid = $3
                WHERE lid = $1 AND uid = $2;
                `, [lid, uid, ioid], (err, resp) => {
                    if(err) {
                        console.log('Error in query: register Lobby IO Id.');
                        res({success:false, message:ERR_MSG});
                    }
                    else {
                        console.log('Register socket: ', ioid);
                        res({success:true, message:'Successfully registered io.'});
                    }
                });
        });
    }
    ,purgeLobbyIOId: (ioid) => {
        return new Promise((res, rej) => {
            db.query(`
                UPDATE wau.lobbyuser
                set ioid = null
                WHERE ioid = $1;
                `, [ioid], (err, resp) => {
                    if(err) {
                        console.log('Error in query: purge Lobby IO Id.');
                        res({success:false, message:ERR_MSG});
                    }
                    else {
                        res({success:true, message:'Successfully purged io.'});
                    }
                });
        });
    }
    ,lookupIOId: (ioid) => {
        return new Promise((res, rej) => {
            db.query(`
                SELECT uid, first_name, last_name
                FROM wau.lobbyuser
                WHERE ioid = $1
                `, [ioid], (err, resp) => {
                if(err) {
                    console.log('Error in query: lookup Lobby IO Id.');
                    res({success:false, message:ERR_MSG});
                } else {
                    res({success:true, json:resp.rows[0]});
                }
            });
        });
    }
}
