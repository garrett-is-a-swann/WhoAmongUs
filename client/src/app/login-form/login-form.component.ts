import { Component, OnInit } from '@angular/core';
//import { LoginFormService } from './login-form.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

    username_error:string='Username required.'
    password_error:string='Password required.'
    model: FormModel = new FormModel('','');

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    postForm(username:string, password:string) {
        this.http.post('/api/auth/login', {username:username,password:password})
            .subscribe((data:any) =>{
                if(data.success) {
                    //Redirect Here
                    console.log('Auth Success')
                    
                }
                else if(data.error_code == 0) { // This shouldn't happen? Invalid password layout.
                }
                else if(data.error_code == 1) { // Invalid Password
                    console.log('Error Code 1')

                }
                else if(data.error_code == 2) { // No valid User
                    console.log('Error Code 2')

                }
            });
    }

}

class FormModel {
    constructor(
        public username: string,
        public password: string
    ) { }
}


