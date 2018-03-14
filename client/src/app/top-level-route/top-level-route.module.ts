import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { ForOhForComponent } from '../for-oh-for/for-oh-for.component';
import { AppComponent } from '../app.component';



const routes: Routes = [
    { path: '', component: AppComponent },
    { path: '**', component: ForOhForComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)

    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class TopLevelRouteModule { }
