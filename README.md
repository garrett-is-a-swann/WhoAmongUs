# WhoAmongUs
[Who Among Us](https://whoamong.us) is an online platform for a communication/bluffing game, similar to Town of Mafia, Werewolf, Mafia, etc.

## The Stack
* [Node/Express](https://github.com/garrett-is-a-swann/WhoAmongUs/tree/master/server)
* [Angular 5](https://github.com/garrett-is-a-swann/WhoAmongUs/tree/master/client)
* [PostgreSQL](https://github.com/garrett-is-a-swann/WhoAmongUs/tree/master/server/db)
    * PostgreSQL is dockerized. 
    * For running local, use [Postgres-Docker](https://hub.docker.com/_/postgres/). 
    * Sources config at /server/configs/dbconfig.json.

## Launching Local
Create some configs at /server/configs [(TODO (Garrett))](https://github.com/garrett-is-a-swann/WhoAmongUs/# "Create example configs for repo.")
```
ng build; node start server.js
```
Navigate to http://localhost:3002
