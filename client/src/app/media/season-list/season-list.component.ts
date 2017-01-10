import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Season, Episode, Media} from "../../models/media";
import { MediaService } from '../media.service';

@Component({
    selector: 'app-season-list',
    templateUrl: './season-list.component.html',
    styleUrls: ['./season-list.component.css']
})
export class SeasonListComponent implements OnInit {
    private _seasons: Season[];
    @Input()
    set seasons(seasons: Season[]) {
        this._seasons = seasons;
    }
    get seasons(): Season[] {
        return this._seasons;
    }

    private _media: Media;
    @Input()
    set media(media:Media) {
        this._media = media;
    }
    get media(): Media {
        return this._media
    }

    currentSeason: Season;
    currentEpisode: Episode;
    seasonSelector: any;
    episodeList: string[];
    episodeMap: number[] = [];

    @Output() seasonChange = new EventEmitter();
    @Output() episodeChange = new EventEmitter();

    constructor(private ms: MediaService) { }

    ngOnInit() {
    }

    onChange(evt) {
        let season = this.findSeason(evt.target.value);
        this.ms.getSeason(this.media, season)
            .subscribe((s) => {
                this.currentSeason = s;
                this.episodeList = this.normalizeEpisodeList(s);
                this.seasonChange.emit({season: s, episode: this.currentEpisode});
            }, (err) => {
                console.error(err);
            });
    }

    onSelect(evt) {
        let num = this.findEpisodeNum(evt.target);
        let episode = this.findEpisode(num);
        this.episodeChange.emit({episode, season: this.currentSeason});
    }


    findEpisode(num: number) {
        let episode: Episode;
        this.currentSeason.episodes.forEach((ep) => {
            if (ep.num == num) {
                episode = ep;
                return;
            }
        });
        return episode;
    }


    findEpisodeNum(txt: string) {
        let epRefIdx: number;

        this.episodeList.forEach((ep, idx) => {
            if (ep == txt) {
                epRefIdx = idx;
                return;
            }
        });

        return this.episodeMap[epRefIdx]; // Get the episodenumber
    }


    findSeason(num: number) {
        return this.seasons.filter( s => s.num == num )[0];
    }

    normalizeEpisodeList(season: Season): string[] {
        return season.episodes.map((ep) => {
            this.episodeMap.push(ep.num);
            return `Episode ${ep.num}`
        });
    }

}
