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

    validate(elem) {  // Keyup
        if(this.clock[elem] != null){
            clearTimeout(this.clock[elem])
        }
        this.clock[elem] = setTimeout(()=>{
            this.postValidate(elem)}, 1000)

        if(elem == 'username') {
            if(/^[a-zA-Z0-9._!@$~|-]{0,64}$/.exec(this.model.username) != null) {
                this.style.username = 'validating';
                this.error.username = ''
            }
            else if(/[^a-zA-Z0-9._!@$~|-]/.exec(this.model.username) != null) {
                this.style.username = 'invalid';
                this.error.username = 'Error: Cannot use characters: [ '
                    + (this.model.username.match(/[^a-zA-Z0-9._!@$~|-]/g)
                    .filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    })+'').replace(/([^a-zA-Z0-9._!@$~|-],)/g,(match, offset, str) => {return match[0]})+' ]'
            }
            else {
                this.style.username = 'invalid';
                this.error.username = 'Error: Usernames must be 4-64 characters.'
            }
        }
        if(elem == 'password') {
            if(/[!-~]{8,64}/.exec(this.model.username) != null) {
                this.style.password = 'validating';
                this.error.password = '';
            }
        }
    }

    postValidate(elem) {
        if(elem == 'username') { 
            if( this.model.username.length == 0) {
                this.style.username = 'required';
                //this.error.username='Username is a required field.'
                return
            }
            if( /^[a-zA-Z0-9._!@$~|-]{4,64}$/.exec(this.model.username) == null 
                && this.style.username != 'invalid') 
            {
                this.style.username = 'invalid';
                this.error.username='Error: Usernames must be 4-64 characters.'
                return
            }
            this.http.post('/api/auth/validate-username', 
                {username:this.model.username})
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
        if(elem == 'password') {
            if( this.model.password.length == 0 ) {
                this.style.password = 'required';
                //this.error.password = 'Password is a required field.';
                return;
            }
            if(/[!-~]{8,64}/.exec(this.model.password) == null) {
                this.style.password = 'required';
                this.error.password = 'Password requirements are 8-64';
                return;
            }
            if( /(?=.*[a-z])/.exec(this.model.password) == null
                || /(?=.*[A-Z])/.exec(this.model.password) == null
                || /(?=.*[!-@[-`{-~])/.exec(this.model.password) == null) 
            {
                this.style.password = 'invalid';
                this.error.password = 'Error: Passwords need Upper(1), Lower(1), and non-alpha(1) characters';
                return;
            }
            this.style.password = 'valid'
            this.error.password = ''
        }
        if(elem == 'email') {
            // Face check the data
            if( this.model.email.length == 0) {
                this.style.email = '';
                return;
            }
            if( /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.exec(this.model.email) == null) 
            {
                this.style.email='invalid';
                this.error.email="Error: This field is for emails, not gobbledygook.";
                return;
            }
            // Ask the server
            this.http.post('/api/auth/validate-email', 
                {email:this.model.email})
            .subscribe((data:any) => {
                if(data.success) {
                    this.style.email = 'valid';
                    this.error.email = '';
                }
                else {
                    this.style.email = 'invalid';
                    this.error.email = data.message;
                }
            });
        }

    }

    postForm() {
        this.http.post('/api/auth/register', 
            {   username:this.model.username
                ,password:this.model.password
                ,email:this.model.email
                ,firstname:this.model.firstname
                ,lastname:this.model.lastname
            })
        .subscribe((data:any) => {
            if(data.success) {
                //Redirect Here
                console.log(data)
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
