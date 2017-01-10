import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {MediaService} from "../media.service";
import {Media, Episode, Season} from "../../models/media";

@Component({
    selector: 'app-mediadetails',
    templateUrl: './mediadetails.component.html',
    styleUrls: ['./mediadetails.component.css']
})
export class MediaDetailsComponent implements OnInit {
    media: Media;
    title: string;
    description: string;
    vidId: string;
    url: string;
    episode: Episode;
    season: Season;

    constructor(private route: ActivatedRoute,
                private ms: MediaService) { }

    ngOnInit() {
        this.route.params
            .subscribe((params) => {
                this.vidId = params['vidId'];
                this.loadMedia(this.vidId);
            });

    }

    loadMedia(vidId: string) {
        this.ms.get(vidId)
            .subscribe((media: Media) => {
                this.media = media;
                this.title = media.title;
                this.description = media.description;

                if (media.type == 'movie') {
                    this.url = media.url;
                }

            }, (err) => {
                console.error(err);
            });
    }

    epChange(evt) {
        this.episode = evt.episode;
        this.season = evt.season;
        this.url = evt.episode.url || 'http://localhost:3000/media';
    }

}
