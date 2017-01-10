import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../auth/auth.service';

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
                private auth: AuthService) {
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

        this.loginStatus = 'message';
        this.loginMessage = 'Logging in...';

        this.auth.authenticate(form.value.email, form.value.password)
            .then( (success) => {
                this.loginMessage = "Login Successful!";
                this.loginStatus = 'success';

                setTimeout(() => {
                    this.router.navigate(['/media'])
                }, 500);
            } )
            .catch( (err) => {
                console.error(err);
                this.loginStatus = 'error';
                if (err.status == 403) {
                    this.loginMessage = 'Wrong email or password!';
                } else {
                    this.loginMessage = JSON.stringify(err.json()) || 'Unknown error';
                }
            } );
    }
}
