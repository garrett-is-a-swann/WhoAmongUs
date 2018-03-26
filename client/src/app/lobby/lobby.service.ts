import { Injectable } from '@angular/core';
//import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LobbyService {

    constructor(private http: HttpClient) { }

    createLobby(name = '', password = '', rules = '') {
        return new Promise((resolve, reject) => {
            this.http.post('/api/lobby/create', {name:name,password:password, rules:rules})
                .subscribe((data:any) =>{
                    if(data.success) {

                        resolve({success:true, message: 'Lobby created.'});
                    }
                    else {

                        resolve({success:false, message: data.message});
                    }
                });
        })
    }

    getMyLobby() {
        return new Promise<any>((resolve, reject) => {
            this.http.get('/api/lobby/user-lobbies')
                .subscribe((data:any) =>{
                    if(data.success) {
                        resolve({success:true, json: data.json});
                    }
                    else {

                        resolve({success:false, message: data.message});
                    }
                });
        })
    }


}
