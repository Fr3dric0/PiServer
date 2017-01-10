import {Component, OnInit, Input} from '@angular/core';

import { MediaService } from '../media.service';
import {Media} from "../../models/media";


@Component({
    selector: 'app-media-table',
    templateUrl: './media-table.component.html',
    styleUrls: ['./media-table.component.css']
})
export class MediaTableComponent implements OnInit {
    _media: Media[];
    @Input()
    set media(media: Media[]) {
        this._media = media;
    }
    get media(): Media[] {
        return this._media;
    }

    constructor(private ms: MediaService) {
    }

    ngOnInit() {
    }


    deleteMedia(media: Media) {
        const shouldDelete = confirm(`Are you sure you want to delete '${media.title}'`);
        if (shouldDelete) {
            this.ms.deleteMedia(media)
                .subscribe((result) => {
                    // Removes the current media
                    const idx = this.media.indexOf(media);
                    this.media.splice(idx, 1);
                }, (err) => {
                    console.error(err);
                });
        }
    }
}
