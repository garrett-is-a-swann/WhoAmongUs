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
	room_id = '';
	room_capacity = -1;
    states = {
        name: ''
        ,id:null
        ,status: 'mia'
    }/*{username:this.states.name, id:this.states.id, status:this.states.status}*/
    status_clock= null;
	//check_interv= null;

    players = [
    ]

    constructor(private auth: AuthService
        ,private router: Router
        ,private http: HttpClient) { }

    socket = io('https://whoamong.us/api/lobby');

    async ngOnInit() {
		this.room_id = this.router.url;
		//this.check_interv = setInterval(()=>{this.getRoomContents()}, 1000*60);
        await this.getRoomContents();

        this.authenticated = await this.auth.isAuthenticated();
        var user = this.auth.whoAuthenticated();
        this.states = this.players.filter(player => player.name == user.user)[0];
        this.states.status ='mia';


        this.doSockets();
        this.stillAlive();
    }

    ngOnDestroy() {
 		//clearInterval(this.check_interv);
		this.states.status = 'mia';
		this.socket.emit('report client status', this.room_id, this.states);
		this.socket.disconnect();
		console.log(this.states);
    }

    doSockets() {
		// Introduce ourselves to the server.
        this.socket.emit('i am', this.room_id, (id) => {
			// On introduction, make sure the server logs us (probably unnecessary?)
            this.http.post('/api/lobby/lobby-io', {lobby:this.room_id, ioid:id})
            .subscribe((data:any) =>{
                console.log(data)
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

        this.socket.on('update client status', async (payload)=> {
			console.log('this should fire', payload)
			try {
				console.log(this.players.filter(player => player.name == payload.name))
				this.players.filter(player => player.name == payload.name)[0].status = payload.status;
			} catch(e) {
				await this.getRoomContents()
				this.players.filter(player => player.name == payload.name)[0].status = payload.status;
			}
        });
        
        this.socket.on('game start', () => {
            this.redirectGame();
        })

		// Ask for room status.
        this.socket.emit('ask room status', this.room_id);

    }

    log(payload) {
        console.log(payload)
    }


    getRoomContents(){
        return new Promise((res, rej) => {
            this.http.get('/api'+this.room_id)
            .subscribe((data:any) =>{
                if(data.success) {
                    this.players = []
                    for(var i=0; i<data.json.users.length; i++) {
                        var item = data.json.users[i]
                        this.players.push(
                            {name:item.username
                            ,ishost:item.ishost
                            ,status:(item.username != this.states.name?'mia':'here')});
                    }
					this.room_capacity = data.json.capacity;
                    res();
                }
                else {
                    console.log('lmao oh no');
                    rej();
                }
            });
        })
    }

    //Probably don't do it this way...
    redirectGame() {
        this.router.navigate(['/game/'+this.room_id.substring(6,)]);
    }

    startGame(){
        this.http.put('/api'+this.room_id, {})
        .subscribe((data:any) =>{
            if(data.success) {
                this.socket.emit('game start', this.room_id);
                this.redirectGame();
            }
            else {
                if( data.json ) {
                    this.players = []
                    for(var i=0; i<data.json.users.length; i++) {
                        var item = data.json.users[i]
                        this.players.push(
                            {name:item.username
                            ,ishost:item.ishost
                            ,status:(item.username != this.states.name?'mia':'here')});
                    }
                    this.room_capacity = data.json.capacity;
                }
                console.log('lmao oh no');
            }
        });
    }


    stillAlive() {
        this.restart();
        if(this.states.status != 'here') {
            this.states.status = 'here';
            try {
                this.players.filter(player => player.name == this.states.name)[0].status = 'here';
            } catch(e) {
                console.log('Threwup', this.players.filter(player => player.name == this.states.name)[0]);
                console.log('Threp', this.players, this.states);
            }
            this.socket.emit('report client status', this.room_id, this.states);
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
                this.socket.emit('report client status', this.room_id, this.states)
            }, 1000 * 60 * 5)
        }
    }
}
