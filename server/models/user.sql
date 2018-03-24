DROP TABLE IF EXISTS wau.user CASCADE;
CREATE TABLE wau.user
(
    id SERIAL PRIMARY KEY
    ,username varchar(64) UNIQUE NOT NULL
    ,salt varchar(64) NOT NULL
    ,hash varchar(256) NOT NULL
    ,first_name TEXT:
    ,last_name TEXT
    ,email varchar(325)
    ,email_validated boolean NOT NULL default FALSE
    ,date_created TIMESTAMP NOT NULL DEFAULT current_timestamp
    ,last_login TIMESTAMP NOT NULL DEFAULT current_timestamp
);
DROP INDEX IF EXISTS wau.user_email_idx CASCADE;
CREATE UNIQUE INDEX user_email_idx ON wau.user (email) WHERE email_validated = TRUE;
