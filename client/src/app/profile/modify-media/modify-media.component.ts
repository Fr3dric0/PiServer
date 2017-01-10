import {Component, OnInit} from "@angular/core";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {MediaService} from "../../media/media.service";
import {IMDBService} from "../../media/imdb.service";
import {Media} from "../../models/media";
import {DateFormatter} from "../../lib/dateformatter";
import {IMDB} from "../../models/imdb";

@Component({
    selector: 'app-modify-media',
    templateUrl: './modify-media.component.html',
    styleUrls: ['./modify-media.component.css']
})
export class ModifyMediaComponent implements OnInit {
    vidId: string;
    media: Media;
    mediaForm: FormGroup;
    mediaFeedback: string;
    mediaFeedbackType: string;

    thumbForm: FormGroup;
    thumbFeedback = {type: null, message: null};

    movieForm: FormGroup;

    constructor(private route: ActivatedRoute,
                private fb: FormBuilder,
                private ms: MediaService,
                private imdb: IMDBService) {
    }

    ngOnInit() {
        this.route.params
            .subscribe( (param) => {
                this.vidId = param['vidId'];
                this.loadMedia();
            });

        this.mediaForm = this.fb.group({
            title: ['', <any>Validators.required],
            rating: [''],
            vidId: [''],
            type: ['', <any>Validators.required],
            description: [''],
            genre: [''],
            released: [''],
            uploaded: [''],
            uploader: ['']
        });

        this.thumbForm = this.fb.group({
            size: ['small', <any>Validators.required],
            thumb: ['', <any>Validators.required]
        });

        this.movieForm = this.fb.group({
            movie: ['', <any>Validators.required]
        });
    }

    loadMedia() {
        this.ms.get(this.vidId)
            .subscribe((media) => {
                this.media = media;
                this.initMediaForm();
            }, (err) => {
                this.mediaFeedbackType = 'error';
                this.mediaFeedback = err.json().error;
            });
    }

    initMediaForm() {
        let released = new DateFormatter(
            new Date(this.media.released)).yyyymmdd();
        let uploaded = new DateFormatter(new Date(this.media.uploaded)).yyyymmdd();

        this.mediaForm = this.fb.group({
            title: [ this.media.title, <any>Validators.required ],
            vidId: [ this.media.vidId ],
            type: [ this.media.type , <any>Validators.required],
            rating: [ this.media.rating ],
            description: [ this.media.description ],
            genre: [ this.media.genre ],
            released: [ released ],
            uploaded: [ uploaded ],
            uploader: [ this.media.uploader ]
        });
    }

    saveMedia(media: Media, valid: boolean) {
        if (!valid) {
            this.mediaFeedbackType = 'error';
            this.mediaFeedback = 'Form contains invalid fields. Could not save';
            return false;
        }

        this.mediaFeedbackType = 'message';
        this.mediaFeedback = 'Saving media';
        this.ms.saveMedia(media)
            .subscribe((data) => {
                this.mediaFeedbackType = 'success';
                this.mediaFeedback = 'Data saved';

                let {title, rating, description, genre, released} = data;
                // Reformat date to string yyyy-MM-dd
                released = new DateFormatter(new Date(released)).yyyymmdd();

                this.mediaForm.patchValue({
                    title, rating, description, genre, released
                });
            }, (err) => {
                this.mediaFeedbackType = 'error';
                this.mediaFeedback = err.json().error;
            });
    }

    saveThumb(evt) {
        evt.preventDefault();
        this.thumbFeedback = {type: 'message', message: `Uploading ${evt.target.size.value} thumbnail`};

        this.ms.saveThumb(this.media, evt.target)
            .then((data) => {
                this.media = data;
                this.thumbFeedback = {type: 'success', message: `${evt.target.size.value} Thumbnail uploaded`};
            }).catch((err) => {
                this.thumbFeedback = {type: 'error', message: err.message};
            });

    }

    saveMovie(evt) {
        this.ms.saveMovie(this.media, evt.target)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    // TODO:ffl - Create a component for the general media form
    getImdbData(title: string) {
        this.mediaFeedbackType = 'message';
        this.mediaFeedback = 'Loading IMDB data';
        this.imdb.findByTitle(title)
            .subscribe((data: IMDB) => {
                this.mediaFeedbackType = 'success';
                this.mediaFeedback = 'IMDB data found';
                const {title, rating, released} = data;
                let releasedDate = new DateFormatter(new Date(released)).yyyymmdd(); // Reformat to support html form input
                this.mediaForm.patchValue({title, rating, released: releasedDate , description: data.plot, genre: data.genres});
            }, (err) => {
                this.mediaFeedbackType = 'error';
                this.mediaFeedback = err.json().error;
            });
    }

    onDelete(evt) {
        this.thumbFeedback = {type: 'message', message: `Removing ${evt.label} thumbnail`};
        this.ms.deleteThumb(this.media, evt.label.toLowerCase())
            .subscribe((results) => {
                this.thumbFeedback = {type: 'success', message: `${evt.label} thumb successfully removed`};
                const size = evt.label.toLowerCase();
                delete this.media.thumb[size];
            }, (err) => {
                this.thumbFeedback = { type: 'error', message: err.json().error };
            });
    }

}
