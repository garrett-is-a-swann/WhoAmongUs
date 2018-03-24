import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
    authenticated:any = false;
    tab:number = 0;

    rooms:any[] = [
        {'title':'Room1',
            'host':'Mr Host',
            'players':6,
            'cap':8}
        ,{'title':'Room2',
            'host':'Mr Host',
            'players':4,
            'cap':8}
        ,{'title':'Room3',
            'host':'Mr Host',
            'players':7,
            'cap':8}
        ,{'title':'Room4',
            'host':'Mr Host',
            'players':8,
            'cap':8}
        ,{'title':'Room5',
            'host':'Mr Host',
            'players':1,
            'cap':8}
    ];


    constructor(private auth: AuthService) { };

    async ngOnInit() {
        console.log(this.rooms)
        this.auth.stateChangeEmitter().subscribe(state =>{
            this.authenticated = state;
        })
        this.authenticated = await this.auth.isAuthenticated()
    }

}
