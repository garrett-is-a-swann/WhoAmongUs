import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketComponent } from '../../socket/socket.component';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
    private authenticated:any = false;
    states = {
        name: ''
        ,id:null
        ,status: 'mia'
    }/*{username:this.states.name, id:this.states.id, status:this.states.status}*/
    status_clock= null

    players = [
    ]

    constructor(private auth: AuthService
        ,private router: Router
        ,private http: HttpClient) { }

    socket = io('https://whoamong.us/api/lobby');

    async ngOnInit() {
        console.log('hasdlfj')
        await this.getRoomContents();

        /*
        this.auth.stateChangeEmitter().subscribe(async (auth, username) =>{
            this.authenticated = auth;
            var user = this.auth.whoAuthenticated()
            this.states.name = user.user;
            this.states.id = user.uid;

        }) */
        this.authenticated = await this.auth.isAuthenticated();
        var user = this.auth.whoAuthenticated();
		console.log(user, this.players);
        console.log('hey look at me lol',this.players.filter(player => player.name == user.user));
        this.states = this.players.filter(player => player.name == user.user)[0];
        this.states.status ='mia';


        this.doSockets();
        this.stillAlive();
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }

    doSockets() {
		// Introduce ourselves to the server.
        this.socket.emit('i am', this.router.url, (id) => {
			// On introduction, make sure the server logs us (probably unnecessary?)
            this.http.post('/api/lobby/lobby-io', {lobby:this.router.url, ioid:id})
            .subscribe((data:any) =>{
                if(data.success) {
                }
                else {
                    console.log('lmao oh no');
                }
            });
            
        });

        // Server asks for our current status. afk? Emit our status if we're around.
        this.socket.on('ask client status', (to) => {
            console.log('Someone asked for our memes', to);
            this.socket.emit('report client status', to, this.states);
        });

        this.socket.on('update client status', (payload)=> {
			console.log(this.players.filter(player => player.name == payload.name))
            this.players.filter(player => player.name == payload.name)[0].status = payload.status;
        });


		// Ask for room status.
        this.socket.emit('ask room status', this.router.url);

    }

    log(payload) {
        console.log(payload)
    }


    getRoomContents(){
        return new Promise((res, rej) => {
            this.http.get('/api'+this.router.url)
            .subscribe((data:any) =>{
                console.log(data)
                if(data.success) {
                    this.players = []
                    for(var i=0; i<data.json.users.length; i++) {
                        var item = data.json.users[i]
                        this.players.push(
                            {name:item.username
                            ,ishost:item.ishost
                            ,status:(item.username != this.states.name?'mia':'here')});
                    }
                    console.log(this.players);
                    res();
                }
                else {
                    console.log('lmao oh no');
                    rej();
                }
            });
        })
    }



    stillAlive() {
		console.log(this.states);
		console.log(this.players);
        this.restart();
        if(this.states.status != 'here') {
            this.states.status = 'here';
            try {
                this.players.filter(player => player.name == this.states.name)[0].status = 'here';
            } catch(e) {
                console.log('Threwup', this.players.filter(player => player.name == this.states.name)[0]);
                console.log('Threp', this.players, this.states);
            }
            this.socket.emit('report client status', this.router.url, this.states);
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
                this.players.filter(player => player.name == this.states.name)[0].status = this.states.status;
                console.log('becoming afk', this.states);
                this.socket.emit('report client status', this.states)
            }, 1000 * 60 * 5)
        }
    }
}
