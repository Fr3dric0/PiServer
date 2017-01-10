import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MediaComponent } from './media/media.component';
import { MediaDetailsComponent } from './media/mediadetails/mediadetails.component';
import { ProfileComponent } from './profile/profile.component';
import { ModifyMediaComponent } from './profile/modify-media/modify-media.component';

import { AuthGuard } from './shared/auth/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'media',
        component: MediaComponent,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'media/:vidId',
        component: MediaDetailsComponent,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'profile/videos/:vidId',
        component: ModifyMediaComponent,
        canActivate: [ AuthGuard ]
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule { }