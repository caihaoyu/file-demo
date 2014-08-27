var dao=require('../dao/dao');
var pool=dao.pool;
var BSON=dao.BSON;
var ObjectID=dao.ObjectID;
var GridStore=dao.GridStore;
var Grid=dao.Grid;
var memPool=dao.memPool;
  function insertFile(fileName,title,type,size,buffer){
     pool.acquire(function(err, db) {
        if(err) throw err;

            if(size/1024<50){
              var collection = db.collection('file');
              collection.insert({"title":title,"data":buffer,"file_type":type,"type":"bson","date":new Date()}, function(err, docs) {       
                // var collection1=db.collection("file_map");
                // collection1.insert({"name":name,"type":"bson","fileId":docs[0]._id},function(err,docs1){
                //   console.log("插入成功");
                   setMem(docs._id,buffer);
                });
               
            }else{
                  
                //   var grid = new Grid(db, "fs");
                //   var file=new Buffer(buffer,'binary');
                //   grid.put(file, {"filename":fileName}, function(err, result) {
                //     console.log("init");
                //     console.log(err);
                //     console.log(result);
                //  
                // });
                   gridStore = new GridStore(db, new ObjectID(),fileName,  "w");
                   gridStore.open(function(err, gridStore) {
                  // Write some content to the file
                  gridStore.write(new Buffer(buffer,'binary'), function(err, gridStore) {
                          gridStore.close(function(err, result) {
                           var collection = db.collection('file');
                          collection.insert({"title":title,"file_type":type,"type":"grid","date":new Date(),"grid_id":result._id}, function(err, docs) {  
                          setMem(docs._id,buffer);
                          });     
                       });
                   });
                });
              }     
             pool.release(db);
        });
  }
  function findAll(callback){
    if(callback && typeof(callback)=="function"){
    
        pool.acquire(function(err, db)  {
          var collection = db.collection('file');
          collection.find({},{'title':1,'type':1}).toArray(function(err,list){
            pool.release(db);
            callback(list);
          });
        });
    }
  }

  function getImage(id,callback){
    if(callback && typeof(callback)=="function"){
        var o_id = new BSON.ObjectID(id);
        getMem(id,function(data,file_type){
          // console.log(data);
          if(data&&file_type){
            // console.log("init");
            callback(data,file_type);
          }else{
             pool.acquire(function(err, db)  {
          var collection = db.collection('file');
          collection.findOne({_id:o_id},function(err,list){
            if(err){
              console.error(err);
            }
            // console.log(list);
           // console.log("aaaaaaaaa");
            if(list.type=="bson"){
               pool.release(db);
               setMem(list._id,list.data,list.file_type);
              callback(list.data,list.file_type);
            }else if(list.type=="grid"){
               // var gridStore = new GridStore(db, list.grid_id, 'r');
                GridStore.read(db, list.grid_id, function(err, fileData) {
                  // callback(fileData)
                  // console.log(fileData);
                  pool.release(db);
                  setMem(list._id,fileData,list.file_type);
                  callback(fileData,list.file_type);
                });
            }
            
          });
        });

          }

        });
           }
  }
  function setMem(id,data,file_type){
    var file_type=id+"file_type";
      memPool.acquire(function(err, client) {
    if (err) {
        // handle error - this is generally the err from your
        // factory.create function
        console.log("is error:"+err.message);

    }
    else {
         client.set( id,data, 1000000, function( err, result ){

            console.log( err );
        client.set(file_type,file_type,1000000,function(err,result2){
          // console.log(result2);
        })
        memPool.release(client);
        // as we are 100% certain we are not going to use the connection again, we are going to end it
        });
      }
    });
    }
  function getMem(id,callback){
     if(callback && typeof(callback)=="function"){
       memPool.acquire(function(err, client) {
        if (err) {
            // handle error - this is generally the err from your
            // factory.create function
            console.log("is error:"+err.message);

        }
        else {
            client.get( id,function( err, result ){
            //console.dir( result );
            // console.log(result);
            client.get( id+"file_type", function( err, result1 ){
               memPool.release(client);
               callback(result,result1);
            
            });
           
            // as we are 100% certain we are not going to use the connection again, we are going to end it
            });
          }
        });
        }
  }

  exports.insertFile = insertFile;
  exports.getImage=getImage;
  exports.findAll=findAll;