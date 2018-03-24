import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    private authenticated:any = false;
    username:any = '';

    constructor(private auth: AuthService) { }

    async ngOnInit() {
        this.auth.stateChangeEmitter().subscribe(async (auth, username) =>{
            this.authenticated = auth;
            this.username = await this.auth.whoAuthenticated()
        })
        this.authenticated = await this.auth.isAuthenticated()
        this.username = await this.auth.whoAuthenticated()
    }


}
