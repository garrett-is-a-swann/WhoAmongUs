import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

@Injectable()
export class AuthService {
    isLoggedin:boolean = false;

    redirectUrl: string = '';

    login(): Observable<boolean> {
        console.log('HELASDFL')
        return Observable.of(true).delay(1000).do(val => this.isLoggedin = true);
    }
    logout(): void {
        this.isLoggedin = false;
    }

    constructor() { }

}
