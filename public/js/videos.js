/**
 * Created by Acer on 16.05.2016.
 */
var btnRemoveVideo = $('.button-list-rm-label');
var inputTitle = $('#video-title');
var rmFeedback = $('#rmFeedback');
var errColor = {
    server: "#FF4C68",
    client: "#FF6F40",
    success: "#99FF8C"
};
var sort = getParameterByName("sort", window.location.href) || "title"; // Start values
var order = getParameterByName("order", window.location.href) || "asc"; // Start values
var sortMedia = $('#sort');
var reversedMedia = $('#reversed');
if (order == "desc") {
    reversedMedia.prop("checked", true);
}
sortMedia.val(sort);
// Find the field to sort by
sortMedia.change(function () {
    var _sort = sortMedia.val();
    sort = _sort;
    window.location.replace(removeQueryString(window.location.href) + setQueryStr());
});
// Find the order to sort by
reversedMedia.change(function () {
    var reversed = reversedMedia.is(':checked');
    if (reversed) {
        order = "desc";
    }
    else {
        order = "asc";
    }
    window.location.replace(removeQueryString(window.location.href) + setQueryStr());
});
// Simple function which sets query string for the url.
function setQueryStr() {
    return "?sort=" + sort + "&order=" + order;
}
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
function removeQueryString(url) {
    var str = "";
    for (var i = 0; i < url.length; i++) {
        var buffer = url.substring(i, i + 1);
        if (buffer == "?") {
            break;
        }
        str += buffer;
    }
    return str;
}
function getParameterByName(name, url) {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
//# sourceMappingURL=videos.js.map