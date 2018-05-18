DROP TABLE IF EXISTS wau.role CASCADE;
CREATE TABLE wau.role
(
    name TEXT PRIMARY KEY 
    ,faction smallint
    ,required boolean
    ,ratio smallint default 100
    ,picture_id text default null
);

/*
insert into wau.role
(name,faction,required,ratio)
values('Saint Bernard',0,true,25)*/
