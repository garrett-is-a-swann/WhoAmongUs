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

    model: FormModel = new FormModel('','');
    error: FormModel = new FormModel('','');
    style: FormModel = new FormModel('required', 'required');
    clock: any = {
        username:  null
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
            if(/[!-~]{8,64}/.exec(this.model.password) != null) {
                this.style.password = 'validating';
                this.error.password = '';
            }
        }
    };


    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    postValidate(elem) {
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


