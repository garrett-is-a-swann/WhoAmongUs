import { Component, OnInit } from '@angular/core';
import { ClockService } from '../clock.service';

@Component({
    selector: 'app-login',
    providers: [ ClockService ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    model: string = '';
    error: string = '';



    constructor(clock: ClockService) { }

    ngOnInit() {
    }


    validate() {
    }

}
