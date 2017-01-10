import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: [ './search.component.css' ]
})
export class SearchComponent implements OnInit {
    @Output() search = new EventEmitter();
    @Output() searchSubmit = new EventEmitter();
    
    constructor() {
    }

    ngOnInit() {

    }

    liveSearch(evt) {
        this.search.emit({query: evt.target.value});
    }

    doSearch(evt) {
        evt.preventDefault();
        this.searchSubmit.emit({ query: evt.target.search.value });
    }
}
