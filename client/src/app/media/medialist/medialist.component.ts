import { Component, OnInit, Input } from '@angular/core';

import { MediaService } from '../media.service';

@Component({
    selector: 'app-medialist',
    templateUrl: './medialist.component.html',
    styleUrls: [ './medialist.component.css' ]
})
export class MedialistComponent implements OnInit {
    @Input() type: string;

    /* Is used to do a simple filter-query on the existing elements */
    _filter: string = '';
    @Input('filter')
    set filter(filter) {
        this._filter = filter.toLowerCase();
    }
    get filter() { return this._filter; }

    media: Object[];

    constructor(private mediaService: MediaService) {
    }

    ngOnInit() {
        let sub = this.type == 'movie' ?
            this.mediaService.getMovies() :
            this.mediaService.getTvShows();
        sub.subscribe((data) => {
            this.media = data;
        }, (err) => {
            console.error(err);
        })

    }

    query(elem) {
        return elem.title
                .toLowerCase()
                .trim()
                .indexOf(this.filter.trim()) != -1;
    }

}
