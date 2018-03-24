import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { HomeComponent } from '../home/home.component';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { ForOhForComponent } from '../for-oh-for/for-oh-for.component';
import { LobbyComponent } from '../lobby/lobby.component';

import { AuthGuardService } from '../auth-guard.service';
import { AuthService } from '../auth.service';

const routes: Routes = [
    {   path: ''
        ,component: HomeComponent 
        ,children: [
            { path: 'login', component: LoginFormComponent },
            { path: 'register',  component: RegisterFormComponent },
            {
                path: ''
                ,canActivateChild: [AuthGuardService]
                ,children: [
                    { path: '', component: LobbyComponent },
                ]
            }
        ],
    },
    { path: '**', component: ForOhForComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ],
    providers: [
        AuthGuardService,
        AuthService
    ],
    declarations: [
    ]
})
export class AppRouterModule { }
