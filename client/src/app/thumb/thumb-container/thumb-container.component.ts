import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-thumb-container',
    templateUrl: './thumb-container.component.html',
    styleUrls: ['./thumb-container.component.css']
})
export class ThumbContainerComponent implements OnInit {
    _thumb: string;
    @Input()
    set thumb(thumb: string) {
        this._thumb = thumb;
    }
    get thumb(): string {
        return this._thumb;
    }

    _label: string;
    @Input()
    set label(label: string) {
        this._label = label;
    }
    get label(): string {
        return this._label;
    }

    @Output() delete = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    onClick() {
        this.delete.emit({label: this.label});
    }

}
