import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-select-list',
    templateUrl: './select-list.component.html',
    styleUrls: ['./select-list.component.css']
})
export class SelectListComponent implements OnInit {
    _list: number[] | string[];
    @Input()
    set list(list: number[] | string[]) {
        this._list = list;
    }
    get list(): number[] | string[] {
        return this._list;
    }

    @Output() select = new EventEmitter();

    selected: string;

    constructor() { }

    ngOnInit() {
    }

    onSelect(evt) {
        this.selected = evt.target.id;
        this.styleSelected(evt.target, evt.target.parentNode.children);
        this.select.emit({target: evt.target.innerHTML}); // Return the element value, the list provided
    }


    /**
     * @TODO:ffl - Find a more "Angular2-way" of handling this selection
     * @param   {Node}          selected    The selected element
     * @param   {NodeList}      list        List all of the elements
     *
     * Iterates over the list and matches the selected's id, with the lists 'id'.
     * Then sets the css-class 'selected' to the selected one
     * */
    styleSelected(selected, list) {
        let id = selected.id;

        for (let i = 0; i < list.length; i++) {
            let elem = list[i];
            elem.className = (elem.id == id) ? 'selected' : '';
        }

    }
}
