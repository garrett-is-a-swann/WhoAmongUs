DROP TABLE IF EXISTS wau.lobby CASCADE;
CREATE TABLE wau.lobby
(
    id SERIAL PRIMARY KEY
    ,public boolean default true
    ,hostid integer NOT null
    ,name text -- If null, source player's name
    ,phase smallint default 0
    ,phase_length interval default '00:15'
    ,period varchar(10) default 'day'
    ,salt varchar(64) default null -- null == false
    ,hash varchar(256) default null
    ,rule_string text NOT null 
    ,capacity integer NOT null default 8
    ,date_created TIMESTAMP NOT null default current_timestamp
    ,date_started TIMESTAMP default null
    ,FOREIGN KEY (hostid) REFERENCES wau.user (id)
);
