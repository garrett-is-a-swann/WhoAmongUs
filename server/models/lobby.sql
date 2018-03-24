DROP TABLE IF EXISTS wau.lobby CASCADE;
CREATE TABLE wau.lobby
(
    id SERIAL PRIMARY KEY
    ,hostid INTEGER NOT NULL
    ,name TEXT -- If null, source player's name
    ,active BOOLEAN NOT NULL DEFAULT false
    ,rule_string TEXT NOT NULL 
    ,date_created TIMESTAMP NOT NULL DEFAULT current_timestamp
);
