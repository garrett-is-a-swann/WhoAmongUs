import { Component, OnInit } from '@angular/core';
//import { LoginFormService } from './login-form.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {
    model: FormModel = new FormModel('','');
    error: FormModel = new FormModel('','');
    style: FormModel = new FormModel('required', 'required', '', '', '');
    clock: any = {
        username:  null
    };

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    resetClock(elem) {  // Keydown
        if(this.clock[elem] != null) {
            clearTimeout(this.clock[elem])
        }
    }

    validateUsername() {  // Keyup
        if(this.clock.username != null){
            clearTimeout(this.clock['username'])
        }
        this.clock['username'] = setTimeout(()=>{this.postValidateUsername()}, 1000)
        if(/^[a-zA-Z0-9._!@$~|-]{0,64}$/.exec(this.model.username) != null) {
            this.style.username = 'validating';
            this.error.username = ''
        }
        else if(/[^a-zA-Z0-9._!@$~|-]/.exec(this.model.username) != null) {
            this.style.username = 'invalid';
            this.error.username = 'Error: Cannot use characters: [ '+ (this.model.username.match(/[^a-zA-Z0-9._!@$~|-]/g)
                .filter((value, index, self) => {
                    return self.indexOf(value) === index;
                })+'').replace(/([^a-zA-Z0-9._!@$~|-],)/g,(match, offset, str) => {return match[0]})+' ]'
        }
        else {
            this.style.username = 'invalid';
            this.error.username = 'Error: Usernames must be 4-64 characters.'
        }
    }

    postValidateUsername() {
        if( this.model.username.length == 0) {
            this.style.username = 'invalid';
            this.error.username='Username is a required field.'
            return
        }
        if(/^[a-zA-Z0-9._!@$~|-]{4,64}$/.exec(this.model.username) == null && this.style.username != 'invalid') {
            this.style.username = 'invalid';
            this.error.username='Error: Usernames must be 4-64 characters.'
            return
        }
        this.http.post('/api/auth/validate-username', {username:this.model.username})
        .subscribe((data:any) => {
            if(data.success) {
                this.style.username = 'valid';
                this.error.username = '';
            }
            else {
                this.style.username = 'invalid';
                this.error.username = data.message;
            }
        });
    }

    postForm() {
        this.http.post('/api/auth/register', {username:this.model.username,password:this.model.password})
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
        public password: string,
        public email?: string,
        public firstname?:string,
        public lastname?:string,
    ) { }
}
