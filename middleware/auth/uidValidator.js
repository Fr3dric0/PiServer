
module.exports = {

    /**
     * validateUid ensures the the property "uid" exists in "req.decoded"
     * */
    validateUid(req, res, next) {
        const { uid } = req.decoded;

        if (!uid) {
            const err = new Error('Missing uiser-id field "uid" in "req.decoded"');
            err.status = 500;
            return next(err);
        }

        next();
    }
};