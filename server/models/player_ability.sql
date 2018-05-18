DROP TABLE IF EXISTS wau.player_ability CASCADE;
CREATE TABLE wau.player_ability
(
    ability_name TEXT REFERENCES wau.ability(name) 
    ,uid integer REFERENCES wau.user(id)
);

/*
insert into wau.player_ability
(name,faction,required,ratio)
values('Saint Bernard',0,true,25)*/
