/**
 * Created by Acer on 02.08.2016.
 */
var configJSON = require('../bin/config/config.json');
/**
 *  @desc:  We store recurring data in a config file.
 *          Which we then load into the request object
 * */
function placeConfigInReq(req, res, next) {
    req.config = configJSON;
    // Add to locals
    res.locals.title = configJSON.title;
    res.locals.author = configJSON.author;
    next();
}
module.exports.placeConfigInReq = placeConfigInReq;
//# sourceMappingURL=index.js.map