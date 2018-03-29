DROP TABLE IF EXISTS wau.lobbyuser CASCADE;
(
    lid integer UNIQUE
    ,uid integer
    ,first_name varchar(12) default null
    ,last_name varchar(12) default null
    ,PRIMARY KEY (lid, uid)
    ,FOREIGN KEY (lid) REFERENCES wau.lobby id
    ,FOREIGN KEY (uid) REFERENCES wau.user id
);
