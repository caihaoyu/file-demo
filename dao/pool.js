var poolModule = require('generic-pool');
var Mongodb = require('mongodb')
    , format = require('util').format;
    //生成连接池
    var pool = poolModule.Pool({
        name     : 'mogoPool',
        create   : function(callback) {
            
             Mongodb.MongoClient.connect('mongodb://127.0.0.1:27017/liferay', function(err, db) {
                callback(err, db);
            });   

        },
        destroy  : function(db) { db.close(); },
        max      : 50,   
        idleTimeoutMillis : 1000*60*3, 
        log : true,  
    });