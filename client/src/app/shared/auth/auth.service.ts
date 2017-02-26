import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {domain} from '../../globals';

@Injectable()
export class AuthService {
    // BehavioutSubject lets us observe through an observable
    // which suits our needs more

    private loginValueChange = new BehaviorSubject<boolean>(false);
    loginStatus = this.loginValueChange.asObservable();
    path: string = '/api/auth/token';
    domain = domain;
    private itemName: string = 'pi_token';

    constructor(private http: Http) {
        this.updateLogin();
    }

    authenticate(email, password): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.http.post(this.path, { email, password })
                .map(res => res.json())
                .subscribe((data) => {
                    localStorage.setItem(this.itemName, data.token);
                    this.updateLogin();
                    resolve(true);
                }, err => reject(err))
        });
    }

    authenticated(): boolean {
        const token = localStorage.getItem(this.itemName);
        return !!token;
    }

    logout(): void {
        localStorage.removeItem(this.itemName);
        this.updateLogin();
    }

    getToken(): string {
        return localStorage.getItem(this.itemName);
    }

    getUser(): Observable<any> {
        let headers = new Headers();
        headers.append('Authorization', this.getToken());
        let options = new RequestOptions({headers});

        return this.http.get(`${this.domain}/users`, options)
            .map(res => res.json() || {})
    }

    updateLogin() {
        this.loginValueChange.next(this.authenticated());
    }


    authHeader(): Headers {
        const headers = new Headers();
        headers.append('Authorization', this.getToken());
        return headers;
    }
}