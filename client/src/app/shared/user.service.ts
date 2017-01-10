import { Injectable } from '@angular/core';
import {Http, RequestOptions, Headers, URLSearchParams} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth/auth.service';

import {domain} from '../globals';
import {User} from "../models/user";

@Injectable()
export class UserService {

    constructor(private http: Http,
                private authService: AuthService) {}

    getDetails(): Observable<any> {
        let headers = new Headers();
        headers.append('Authorization', this.authService.getToken());
        let options = new RequestOptions({headers});

        return this.http.get(`${domain}/users`, options)
            .map(res => res.json() || {});
    }

    updateDetails(user: User): Observable<any> {
        let headers = new Headers();
        headers.append('Authorization', this.authService.getToken());
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const body = this.createPostBody(user);

        return this.http.put(`${domain}/users`, body, { headers })
            .map(res => res.json() || {});
    }

    createPostBody(user: User) {
        const urlParam = new URLSearchParams();

        for (let key in user) {
            urlParam.append(key, user[key]);
        }

        return urlParam.toString();
    }

}