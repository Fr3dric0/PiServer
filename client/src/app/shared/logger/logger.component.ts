import {Component, OnInit, Input} from '@angular/core';

@Component({
    selector: 'app-logger',
    templateUrl: './logger.component.html',
    styleUrls: ['./logger.component.css']
})
export class LoggerComponent implements OnInit {
    private _title: string;
    private _message: string;
    private _type: string;
    private legalTypes: string[] = ['warn', 'error', 'success', 'message'];

    @Input()
    set message(message:string) {
        this._message = message;
    }
    get message() {
        return this._message;
    }

    @Input()
    set type(type: string) {
        if (!this.legalTypes.includes(type)) {
            type = 'message';
        }

        this._type = type;
    }
    get type() {
        return this._type;
    }

    constructor() { }

    ngOnInit() {
    }

}
