/**
 * Created by Acer on 11.08.2016.
 */

var videoplayer =  videojs("my-video");
var isFullscreen = false;

var playerElem = $('#my-video');

$(document).keypress(function(evt){
	evt.preventDefault();
	if(evt.keyCode == 32){ // SPACEBAR
		togglePause();
	}else if(evt.keyCode == 70) { // F(ullscreen)
		toggleFullScreen();
	}
});

function toggleFullScreen(){
	var elem = document.getElementById("my-video");

	if(!isFullscreen){
		if(elem.requestFullscreen){
			elem.requestFullscreen();
		}else if(elem.msRequestFullscreen){
			elem.msRequestFullScreen();
		}else if(elem.mozRequestFullScreen){
			elem.mozRequestFullScreen();
		}else if(elem.webkitRequestFullscreen){
			elem.webkitRequestFullscreen();
		}
		isFullscreen = true;
	}else{

	}
}

function togglePause(){
	if(videoplayer.paused()){
		videoplayer.play()
	}else{
		videoplayer.pause();
	}
}