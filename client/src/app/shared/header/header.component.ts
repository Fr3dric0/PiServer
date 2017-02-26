import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: [ './header.component.css' ]
})
export class HeaderComponent implements OnInit {
    @Output() loginChange = new EventEmitter();
    icon: string = '/resource/raspi.png';
    title: string = 'PiServer';
    authenticated: boolean = false;

    constructor(private authService: AuthService,
                private router: Router) {
    }

    ngOnInit() {
        this.authService.loginStatus
            .subscribe((authed) => {
                this.authenticated = authed;
            })
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
        this.authenticated = false;
        // Emit logout
        this.loginChange.emit({
            authenticated: false
        });
    }

}
