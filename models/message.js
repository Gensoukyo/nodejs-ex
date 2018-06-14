var mongoose=require('mongoose');
var credentials=require('../credentials.js');
var db=mongoose.createConnection(credentials.mongo.dev.connectionstring);

mongoose.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + 'credentials.mongo.dev.connectionstring');  
});    

/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});

var MessageSchema=new mongoose.Schema({
    userName:String,
    content:String,
    zan:{
        num:Number,
        group:Array
    },
    createTime:{type:Date,default:Date.now}
});

var Message=db.model('Message',MessageSchema);

Message.add=function(userName,content,callback){
    var msg = new Message();
    msg.userName=userName;
    msg.content=content;
    msg.zan={
        num:0,
        group:[]
    };
    //save to db
    msg.save(function(err){
        if(err){
            console.log(err);
            callback(err);
        }else{
            callback(null,'评论成功');
        }   
    });
};

Message.removeMsg =function(conditions,callback) {
    Message.remove(conditions, function(err) {
        if (err) {  
            console.log(err);  
            callback(err);  
        } else {
            callback(null,'删除成功');
        }  
    });  
}

Message.getAll=function(callback){
    Message.find(
    	{},null,{ sort: { 'createTime':-1  } },
           callback
    );
}

Message.updateData=function (userName,conditions,zNum,callback) {
    Message.findOne(conditions,function (err,doc) {
        if(err){
            console.log(err);
            callback(err);
        }else if(doc){
            if (doc.zan.group.indexOf(userName)<0) {
                doc.zan.group.push(userName);
                zNum++;
                console.log(doc.zan.group+'\t'+zNum);
                Message.update(conditions, {zan: {num:zNum,group:doc.zan.group} }, function (err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                });
                callback(err,true);
            }
            else{
                callback(err,false);
            }
        }
    })
}

module.exports=Message;