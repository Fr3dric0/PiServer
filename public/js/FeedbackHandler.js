/**
 * Created by Acer on 20.05.2016.
 */
/**
 *  @dependency:
 *      - JQuery
 *  @desc:  class for handling giving visual feedback.
 * */
var FeedbackHandler = (function () {
    function FeedbackHandler(element) {
        this.colors = { client: "#FF6F40", server: "#FF4C68", success: "#99FF8C" };
        this.usesClassNames = false;
        this.classNames = {};
        this.element = element;
        this.reset();
    }
    FeedbackHandler.prototype.print = function (msg, msgType) {
        var elem = this.element;
        if ((msgType != FeedbackHandler.CLIENT) && (msgType != FeedbackHandler.SERVER) && (msgType != FeedbackHandler.SUCCESS)) {
            throw "The message-type argument is not one of the valid alternatives (CLIENT, SERVER, SUCCESS)";
        }
        // Check if the method uses class names instead of the default values
        if (this.usesClassNames) {
            this.removeClassNames();
            elem.addClass(this.classNames[msgType]);
        }
        else {
            elem.css("background-color", this.colors[msgType]);
        }
        elem.removeAttr("style");
        elem.css('display', 'block');
        elem.html(msg);
    };
    FeedbackHandler.prototype.useClassNames = function (classNames) {
        if (typeof classNames != "object") {
            throw "The parameter argument has to be of type object. Got instead: " + (typeof classNames);
        }
        if (classNames == {}) {
            throw "The argument cannot be empty!";
        }
        if (!classNames.client || !classNames.server || !classNames.success) {
            throw "The argument has to include the options 'client', 'server' and 'success'";
        }
        this.usesClassNames = true;
        this.classNames = classNames;
    };
    FeedbackHandler.prototype.reset = function () {
        if (this.usesClassNames) {
            this.removeClassNames();
        }
        this.element.css('background-color', 'transparent');
        this.element.html("");
        this.element.css('display', 'none');
    };
    FeedbackHandler.prototype.removeClassNames = function () {
        for (var key in this.classNames) {
            this.element.removeClass(this.classNames[key]);
        }
    };
    FeedbackHandler.CLIENT = "client";
    FeedbackHandler.SERVER = "server";
    FeedbackHandler.SUCCESS = "success";
    return FeedbackHandler;
})();
//# sourceMappingURL=FeedbackHandler.js.map