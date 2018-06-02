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

var userSchema=new mongoose.Schema({
	host: String,
	id: String,
	name: String,
	password: String
});
var User=db.model('User',userSchema);
module.exports=User;
