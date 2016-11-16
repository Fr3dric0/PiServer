var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.json({success: true, data: 'somehost'});
});



module.exports = router;