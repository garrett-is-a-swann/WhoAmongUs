import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
    private isLoggedin:boolean = false;
    private reload:boolean = true;

    state_change : EventEmitter<boolean> = new EventEmitter();

    redirectUrl: string = '';
    
    constructor(private http: HttpClient) {
        this.isAuthenticated()
    }

    checkAuthenticated() {
        return new Promise((resolve, reject) => {
            if(this.isLoggedin == true) {
                resolve(true)
            }
            this.http.get('/api/auth/is-auth')
                .subscribe((data:any) =>{
                    this.reload=false;
                    if(data.success) {
                        this.isLoggedin = true;
                        this.state_change.emit(this.isLoggedin);
                        resolve(true);
                    }
                    else {
                        this.isLoggedin = false;
                        this.state_change.emit(this.isLoggedin);
                        resolve(false);
                    }
                });
        })
    }

    login(username:string, password:string) {
        return new Promise((resolve, reject) => {
            this.http.post('/api/auth/login', {username:username,password:password})
                .subscribe((data:any) =>{
                    if(data.success) {
                        this.isLoggedin = true;
                        this.state_change.emit(this.isLoggedin);
                        resolve({success:true, message: 'Authentication successful.'});
                    }
                    else {
                        this.isLoggedin = false;
                        this.state_change.emit(this.isLoggedin);
                        resolve({success:false, message: data.message});
                    }
                });
        })
    }

    logout() {
        this.isLoggedin = false;
        this.state_change.emit(this.isLoggedin);
        return new Promise((resolve, reject) => {
            this.http.get('/api/auth/logout')
                .subscribe((data:any) => {
                    if(data.success) {
                        this.isLoggedin = false;
                        this.state_change.emit(this.isLoggedin);
                        resolve({success:true, message: 'Logout successful.'});
                    }
                    else {
                        this.isLoggedin = false;
                        this.state_change.emit(this.isLoggedin);
                        resolve({success:false, message: "There's a broken pipe somewhere."})
                    }
                });
        })
    }
    
    isAuthenticated() {
        return new Promise((resolve, reject) => {
            if(this.reload) {
                this.checkAuthenticated().then(resp => {
                    resolve(resp)});
            } else {
                resolve(this.isLoggedin);
            }
        })
    }

    stateChangeEmitter() {
        return this.state_change;
    }

}
