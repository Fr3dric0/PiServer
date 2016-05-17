/**
 * Created by Acer on 16.05.2016.
 */

var btnUploadVideo = $('#admUploadVideo');
var btnRemoveVideo = $('#admRemoveVideo');

var errColor = {
    server: "#FF4C68",
    client:"#FF6F40",
    success: "#99FF8C"
};

btnRemoveVideo.click((evt) => {
    toggleVideoRMSchema();
});

function toggleVideoRMSchema(){
    var vidRemoveScheema = $('.vid-remove-scheema-container');

    var display:string = "none";

    if(vidRemoveScheema.css('display') == "none"){
        display = "block";
    }

    vidRemoveScheema.css("display", display);
}

$('#removeVideoForm').submit((evt) => {
    evt.preventDefault();
    var rmFeedback = $('#rmFeedback');
    var vidID:string;
    var inputTitle = $('#video-title');
    var title = inputTitle.val();

    // Check if title is missing
    if(title == "" || title == null){
        rmFeedback.css('background-color', errColor.client);
        rmFeedback.html("Tittel kan ikkje vere tom!");

        inputTitle.css("border-color", errColor.client);
        return;
    }

    vidID = convertTitleToVidID(title);

    $.ajax({
        url: "/videos/"+vidID,
        type: "DELETE",
        success: (result) => {
            rmFeedback.css('background-color', errColor.success);
            rmFeedback.html(title + " er no blitt fjerna");
            inputTitle.css('border-color', errColor.success);

            // Whait 3 seconds before page refreshes
            setTimeout(()=> {
                location.reload();
            }, 3000);
        },
        error: (err) => {
            rmFeedback.css('background-color',errColor.server);
            rmFeedback.html(err);
        },
        statusCode: {
            404: () => {
                rmFeedback.css('background-color', errColor.server);
                rmFeedback.html("Fant ikkje adressa for å slette videoen");
            }
        }
    });

});

/**
 *  @desc: Simple method which converts the title, to the same format as vidIDs
 * */
function convertTitleToVidID(title:string):string{
    var vidID = "";
    var wspaceSepparator = "_"; // This is the symbol that should replace the whitespace character

    for(var i = 0; i < title.length; i++){
        let buffer = title.substring(i, i+1);

        if(buffer == " "){
            vidID += wspaceSepparator;
        }else{
            vidID += buffer.toLowerCase();
        }

    }

    return vidID;
}

