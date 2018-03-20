import { Component, OnInit } from '@angular/core';
import { ClockService } from '../clock.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-password',
    providers: [ ClockService ],
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
    model: string = '';
    error: string = '';
    style: string = 'required';

    constructor(private http: HttpClient, private clock: ClockService) {
        clock.init(()=>{this.postValidate()});
    }

    ngOnInit() {
    }

    keydown() {
        this.clock.restart()
        this.error = '';
        this.style = 'validating';
    }

    validate() {  // Keyup
        if(/[!-~]{8,64}/.exec(this.model) != null) {
            this.style = 'validating';
            this.error = '';
        }
    }

    postValidate() {
        if( this.error.length > 0 ) {
            return;
        }
        if( this.model.length == 0 ) {
            this.style = 'required';
            return;
        }
        if(/[!-~]{8,64}/.exec(this.model) == null) {
            this.style = 'required';
            this.error = 'Password requirements are 8-64';
            return;
        }
        if( /(?=.*[a-z])/.exec(this.model) == null
            || /(?=.*[A-Z])/.exec(this.model) == null
            || /(?=.*[!-@[-`{-~])/.exec(this.model) == null) 
        {
            this.style = 'invalid';
            this.error = 'Error: Passwords need Upper(1), Lower(1), and non-alpha(1) characters';
            return;
        }
        this.style = 'valid'
        this.error = ''
    }
}
