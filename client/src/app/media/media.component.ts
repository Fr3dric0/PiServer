import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: [ './media.component.css' ]
})
export class MediaComponent implements OnInit {
    filter: string = '';

    constructor() {
    }

    ngOnInit() {
    }

    /*
    * @param    {EventEmitter}  evt     The event object
    * Catches live-typing from the search field.
    * Then sends the string, as a filter, to the medialists.
    * */
    searchMedia(evt) {
        this.filter = evt.query;
    }

    fullSearch(evt) {
        console.log(evt);
    }
}
