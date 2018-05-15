DROP TABLE IF EXISTS wau.role_ability CASCADE;
CREATE TABLE wau.role_ability
(
    role_name TEXT 
    ,ability_name TEXT
    ,ratio smallint
    ,FOREIGN KEY (role_name) REFERENCES wau.role (name)
    ,FOREIGN KEY (ability_name) REFERENCES wau.ability (name)
);


