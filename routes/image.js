var express = require('express');
var router = express.Router();
var service = require('../service/mongodb_pool');
/* GET home page. */
router.get('/', function (req, res) {
    var id = req.query.id;
    // console.log("id==="+id);
    if (id) {
        var myDate = new Date();

        // add a day to the date
        myDate.setDate(myDate.getDate() + 1);

        // add a week
        myDate.setDate(myDate.getDate() + 7);
        service.getImage(id, function (data, mime_type) {
            res.writeHead(200, {
                'Content-Type': mime_type,
                'Cache-Control': 'public,max-age=0',
                'Expires': myDate.toUTCString()
            });
            res.write(data, 'binary');
            res.end();
        });
    } else {
        var err = new Error('Not Found');
        err.status = 404;
        throw err;
    }

});

module.exports = router;
