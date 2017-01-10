import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService,
                private router:Router) {}

    canActivate() {
        let loggedIn = this.authService.authenticated();

        if (!loggedIn){
            this.router.navigate(['/']);
        }
        return loggedIn;
    }
}