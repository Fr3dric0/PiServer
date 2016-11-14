/**
 * Created by Acer on 19.05.2016.
 */

var inputType = $('#inputType');
var inputEpisodes = $('#inputEpisodes');
var inputTitle = $('#inputTitle');
var inputThumbSmall = $('#inputThumbSmall');
var inputThumbLarge = $('#inputThumbLarge');
var inputDetails = $('#inputDetails');
var inputRating = $('#inputRating');
var inputGenre = $('#inputGenre');
var lblEpisodes = $('#lblEpisodes');

// Setup the feedback-box
var feedback = new FeedbackHandler($('#feedback'));
feedback.useClassNames({client:"feedback-client-err", server:"feedback-server-err", success:"feedback-success"})

// Load the video genre
getVideoGenres();


inputType.change((evt) => {
    var display = inputType.val() == "tv-show";
    displayInputEpisodes(display);
});


$('.uploadform').submit((evt) => {
    evt.preventDefault();
    var data = $('.uploadform').serialize();

    if(inputTitle.val() == ""){
        feedback.print("Tittel kan ikkje vere tom!", FeedbackHandler.CLIENT);
        return;
    }

    $.ajax({
        type: "POST",
        url : "/modify/new",
        data: data,
        success: (results) => {
            feedback.print("<i class='glyphicon glyphicon-floppy-saved'></i>Lasta opp", FeedbackHandler.SUCCESS);
        },
        error: (err) => {
            feedback.print(err.message, FeedbackHandler.SERVER);
        }
    });

});


function displayInputEpisodes(value){
    var display = "none";
    if(value){
        display = "block";
        inputEpisodes.removeAttr("disabled");
    }else{
        inputEpisodes.attr("disabled");
    }
    inputEpisodes.css("display", display);
    lblEpisodes.css("display", display);
}

/**
 *  @desc: Loads a list of popular genres
 * */
function getVideoGenres(){
    $.getJSON("/res/json/genres.json", (genres) => {
        for(var i in genres){
            inputGenre.append(
                $('<option>',
                    {
                        value:genres[i],
                        text:genres[i]
                    }
            ));
        }
    });
}

