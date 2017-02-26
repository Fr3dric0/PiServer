import {Injectable} from "@angular/core";
import {AuthService} from "../shared/auth/auth.service";
import { XHRService } from '../lib/xhr.service';
import {Http, Headers, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import "rxjs/add/observable/from";
import { Media, Season } from "../models/media";


@Injectable()
export class MediaService {
    path: string = '/api/videos';

    constructor(private http: Http,
                private auth: AuthService,
                private xhr: XHRService) {
    }

    get(vidId) {
        return this._get(`${this.path}/${vidId}`);
    }

    getAll(): Observable<any> {
        return this._get(this.path);
    }

    createMedia(media: Media): Observable<any> {
        let headers = this.auth.authHeader();
        let req = new RequestOptions({ headers });
        return this.http.post(this.path, media, req)
            .map( res => res.json());
    }

    saveMedia(media:Media): Observable<any> {
        let headers = this.auth.authHeader();
        let req = new RequestOptions({ headers });
        return this.http.put(`${this.path}/${media.vidId}`, media, req)
            .map( res => res.json());
    }

    deleteMedia(media: Media): Observable<any> {
        let headers = this.auth.authHeader();

        return this.http.delete(`${this.path}/${media.vidId}`, { headers })
            .map(res => res.json() || {});
    }

    saveThumb(media: Media, data): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData(data);

            xhr.open('post', `${this.path}/${media.vidId}/thumb`);

            //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
            xhr.setRequestHeader('Authorization', this.auth.getToken());

            xhr.addEventListener('load', (evt) => {

                if (xhr.status > 399 || xhr.status < 200) {
                    let data = '';
                    try {
                        data = JSON.parse(xhr.responseText).error;
                    } catch(e) {
                        data = `Could not upload thumbnail to ${media.title}`;
                    }
                    const err = new Error(data);
                    err.status = xhr.status;
                    return reject(err);
                }

                let data = '';
                try {
                    data = JSON.parse(xhr.responseText);
                } catch(e) {
                    const err = new Error(xhr.responseText);
                    err.status = 500;
                    return reject(err);
                }

                return resolve(data);
            });

            xhr.send(formData);
        });
    }

    saveMovie(media: Media, form): Promise<any> {
        const headers = new Headers();
        const formData = new FormData(form);

        return this.xhr.post({
            url: `${this.path}/${media.vidId}/vid`,
            token: this.auth.getToken()
        }, headers, formData);
    }


    getSeason(media:Media, season: Season) {
        const headers = this.auth.authHeader();
        const req = new RequestOptions({ headers });

        return this.http.get(`${this.path}/${media.vidId}/${season.num}`, req)
            .map(res => res.json());
    }

    deleteThumb(media: Media, size: string): Observable<any> {
        const headers = this.auth.authHeader();
        const req = new RequestOptions({ headers });

        return this.http.delete(`${this.path}/${media.vidId}/thumb/${size}`, req)
            .map(res => res.json());
    }

    getMovies() {
        return this._get(`${this.path}?type=movie`);
    }

    getTvShows() {
        return this._get(`${this.path}?type=tv-show`);
    }

    private _get(path) {
        let headers = this.auth.authHeader();
        let req = new RequestOptions({ headers });
        return this.http.get(path, req)
            .map(res => res.json());
    }

}