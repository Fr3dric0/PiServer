import { Component, OnInit, Input } from '@angular/core';
import { domain } from '../../globals';

@Component({
    selector: 'app-mediacard',
    templateUrl: './mediacard.component.html',
    styleUrls: [ './mediacard.component.css' ]
})
export class MediacardComponent implements OnInit {
    @Input() media;

    domain: string = domain;
    path: string = '';
    title = '';
    description: string = '';
    thumb: Object = {small: '', large: ''};
    genre: string = '';
    rating: number = 0.0;
    viewcount: number = 0;
    constructor() {
    }

    ngOnInit() {
        let {title, description, thumb, genre, vidId, rating, viewcount}
            = this.media;
        this.path = `/media/${vidId}`;
        this.title = title;
        this.description = description;
        this.thumb = thumb || {small: '', large: ''};
        this.genre = genre;
        this.rating = rating || 0.0;
        this.viewcount = viewcount || 0;
    }

}
