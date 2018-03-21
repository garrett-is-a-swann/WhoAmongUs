import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    authenticated:any = false;

    constructor(private auth: AuthService) { }

    ngOnInit() {
        this.auth.stateChangeEmitter().subscribe(state =>{
            this.authenticated = state;
        })
    }

}
