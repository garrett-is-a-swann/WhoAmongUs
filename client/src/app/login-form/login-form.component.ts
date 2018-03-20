import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
    response: string;

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    postForm(username:string, password:string) {
        this.response = 'Authenticating...';
        this.http.post('/api/auth/login', {username:username,password:password})
            .subscribe((data:any) =>{
                if(data.success) {
                    //Redirect Here
                    this.response = 'Authentication successful.';
                }
                else {
                    this.response = data.message;
                }
            });
    }

}
