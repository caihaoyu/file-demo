var express = require('express');
var router = express.Router();
var fs = require('fs');
var service = require('../service/mongodb_pool')
var crypto = require('crypto');
var pathO = require('path');
var images = require("images");

function upload(req, res) {
   saveImage(req.files.image.name, req.files.image.path, req.body.title, req.files.image.type, req.files.image.size,function (err,id) {
       saveSamllImage(id,  req.files.image.path,req.files.image.type, function (err,reslut) {
           res.redirect('/');
       });
   });
}

function saveImage(name, path, title, type, size, callback) {
    if (callback && typeof (callback) == "function") {
        fs.readFile(path, {
            encoding: 'binary'
        }, function (err, data) {
            if (err) {
                // console.error(err);
                res.redirect('/');
            } else {
                // console.log(req.files)
                service.insertFile(name, title, type, size, data, 0,
                    function (err,id) {
                        callback(err,id);
                    });
            }

        });
    }

}
function saveSamllImage(id, path, type,  callback) {
    if (callback && typeof (callback) == "function") {
        var filePath = path;
        var extensions = path.substr(path.lastIndexOf('.'));
        crypto.randomBytes(10, function (ex, buf) {
            var random = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
            var outPath = pathO.join(__dirname + '/' + random + extensions);
            var width=images(filePath).size().width;
            if (width>200){
                width=200
            }
            images(filePath)
                .size(width)
                .save(outPath, {
                    quality: 90

                });
            fs.readFile(outPath, {
                encoding: 'binary'
            }, function (err, data) {
                if (err) {
                    // console.error(err);
                    res.redirect('/');
                } else {
                    // console.log(req.files)
                    service.insertThumbnail(id, type, data.length, data,random,
                        function () {
                            fs.unlink(outPath, function (err) {
                                if (err) throw err;
                                callback();
                            });
                        });
                }

            });


        });
    }


    // res.end("a");
}

exports.upload = upload;
