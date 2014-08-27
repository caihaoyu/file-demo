var express = require('express');
var router = express.Router();
var service = require('../service/mongodb_pool');
/* GET home page. */
router.get('/', function(req, res) {
	service.findAll(function(data) {
		var rowCount = (data.length + 4 - 1) / 4;
		rowCount = Math.round(rowCount);
		res.render('index', {
			title : '文件-demo',
			'list' : data,
			"rowCount" : rowCount
		});
		// res.writeHead(200, {
		// 		"Content-Type":"text/plain",
				
		// 	});
		// 	res.end(JSON.stringify(data));

	});

});

module.exports = router;
