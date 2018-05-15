import { Component, OnInit } from '@angular/core';
import { SocketComponent } from '../../socket/socket.component';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
    private authenticated:any = false;
    room_id:string ='';
    my_id:string=''
    socket = io('https://whoamong.us/api/game');
    status_clock= null;
    states:any = {
        first_name:null
        ,day:true
        ,status:''
    }
    players = [
    ]

    chats = [];

    ability_chamber=null;
    abilities = [
        {
            name:'Spyglass'
            ,text:'Spy on a player of your choice until the end of the phase.'
            ,uses:1
            ,self:false
        },
        {
            name:'Save'
            ,text:'Protect a pup during the night.'
            ,uses:1
            ,self:true
        }
    ]

    my_vote = null;
    vote(player) {
        this.my_vote = player.first_name
        this.socket.emit('player vote', this.room_id, {'vote':this.my_vote}, () => {
            this.socket.emit('get player vote', this.room_id)
        })
    }
    votes(player) {
        return Math.floor((((player.votes||0))/this.players.length)*100)
    }

    getPlayer(name) {
		return this.players.filter(player => player.first_name == name)[0];
    }

    getPlayerIndex(name) {
        return this.players.map(e=>{return e.first_name}).indexOf(name);
    }

    constructor(private auth: AuthService
        ,private router: Router
        ,private http: HttpClient
        ) { }

    async ngOnInit() {


        this.states.percent_finished = 0;
		this.room_id = this.router.url;

        this.authenticated = await this.auth.isAuthenticated();
        var user = this.auth.whoAuthenticated();

        this.states.status ='mia';


        await this.doSockets();
        this.stillAlive();
    }

    ngOnDestroy() {
 		clearInterval(this.states.clock);
		this.states.status = 'mia';
		this.socket.emit('report client status', this.room_id, this.stateBuilder());
		this.socket.disconnect();
		console.log(this.states);
    }


    selectPlayer(player) {
        if(player == null) {
            delete this.ability_chamber.locked;
        }
        if(this.ability_chamber == null) {
            this.pushChat(player)
        }
        else {
            this.fireAbility(player)
        }
    }

    chamberAbility(ability) {
        this.ability_chamber = ability;
        console.log(this.ability_chamber)
    }
    fireAbility(player) {
        if(player) {
            console.log('Firing ability at', player.first_name);
            this.ability_chamber.locked = player.first_name;
        }
        this.ability_chamber = null;
    }

    async doSockets() {
        // Introduce ourselves to the server.
        await new Promise((resolve, _) => {
            this.socket.emit('i am', this.room_id, (id, players) => {
                console.log('players:',players)
                this.players = players
                this.my_id = id
                this.http.post('/api/lobby/lobby-io', {lobby:this.room_id, ioid:id})
                .subscribe((data:any) =>{
                    console.log('data', data)
                    if(data.success) {
                        var _states = players.filter(player => player.first_name == data.you_are.name)[0];
                        _states.day = this.states.day;
                        _states.percent_finished = this.states.percent_finished;
                        this.states = _states;
                        console.log(this.players, this.getPlayerIndex(this.states.first_name), this.states.first_name)
                        this.players.splice(this.getPlayerIndex(this.states.first_name),1);
                        console.log([this.states].concat(this.players))
                        this.players = [this.states].concat(this.players);
                        resolve();
                    }
                    else {
                        console.log('lmao oh no');
                        resolve();
                    }

                    this.socket.emit('get bulletin', this.room_id);
                });
            });

        });
        // Listening definitions
        // Server asks for our current status. afk? Emit our status if we're around.
        this.socket.on('ask client status', (to) => {
            console.log('Someone asked for our memes', to, this.states);
            this.socket.emit('report client status', to, this.stateBuilder());
        });

        this.socket.on('bulletin', payload => {
            this.states.bulletin = payload.text;
            this.states.faction = payload.faction;
        });

        this.socket.on('update client status', async (payload)=> {
            console.log('this should fire', payload)
            try {
                console.log(payload, this.players)
				console.log(this.players.filter(player => player.first_name == payload.first_name))
                this.players.filter(player => player.first_name == payload.first_name)[0].status = payload.status;
			} catch(e) {
				this.players.filter(player => player.first_name == payload.first_name)[0].status = payload.status;
			}
        });

        this.socket.on('player vote', (payload) => {
            console.log(payload)
            for(var i=0; i<this.players.length; i++) {
                this.players[i].votes = 0;
            }
            for(var i=0; i<payload.length; i++) {
                var player = this.getPlayer(payload[i].first_name)
                player.votes = payload[i].total;
                console.log('right here', this.votes(player))
               
            }

        /*
            var player = this.getPlayer(payload.vote)
            player.votes = player.votes+1 || 1;
            console.log(payload)
         */
        });




        // Sync Clock
        this.socket.on('new clock info', (payload) => {
            this.states.server_offset = (new Date(payload.now).getTime()) - (new Date().getTime())
            this.states.percet_finished = payload.percet_finished;
            this.states.start = new Date(payload.start);
            this.states.finish = new Date(payload.finish);
            this.states.phase_number = payload.phase;
            this.states.day = payload.day;

            this.states.clock = setInterval(() => {
                var now:any = new Date(new Date().getTime() + this.states.server_offset);
                this.states.percent_finished = (((now - this.states.start) / (this.states.finish - this.states.start))*100);
                if(this.states.percent_finished > 100) {
                    this.socket.emit('ask phase finished', this.room_id);
                }
            }, 750);
        })

        // Emits:

		// Ask for room status.
        this.socket.emit('ask room status', this.room_id);
        this.socket.emit('get player vote', this.room_id);

    }


    pushChat(player) {
        if(player.first_name == this.states.first_name) {
            return;
        }
        this.chats.forEach((o,i,a) => a[i].toggle = false);
        if(this.chats.filter(chat => chat.first_name == player.first_name)[0]) {
            var index = this.chats.map(e=>{return e.first_name}).indexOf(player.first_name);
            this.chats.splice(index,1)
        }
        this.chats.push({first_name:player.first_name, last_name:player.last_name, toggle:true})
    }

    closeChat(player) {
        console.log(this.chats.filter(chat => chat.first_name != player.first_name), player)
        this.chats = this.chats.filter(chat => chat.first_name != player.first_name)
    }




    stateBuilder() {
        return {first_name:this.states.first_name
            ,last_name:this.states.last_name
            ,percent_finished:this.states.percent_finished
            ,status:this.states.status
        }
    }


    stillAlive() {
        this.restart();
        if(this.states.status != 'here' && this.states.status != 'dead') {
            this.states.status = 'here';
            try {
                this.players.filter(player => player.first_name == this.states.first_name)[0].status = 'here';
            } catch(e) {
                console.log('Threwup', this.players.filter(player => player.first_name == this.states.first_name)[0]);
                console.log('Threp', this.players, this.states);
            }
            this.socket.emit('report client status', this.room_id, this.stateBuilder());
        }
    }

    stop(/*clock*/) {
        if(this.status_clock != null) {
            clearTimeout(this.status_clock)
        }
    }

    restart(/*clock*/) {
        this.stop()
        if(!['out'].includes(this.states.status)) {
            this.status_clock = setTimeout(()=>{
                this.states.status = 'afk';
                this.players.filter(player => player.first_name == this.states.first_name)[0].status = this.states.status;
                console.log('becoming afk', this.states);
                this.socket.emit('report client status', this.room_id, this.stateBuilder())
            }, 1000 * 60 * 5)
        }
    }
}
