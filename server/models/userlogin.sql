create table wau.userlogin
(
    uid SERIAL NOT NULL
    ,username varchar(64) UNIQUE NOT NULL
    ,salt varchar(64) NOT NULL
    ,hash varchar(256) NOT NULL
    ,date_created TIMESTAMP NOT NULL DEFAULT current_timestamp
    ,FOREIGN KEY(uid) REFERENCES wau.user (id)
);
