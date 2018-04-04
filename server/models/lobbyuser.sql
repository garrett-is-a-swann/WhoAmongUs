DROP TABLE IF EXISTS wau.lobbyuser CASCADE;
CREATE TABLE wau.lobbyuser
(
    lid integer REFERENCES wau.lobby(id)
    ,uid integer REFERENCES wau.user(id)
    ,first_name varchar(12) default null
    ,last_name varchar(12) default null
    ,PRIMARY KEY (lid, uid)
    --,FOREIGN KEY (lid) REFERENCES wau.lobby (id)
    --,FOREIGN KEY (uid) REFERENCES wau.user (id)
);

CREATE OR REPLACE FUNCTION checkExists() RETURNS TRIGGER AS $$
    BEGIN
        -- If a lobby host leaves a lobby
            -- Remove all users from a lobby
            -- Delete lobby.
        IF (TG_OP = 'DELETE') THEN
            DELETE FROM wau.lobby l
            WHERE l.id = OLD.lid
                and l.hostid = OLD.uid
                and l.date_started is null;

            RAISE NOTICE 'DELETING Lobby[%] Hostid<%> if exists', OLD.lid, OLD.uid;
            RETURN OLD;
        ELSE
            RAISE EXCEPTION 'Somehow checkExists() attached to wau.lobbyuser was called on NOT delete';
            RETURN OLD;
        END IF;
    END
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_lobby_abandonment 
AFTER DELETE ON wau.lobbyuser
    FOR EACH ROW EXECUTE PROCEDURE checkExists();
