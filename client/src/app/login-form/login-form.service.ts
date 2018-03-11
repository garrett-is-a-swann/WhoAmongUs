import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';


const httpOptions = { 
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'auth'
    })
};



@Injectable()
export class LoginFormService {

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse) {
        if(error.error instanceof ErrorEvent) {
            console.error('An error occured:', error.error.message);
            return 'Retry';
        }
        else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        }
        return new ErrorObservable('Error, try again');
    };

    postLogin(form: any): Observable<{}> {
        return this.http.post('/api/login', {
                username:form.username,
                password:form.password
            }).pipe(
                catchError(this.handleError)
            );
    }


}
