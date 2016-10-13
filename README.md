#PiServer
This application was built to store and stream media on my local network.

It uses ExpressJS as the back-end framework, and is lightweight enough to keep on a raspberry pi (hence PiServer)

## Setup
Installation is easy enough.

1. Fork this repo
2. Run ```npm install````
3. Place your media in ```public/res/videos/movies/movie_name.mp4``` or ```public/res/videos/tvshows/tv_show_folder/season_#/tv_show_vidID.mp4```
4. The data is storred in MongoDB. Check the model for details.
5. Run ```npm start```or ```nodemon```

## Controller details
The application converts the title to a more url-friendly format, which becomes the vidID. This is also what the video-url uses.

**N.B.** A video upload mechanism is not yet supported. If you want to upload a new movie or tv-show, you can do this through the chromeapp Postman, ```POST localhost:3000/api/v1/``` in the header you include details like
```
title: String
type: String ["movie", "tv-show"] # Either of those two options
thumb: {small: true, large: true}
details: String
rating: Int
released: Date("yyyy-mm-dd")
```
I do plan creating it's own form for uploading of this form of data. However the time and motivation, has not struck me yet.

