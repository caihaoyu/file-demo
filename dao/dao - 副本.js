var poolModule = require('generic-pool');
var Mongodb = require('mongodb')
    , format = require('util').format;
var GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid; 
var ObjectID = require('mongodb').ObjectID;       
var BSON = Mongodb.BSONPure;    
var nMemcached = require( 'memcached' ),
memcached;
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
        min      : 50, 
        idleTimeoutMillis : 1000*60*30, 
        log : false,  
    });

    var memPool = poolModule.Pool({
        name : 'memPool',
        create : function(callback) {
        nMemcached.config.poolSize = 50;
            var client = new nMemcached( "127.0.0.1:11211",{maxValue:3000000} );
            callback(null, client);

        },
        destroy : function(client) { client.end(); },
        max : 50,
        min:50,
        idleTimeoutMillis : 1000*60*30,
        log : false,
    });    
exports.pool=pool; 
exports.BSON=BSON; 
exports.GridStore=GridStore;
exports.Grid=Grid;
exports.ObjectID=ObjectID;
exports.memPool=memPool; 