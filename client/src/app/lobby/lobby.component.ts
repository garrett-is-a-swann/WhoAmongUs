import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { LobbyService } from './lobby.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
    authenticated:any = false;
    tab:number = 0;

    session_form:any ={
        name: this.auth.whoAuthenticated().user+"'s game"
        ,capacity: 8
        ,_public: true
        ,password: null
        ,success: false
    }

    rooms:any[] = [];

    constructor(private auth: AuthService, private lobby: LobbyService, private router: Router) {
    }
    gotoRoom(room) {
        if(room.enrolled) {
            this.router.navigate(['/lobby/'+room.id]);
        } else {
        // open up lobby rules
        }
    }

    async ngOnInit() {
        this.auth.stateChangeEmitter().subscribe(state =>{
            this.authenticated = state;
        })
        this.authenticated = await this.auth.isAuthenticated()

        this.getSessions(); 
    }

    async createLobby() {
        this.lobby.createLobby(
            this.session_form.name,
            this.session_form.capacity,
            this.session_form._public ,
            this.session_form.password, ''
        ).then(res => {

            if( res.success ) {
                this.session_form.success=true;
            }
        }).catch(err => {
            // idk
        });
    }

    getMySessions() {
        this.lobby.getMyLobby().then(res => {
            if( res.success ) {
                this.rooms = res.json;
            }
        }).catch(err => {
            // idk
        });
        this.setStyle();
    }

    getSessions() {
        this.lobby.getLobbies().then(res => {
            if( res.success ) {
                this.rooms = res.json;
            }
        }).catch(err => {
            // idk
        });
        this.setStyle();
    }

    joinSession(id:number, password:string, error_field = null) {
        this.lobby.joinLobby(id, password).then(res => {
            console.log(res)
            if( res.success ) {
                this.rooms.filter(room => room.id == id)[0].enrolled=true;
                this.rooms.filter(room => room.id == id)[0].players++;
                // Session has been joined! Redirect? Message?
                error_field._error = false;
            }
            else {
                // Session has already been filled? Message?
                error_field._error = true;
                return false;
            }
            this.getSessions();
            return true;
        }).catch(err => {
            // idk
        });
    }

    leaveSession(id:number) {
        this.lobby.leaveLobby(id).then(res => {
            console.log(res)
            if( res.success ) {
                // Session has been left! Redirect? Message?
            }
            else {
                // ??
            }
            this.getSessions();
        }).catch(err => {
            // idk
        });
    }


    setStyle() {
        for(var i in this.rooms) {
            if( this.rooms[i].active != false )
                continue;
            this.rooms[i].capacity = this.rooms[i].capacity? this.rooms[i].capacity: 8;
            var style_ratio:number = (parseInt(i)-(this.rooms[i].capacity/2)) / (this.rooms[i].capacity-(this.rooms[i].capacity/2))
            if(style_ratio <= .20)
                this.rooms[i].style = 'low-capacity'
            if(style_ratio <= .40)
                this.rooms[i].style = 'med-low-capacity'
            if(style_ratio <= .60)
                this.rooms[i].style = 'med-capacity'
            if(style_ratio <= .80)
                this.rooms[i].style = 'med-high-capacity'
            if(style_ratio <= 1)
                this.rooms[i].style = 'high-capacity'
            if(this.rooms[i].capacity == i)
                this.rooms[i].style = 'max-capacity'
        }
    }
}
