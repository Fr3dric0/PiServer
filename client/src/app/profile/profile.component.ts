import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { UserService } from '../shared/user.service';
import { MediaService } from '../media/media.service';
import { IMDBService } from '../media/imdb.service';
import { User } from '../models/user';
import { Media } from "../models/media";
import { IMDB } from "../models/imdb";

import { DateFormatter } from "../lib/dateformatter";
import { NotificationsService } from 'angular2-notifications';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {
    userForm: FormGroup;
    mediaForm: FormGroup;
    media: Media[];

    private mediaTypes: String[] = ['movie', 'tv-show'];

    constructor(private fb: FormBuilder,
                private userService: UserService,
                private ms: MediaService,
                private imdb: IMDBService,
                private notify: NotificationsService) { }

    ngOnInit() {
        this.userForm = this.fb.group({
            firstName: ['', <any>Validators.required],
            lastName: ['', <any>Validators.required],
            email: ['', <any>Validators.required],
            oldPassword: [''],
            password: [''],
            confirmPassword: [''],
            accessRights: ['']
        });

        // Init empty media form
        this.mediaForm = this.fb.group({
            title: ['', <any>Validators.required],
            rating: [''],
            type: [this.mediaTypes[0], <any>Validators.required],
            description: [''],
            genre: [''],
            released: ['']
        });

    }

    /**
     * @NOTICE: notify will on current version, only work after AfterViewInit has been called
     * */
    ngAfterViewInit(): void {

        // Load existing media,
        // to fill table
        this.ms.getAll()
            .subscribe((data:Media[]) => {
                this.media = data;
            }, err => this.notify.error('Media Error', err));

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
            }, err => this.notify.error('Profile Error', err));

    }


    getImdbData(title: string) {
        this.imdb.findByTitle(title)
            .subscribe((data: IMDB) => {
                const {title, rating, released} = data;
                let releasedDate = new DateFormatter(new Date(released)).yyyymmdd(); // Reformat to support html form input
                this.mediaForm.patchValue({
                    title,
                    rating,
                    released: releasedDate ,
                    description: data.plot,
                    genre: data.genres
                });

            }, (err) => this.notify.error(`IMDB Error: ${title}`, err));
    }

    saveUser(user: User, isValid: boolean) {
        if (!isValid) {
            this.notify.alert('Invalid Profile Form', 'Profile form is missing or contains invalid data.');
            return false;
        }

        this.userService.updateDetails(user)
            .subscribe((data) => {
                this.notify.success('Profile Updated',
                    'The profile has been <strong>successfully</strong> updated');
            }, err => this.notify
                .error('Profile Update Error', err.json().error));
    }

    saveMedia(media: Media, isValid: boolean) {
        this.ms.createMedia(media)
            .subscribe(
                data => {
                    this.notify.success('Media Created',
                        `<em>${media.title}</em> has been successfully created`);

                    this.media.push(data);
                    this.mediaForm.reset(); // Clears out the submitted values
                },
                err => this.notify.error('Media Creation Error', err.json().error));
    }

}
