var express = require('express');
var router = express.Router();
var fs = require('fs');
var images = require("images");
var path = require('path');
var service = require('../service/mongodb_pool')

function test(req, res) {
	var filePath = path.join(__dirname + '/2.png');
	var outPath=path.join(__dirname + '/output.png');
	images(filePath)
	.size(250)                                        
    .save(outPath, {               
        quality : 80                    
    });
    res.end("a");
}

exports.test = test;
