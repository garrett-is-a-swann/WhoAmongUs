import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';

import { AppRouterModule } from './app-router/app-router.module';
import { TopLevelRouteModule } from './top-level-route/top-level-route.module';

import { AppComponent } from './app.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { ForOhForComponent } from './for-oh-for/for-oh-for.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './form-element/login/login.component';
import { PasswordComponent } from './form-element/password/password.component';
import { EmailComponent } from './form-element/email/email.component';
import { LobbyComponent } from './lobby/lobby.component';
import { SocketComponent } from './socket/socket.component';
import { RoomComponent } from './lobby/room/room.component';
import { OnetomanyComponent } from './socket/onetomany/onetomany.component';
import { OnetooneComponent } from './onetoone/onetoone.component';
import { GameComponent } from './lobby/game/game.component';



@NgModule({
    declarations: [
        AppComponent,
        LoginFormComponent,
        RegisterFormComponent,
        ForOhForComponent,
        HomeComponent,
        LoginComponent,
        PasswordComponent,
        EmailComponent,
        LobbyComponent,
        SocketComponent,
        RoomComponent,
        OnetomanyComponent,
        OnetooneComponent,
        GameComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        AppRouterModule,
        TopLevelRouteModule 
    ],
    providers: [
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
