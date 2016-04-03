var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
      {
        title: 'PiServer',
        pages: {
          images: {
            url: '/images',
            name: 'Bilete',
            tmb_name: 'spongebob.jpg'
          },
          videos: {
            url: '/videos',
            name: 'Video',
            tmb_name: 'DSC_0786.JPG'
          }
        }
      });
});

module.exports = router;
