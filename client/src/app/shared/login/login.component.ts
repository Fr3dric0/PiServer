import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../auth/auth.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
    loginMessage: string;
    loginStatus: string;
    form: FormGroup;
    authenticated: boolean = false;
    constructor(private fb: FormBuilder,
                private router: Router,
                private auth: AuthService,
                private notify: NotificationsService) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            email: [ '', [ <any>Validators.required, <any>Validators.minLength(5) ] ],
            password: [ '', [ <any>Validators.required ] ]
        });

        // Check if user is already authenticated
        // This also prevents the user from entering the login component
        // when already authenticated
        this.authenticated = this.auth.authenticated();
        if (this.authenticated) {
            this.router.navigate(['/media']);
        }
    }

    login(form) {
        if (!form.valid) {
            return;
        }

        this.notify.bare('Authenticating', 'Trying to authenticate user...');

        this.auth.authenticate(form.value.email, form.value.password)
            .then( (success) => {
                this.notify.success('Authenticated',
                    `<p>You have been successfully authenticated!</p>
                     <p>Redirected shortly...</p>`);

                setTimeout(() => {
                    this.router.navigate(['/media'])
                }, 500);
            } )
            .catch( (err) => {
                if (err.status == 403 || err.status == 400) {
                    this.notify.error('Not Authenticated', 'Wrong email or password');
                } else {
                    this.notify.error('Unknown Error', err.json() || 'Unknown error');
                }
            } );
    }
}
