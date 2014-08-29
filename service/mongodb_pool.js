var dao = require('../dao/dao');
var pool = dao.pool;
var BSON = dao.BSON;
var ObjectID = dao.ObjectID;
var GridStore = dao.GridStore;
var Grid = dao.Grid;
var memPool = dao.memPool;
/*
 向mongodb插入文件
 */
function insertFile(fileName, title, type, size, buffer, fileId, callback) {
    if (callback && typeof (callback) == "function") {
        //从连接池中取出连接
        pool.acquire(function (err, db) {
            if (err)
                throw err;
            //小于20k直接放进collection
            if (size / 1024 < 20) {
                var collection = db.collection('file');
                collection.insert({
                    "title": title,
                    "data": buffer,
                    "mime_type": type,
                    "type": "bson",
                    "file_id": fileId,
                    "date": new Date()
                }, function (err, docs) {
                    // var collection1=db.collection("file_map");
                    // collection1.insert({"name":name,"type":"bson","fileId":docs[0]._id},function(err,docs1){
                    if (err) {
                        throw err;
                    }
                    //放回连接
                    var id = docs[0]._id;
                    pool.release(db);
                    callback(err, id);

                });

            } else {

                //大于20K调用GridFs
                //调用mongodb.gridStore使用安全方式存入gridfs
                var gridStore = new GridStore(db, new ObjectID(), fileName, "w");
                gridStore.open(function (err, gridStore) {
                    // Write some content to the file
                    gridStore.write(new Buffer(buffer, 'binary'), function (err, gridStore) {
                        gridStore.close(function (err, result) {
                            var collection = db.collection('file');
                            collection.insert({
                                "title": title,
                                "mime_type": type,
                                "type": "grid",
                                "file_id": fileId,
                                "date": new Date(),
                                "grid_id": result._id
                            }, function (err, docs) {
                                // setMem(docs._id,buffer);
                                pool.release(db);
                                callback(err, docs[0]._id);
                            });
                        });
                    });
                });
            }

        });
    }
}
/*
 查找所有文件
 */
function findAll(callback) {
    if (callback && typeof (callback) == "function") {

        pool.acquire(function (err, db) {
            var collection = db.collection('file');
            collection.find({}, {
                'title': 1,
                'type': 1
            }).toArray(function (err, list) {
                pool.release(db);
                callback(list);
            });
        });
    }
}

/*
 得到缩略图
 */
function getThumbnail(fileId, callback) {
    if (callback && typeof (callback) == "function") {
        pool.acquire(function (err, db) {
            var o_id = new BSON.ObjectID(fileId);
            var collection = db.collection('file');
            collection.findOne({
                _id: o_id
            }, {"thumbnail": 1}, function (err, list) {
                if (err) {
                    console.error(err);
                }
                // console.log(list);
                if (list.thumbnail) {
                    if (list.thumbnail.type == "bson") {
                        pool.release(db);
                        // setMem(list._id,(list.data,list.mime_type);
                        callback(list.thumbnail.data, list.thumbnail.mime_type);
                    } else if (list.thumbnail.type == "grid") {
                        // var gridStore = new GridStore(db, list.grid_id, 'r');
                        GridStore.read(db, list.thumbnail.grid_id, function (err, fileData) {
                            // callback(fileData)
                            // console.log(fileData);
                            pool.release(db);
                            // setMem(list._id,fileData,list.mime_type);
                            callback(fileData, list.mime_type);
                        });
                    }
                } else {
                    pool.release(db);
                    callback(null, null)
                }
            });

        });

    }
}

function getImage(fileId, callback) {
    if (callback && typeof (callback) == "function") {
        pool.acquire(function (err, db) {
            var o_id = new BSON.ObjectID(fileId);
            var collection = db.collection('file');
            collection.findOne({
                _id: o_id
            }, function (err, list) {
                if (err) {
                    console.error(err);
                }
                // console.log(list);
                if (list.type == "bson") {
                    pool.release(db);
                    // setMem(list._id,(list.data,list.mime_type);
                    callback(list.data, list.mime_type);
                } else if (list.type == "grid") {
                    // var gridStore = new GridStore(db, list.grid_id, 'r');
                    GridStore.read(db, list.grid_id, function (err, fileData) {
                        // callback(fileData)
                        // console.log(fileData);
                        pool.release(db);
                        // setMem(list._id,fileData,list.mime_type);
                        callback(fileData, list.mime_type);
                    });
                }

            });

        });

    }
}
function insertThumbnail(id, type, size, buffer, fileName, callback) {
    if (callback && typeof (callback) == "function") {
        var o_id = new BSON.ObjectID(id);
        pool.acquire(function (err, db) {
            if (err)
                throw err;
            //小于20k直接放进collection
            if (size / 1024 < 20) {
                var collection = db.collection('file');
                collection.update(
                    {
                        _id: o_id
                    },
                    {
                        $set: {
                            thumbnail: {
                                "data": buffer,
                                "size": size,
                                "mime_type": type,
                                "date": new Date(),
                                "type": "bson"
                            }
                        }
                    },
                    function (err, reslut) {
                        callback(err)
                    });


            }
            else {
                gridStore = new GridStore(db, new ObjectID(), fileName, "w");
                gridStore.open(function (err, gridStore) {
                    // Write some content to the file
                    gridStore.write(new Buffer(buffer, 'binary'), function (err, gridStore) {
                        gridStore.close(function (err, result) {
                            var collection = db.collection('file');
                            collection.update({
                                    _id: o_id
                                },
                                {
                                    $set: {
                                        thumbnail: {
                                            "mime_type": type,
                                            "type": "grid",
                                            "date": new Date(),
                                            "grid_id": result._id
                                        }
                                    }
                                }, function (err, docs) {
                                    // setMem(docs._id,buffer);
                                    pool.release(db);
                                    callback(err, docs);
                                });
                        });
                    });
                });

            }
        });
    }
}

exports.insertFile = insertFile;
exports.getImage = getImage;
exports.findAll = findAll;
exports.insertThumbnail = insertThumbnail;
exports.getThumbnail = getThumbnail;