DROP TABLE IF EXISTS wau.vote CASCADE;
CREATE TABLE wau.vote
(
    lid integer REFERENCES wau.lobby(id)
        ON DELETE cascade
    ,phase smallint
    ,pname varchar(24) -- REFERENCES wau.lobbyuser (first_name)
    ,fname varchar(24) -- REFERENCES wau.lobbyuser (first_name)
    ,real boolean default true
    ,period varchar(10)
    ,UNIQUE(phase, pname, real, period)
);

--CREATE OR REPLACE FUNCTION upsert_wau_vote(
