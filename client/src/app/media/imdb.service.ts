import { Injectable } from "@angular/core";
import { AuthService } from "../shared/auth/auth.service";
import { Http } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/add/observable/from";
import { IMDB } from "../models/imdb";

@Injectable()
export class IMDBService {

    constructor(private http: Http,
                private auth: AuthService) {
    }

    findByTitle(title: string): Observable<IMDB> {
        let t = encodeURIComponent(title);
        let headers = this.auth.authHeader();
        return this.http.get(`/api/imdb?s=${t}`, { headers })
            .map(res => res.json());
    }


}