import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';

import { AppRouterModule } from './app-router/app-router.module';

import { AppComponent } from './app.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';


@NgModule({
    declarations: [
        AppComponent,
        LoginFormComponent,
        RegisterFormComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        AppRouterModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
