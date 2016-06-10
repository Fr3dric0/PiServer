/**
 * Created by Acer on 16.05.2016.
 */
var btnUploadVideo = $('#admUploadVideo');
var btnRemoveVideo = $('.button-list-rm-label');
var inputTitle = $('#video-title');
var rmFeedback = $('#rmFeedback');
var errColor = {
    server: "#FF4C68",
    client: "#FF6F40",
    success: "#99FF8C"
};
btnRemoveVideo.click(function (evt) {
    toggleVideoRMSchema();
});
function toggleVideoRMSchema() {
    var vidRemoveScheema = $('.vid-remove-scheema-container');
    var display = "none";
    if (vidRemoveScheema.css('display') == "none") {
        display = "block";
    }
    rmFeedback.html("");
    rmFeedback.css('background-color', "#FFF");
    inputTitle.css('border-color', "#aaa");
    vidRemoveScheema.css("display", display);
}
$('#removeVideoForm').submit(function (evt) {
    evt.preventDefault();
    var vidID;
    var title = inputTitle.val();
    // Check if title is missing
    if (title == "" || title == null) {
        rmFeedback.css('background-color', errColor.client);
        rmFeedback.html("Tittel kan ikkje vere tom!");
        inputTitle.css("border-color", errColor.client);
        return;
    }
    vidID = convertTitleToVidID(title);
    // Get the user to confirm the DELETE
    var confirmed = confirm("Er du sikker på at du vil slette " + title);
    if (confirmed) {
        // Send the DELETE request
        $.ajax({
            url: "/videos/" + vidID,
            type: "DELETE",
            success: function (result) {
                console.log("FINISHED");
                rmFeedback.css('background-color', errColor.success);
                rmFeedback.html(title + " er no blitt fjerna");
                inputTitle.css('border-color', errColor.success);
                // Whait 3 seconds before page refreshes
                setTimeout(function () {
                    location.reload();
                }, 3000);
            },
            error: function (err) {
                rmFeedback.css('background-color', errColor.server);
                console.log(err);
                rmFeedback.html("ERROR");
            },
            statusCode: {
                404: function () {
                    rmFeedback.css('background-color', errColor.server);
                    rmFeedback.html(title + "(" + vidID + ") Eksisterar ikkje");
                }
            }
        });
    }
    else {
        toggleVideoRMSchema();
    }
});
/**
 *  @desc: Simple method which converts the title, to the same format as vidIDs
 * */
function convertTitleToVidID(title) {
    var vidID = "";
    var wspaceSepparator = "_"; // This is the symbol that should replace the whitespace character
    for (var i = 0; i < title.length; i++) {
        var buffer = title.substring(i, i + 1);
        if (buffer == " ") {
            vidID += wspaceSepparator;
        }
        else {
            vidID += buffer.toLowerCase();
        }
    }
    return vidID;
}
//# sourceMappingURL=videos.js.map