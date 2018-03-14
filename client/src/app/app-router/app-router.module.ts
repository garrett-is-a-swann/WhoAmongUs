import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { RegisterFormComponent } from '../register-form/register-form.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { AppComponent } from '../app.component';

const routes: Routes = [
    { path: '/register',  component: RegisterFormComponent },
    { path: '/login', component: LoginFormComponent },
    { path: '', component: AppComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ],
    declarations: [
    ]
})
export class AppRouterModule { }
