/**
 * Created by Acer on 18.07.2016.
 */
var movieTypeNames = ['movie', 'movies', 'mov']; // Valid alternative names for movies
var tvshowTypeNames = ['tvshow', 'tv-show', 'tvshows', 'tv-shows', 'tv']; // Valid alternative names for tvshows
function sorting(req, res, next) {
    var sort = req.query.sort;
    var order = req.query.order;
    // if none exists. skip function
    if (sort == undefined || order == undefined) {
        return next();
    }
    try {
        order = checkOrder(order);
    }
    catch (e) {
        next(); // IF order is invalid, do nothing
    }
    // If all is good, set sorting to req-param
    req.sorting = {};
    req.sorting[sort] = order;
    return next();
}
function filterMediatype(req, res, next) {
    var _type;
    var skipmediatype = "";
    req.skipping = {
        tvshow: false,
        movie: false
    };
    // If type is not present
    if (req.query.type) {
        _type = req.query.type;
    }
    else if (req.query.mediatype) {
        _type = req.query.mediatype;
    }
    else {
        return next();
    }
    if (movieTypeNames.indexOf(_type.toLowerCase()) != -1) {
        skipmediatype = movieTypeNames[0];
    }
    else if (tvshowTypeNames.indexOf(_type.toLowerCase()) != -1) {
        skipmediatype = tvshowTypeNames[0];
    }
    else {
        return next();
    }
    req.skipping = {
        tvshow: skipmediatype != tvshowTypeNames[0],
        movie: skipmediatype != movieTypeNames[0]
    };
    return next();
}
/**
 *  @param: (int)   order   The provided sorting order in the URI
 *  @desc:  Checks if the sorting order is valid.
 *          if sorting order is invalid, the function will throw an error
 *
 *  @return: (int) the sorting order
 * */
function checkOrder(order) {
    var _r = 0;
    var not_asc = false;
    var not_desc = false;
    var asc_orders = ['asc', 'ascending', '1'];
    var desc_orders = ['desc', 'descending', '-1'];
    // Check if order should be ASCENDING
    if (asc_orders.indexOf(order.toLowerCase()) != -1) {
        _r = 1;
    }
    else {
        not_asc = true;
    }
    // Check if order should be DESCENDING
    if (desc_orders.indexOf(order.toLowerCase()) != -1) {
        _r = -1;
    }
    else {
        not_desc = true;
    }
    // If none of the sorting orders is valid, throw exception
    if (not_asc && not_desc) {
        throw "Sorting order is invalid!";
    }
    return _r;
}
module.exports.sorting = sorting;
module.exports.filterMediatype = filterMediatype;
//# sourceMappingURL=index.js.map