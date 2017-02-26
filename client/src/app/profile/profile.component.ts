import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { UserService } from '../shared/user.service';
import { MediaService } from '../media/media.service';
import { IMDBService } from '../media/imdb.service';
import { User } from '../models/user';
import { Media } from "../models/media";
import { IMDB } from "../models/imdb";

import { DateFormatter } from "../lib/dateformatter";


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    userForm: FormGroup;
    mediaForm: FormGroup;
    media: Media[];
    feedback: string;
    feedbackType: string;

    private mediaTypes: String[] = ['movie', 'tv-show'];

    constructor(private fb: FormBuilder,
                private userService: UserService,
                private ms: MediaService,
                private imdb: IMDBService) { }

    ngOnInit() {
        this.initMedia();

        this.userForm = this.fb.group({
            firstName: ['', <any>Validators.required],
            lastName: ['', <any>Validators.required],
            email: ['', <any>Validators.required],
            oldPassword: [''],
            password: [''],
            confirmPassword: [''],
            accessRights: ['']
        });

        // Get user data
        this.userService.getDetails()
            .subscribe((data) => {
                this.userForm = this.fb.group({
                    firstName: [data.firstName, <any>Validators.required],
                    lastName: [data.lastName, <any>Validators.required],
                    email: [data.email, <any>Validators.required],
                    oldPassword: [''],
                    password: [''],
                    confirmPassword: [''],
                    accessRights: [data.accessRights]
                });
            }, (err) => {
                console.error(err);
            });
    }


    initMedia() {

        this.ms.getAll()
            .subscribe((data:Media[]) => {
                console.log(data);
                this.media = data;
            }, (err) => {
                console.error(err);
            });

        this.mediaForm = this.fb.group({
            title: ['', <any>Validators.required],
            rating: [''],
            type: [this.mediaTypes[0], <any>Validators.required],
            description: [''],
            genre: [''],
            released: ['']
        })
    }


    getImdbData(title: string) {
        this.imdb.findByTitle(title)
            .subscribe((data: IMDB) => {
                const {title, rating, released} = data;
                let releasedDate = new DateFormatter(new Date(released)).yyyymmdd(); // Reformat to support html form input
                this.mediaForm.patchValue({title, rating, released: releasedDate , description: data.plot, genre: data.genres});
            }, (err) => {
                console.error(err);
            });
    }

    saveUser(user: User, isValid: boolean) {
        if (!isValid) {
            this.feedbackType = 'error';
            this.feedback = 'Form is invalid, Ensure all required fields are filled and valid';
            return false;
        }

        this.userService.updateDetails(user)
            .subscribe((data) => {
                this.feedbackType = 'success';
                this.feedback = 'User-data updated';
            }, (err) => {
                this.feedbackType = 'error';
                this.feedback = err.json().error;
            });
    }

    saveMedia(media: Media, isValid: boolean) {
        this.ms.createMedia(media)
            .subscribe(
                data => {
                    this.media.push(data);
                    this.mediaForm.reset(); // Clears out the submitted values
                },
                err => console.error(err));
    }

}
