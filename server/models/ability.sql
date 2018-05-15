DROP TABLE IF EXISTS wau.ability CASCADE;
CREATE TABLE wau.ability
(
    name TEXT PRIMARY KEY
    ,text text NOT null
    ,faction smallint
    ,required boolean
    --,ratio smallint
    --,target_count smallint
    ,self_cast boolean
    --,use_count smallint
    ,use_refresh boolean default true
    --,role_unique boolean default false
    ,phase smallint default 0 --0:day, 1:night, 2:either
    ,instant boolean default false
);
