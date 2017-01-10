

export class DateFormatter {
    date: Date;

    constructor(date: Date) {
        this.date = date;
    }

    yyyymmdd(): string {
        const mm = this.date.getMonth() + 1; // getMonth() is zero-based
        const dd = this.date.getDate();

        return [this.date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
        ].join('-');
    }
}