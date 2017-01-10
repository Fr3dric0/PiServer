import { Component, OnInit, Input } from '@angular/core';
import {Media} from "../models/media";

@Component({
    selector: 'app-media-stats',
    templateUrl: './media-stats.component.html',
    styleUrls: ['./media-stats.component.css']
})
export class MediaStatsComponent implements OnInit {
    _media: Media;
    @Input()
    set media(media: Media) {
        this._media = media;
    }
    get media(): Media {
        return this._media;
    }

    constructor() { }

    ngOnInit() {
    }

}
