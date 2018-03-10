CREATE TABLE wau.user
(
    id SERIAL PRIMARY KEY
    ,first_name TEXT
    ,last_name TEXT
    ,email varchar(325) UNIQUE NOT NULL
    ,date_created TIMESTAMP NOT NULL DEFAULT current_timestamp
);
