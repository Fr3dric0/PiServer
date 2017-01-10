
export interface Media {
    title: string;
    vidId: string;
    rating: number;
    type: string;
    description: string;
    genre: string;
    released: Date;
    uploaded: Date;
    uploader?: string;
    thumb?: {
        small?: string;
        large?: string;
    };
    url?: string;
    seasons?: Season[];
}

export interface Season {
    num: number;
    thumb?: {};
    description?: string;
    released?: Date;
    uploaded: Date;
    episodes?: Episode[];
}

export interface Episode {
    title?: string;
    description?: string;
    num: number;
    url?: string;
}

/*
export class Media implements Media{
    title: string;
    vidId: string;
    rating: number;
    type: string;
    description: string;
    genre: string;
    released: Date;
    uploaded: Date;
    thumb?: {
        small?: string;
        large?: string;
    }
}*/