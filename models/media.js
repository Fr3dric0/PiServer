const mongoose = require('mongoose');
const { Schema } = mongoose;

const Movies = require('./movies');
const Episodes = require('./episodes');

const TYPES = ['movie', 'tv-show'];
const THUMB_SIZES = ['small', 'large'];

const Media = new Schema({
    title: { type: String, required: true },
    vidId: { type: String, unique: true },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be a negative value'],
        max: [10, 'Rating cannot be bigger than 10']
    },
    type: { type: String, required: true, enum: TYPES },
    description: { type: String, default: '' },
    genre: { type: String },
    released: { type: Date },
    uploaded: { type: Date, default: Date.now() },
    uploader: { type: Schema.Types.ObjectId },
    thumb: {
        small: { type: String },
        large: { type: String }
    }
});

Media.statics.types = TYPES;
Media.statics.thumbSizes = THUMB_SIZES;

Media.statics.get = (prop, filter = {}) => {
    return new Promise((rsv, rr) => {
        this.find(prop, filter)
            .then((media) => {
                if (!media) {
                    return rsv({});
                }

                let Model; // MongoModel
                switch (media.type) {
                    case 'movie':
                        Model = Movies;
                        break;
                    case 'tvshow':
                        Model = TvShow;
                }

                if (Model) {
                    Model.findOne({mediaId: media._id}, filter)
                        .then((m) => {
                            let data = { media };
                            data[media.type] = m;
                            rsv(data);
                        })
                        .catch( err => rr(err));
                } else {
                    rsv({ media });
                }
            })
            .catch( err => rr(err));
    });
};


Media.pre('save', function(next) {
    let self = this;

    self.vidId = createVidId(self.title);
    // TODO - Remember to save data to Movies or TvShows
    next();
});

function createVidId(title) {
    let str = [];

    str = title.split('').map((c) => {
        if (c == ' ') {
            return '_';
        }

        return c.toLowerCase();
    });

    return str.join('');
}


function destructureMedia(req, data) {
    let title, vidId, rating, genre, released, description, type, thumb, uploaded, uploader;
    if (data.media) {
        ({title, vidId, rating, genre, description, type, released, thumb, uploaded, uploader} = data.media);
    } else if (data) {
        ({title, vidId, rating, genre, description, type, released, thumb, uploaded, uploader} = data);
    }
    const m = { title, vidId, rating, genre, released, description, type, thumb, uploaded, uploader };

    if (data.tvshow) {
        m.seasons = data.tvshow.seasons;
    } else if (data.movie) {
        m.url = setThumbUrl(req, data.movie.url);
    }

    if (m.thumb) {
        m.thumb.small = setThumbUrl(req, m.thumb.small);
        m.thumb.large = setThumbUrl(req, m.thumb.large);
    }

    return m;
}

module.exports = mongoose.model('Media', Media);