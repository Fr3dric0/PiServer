import {Injectable} from "@angular/core";
import {AuthService} from "../shared/auth/auth.service";
import {Http, Headers, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import "rxjs/add/observable/from";
import {domain} from "../globals";
import {IMDB} from "../models/imdb";

@Injectable()
export class IMDBService {
    path: string = domain + '/videos';

    constructor(private http: Http,
                private auth: AuthService) {
    }

    findByTitle(title: string): Observable<IMDB> {
        let t = this.serializeTitle(title);
        let headers = this.auth.authHeader();
        return this.http.get(`${domain}/imdb?s=${t}`, {headers})
            .map(res => res.json());
    }

    private serializeTitle(title: string): string {
        return encodeURIComponent(title);
    }
}