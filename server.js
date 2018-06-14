//  OpenShift sample Node application
var express = require('express'),
    app     = express();
var session = require('express-session');
var User = require('./models/user.js'),
  Message=require('./models/message.js');
var credentials=require('./credentials.js');
var songinfo=require('./lib/songinfo.js');
var baseUrl=require('./lib/static.js');
var imgUrl=require('./lib/imgUrl.js');

var exphbs  = require('express-handlebars').create({defaultLayout:'main',
  helpers:{
    section:function (name,options) {
      if (!this._sections) {
        this._sections={};
      }
      this._sections[name]=options.fn(this);
      return null;
    },
    devide:function (name,options) {
      this[options.hash.source]=name;
      return options.fn(this);
    },
    static:function (name) {
      return baseUrl.map(name);
    }
  }
});
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

app.engine('handlebars',exphbs.engine);
app.set('view engine', 'handlebars');
//添加静态资源
app.use(express.static(__dirname+'/public'));
//引入cookie中间件
app.use(require('body-parser').urlencoded({extended:false}));
app.use(require('body-parser').json());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(session({
  secret: credentials.cookieSecret,
  resave: false,
  saveUninitialized: false
  //,store: new MongoStore({ url:credentials.mongo.dev.connectionstring })
}));

//测试路由
app.use(function (req,res,next) {
  res.locals.showTests=app.get('env')!=='production'&&req.query.test==='1';
  if (!res.locals.partials){
    res.locals.partials={};
  }
  
  res.locals.partials.ref='reffer';
  res.locals.user=req.session.user;
  delete req.session.user;
  res.locals.error=req.session.error;
  delete req.session.error;
  res.locals.islogin=req.signedCookies.islogin;
  next();
});

//主页面
app.get('/',function (req,res) {
  res.render('home',{
    loginPage:'登录',
    formId:'loginForm',
    postUrl:'/process/login',
    imgUrl:imgUrl,
    song:songinfo.song.slice(0,6),
    playList:songinfo.board.display.slice(0,10),
    news:songinfo.news.slice(0,8),
    recommend:songinfo.recommend.slice(0,4)
  });
});

//注册页
app.get('/reg',function (req,res) {
  res.render('home',{
    regPage:'注册',
    formId:'regForm',
    postUrl:'/process/reg',
    imgUrl:imgUrl,
    song:songinfo.song.slice(0,6),
    playList:songinfo.board.display.slice(0,10),
    news:songinfo.news.slice(0,8),
    recommend:songinfo.recommend.slice(0,4)
  });
})

//about页面
app.get('/about',function (req,res) {
  res.render('about',{
    pageTestScript: '/qa/tests-about.js'
  });
});

//contact表单页面
app.get('/contact',function (req,res) {
  res.render('contact');
});

//board表单页面
app.get('/board',function (req,res) {
  res.render('board');
});

//歌单页面
app.get('/sheet',function (req,res) {
  res.render('sheet',{
    song: songinfo.sheet.slice(0,12)
  });
});

//board数据
app.get('/data/board',function (req,res) {
  var board=songinfo.board;
  if (board) {
    res.json(board)
  }
});

//展示页
app.get('/list/:types',function (req,res,next) {
  var info=null;
  var types=req.params.types;
  if(!types){
    return next();
  }
  info=songinfo[types];
  res.render(types,{
    song:info
  });
});

//data获取页
app.get('/list/:types/:detail',function (req,res,next) {
  var info=null;
  var types=req.params.types,
    detail=req.params.detail;
  if(!detail){
    return next();
  }
  info=songinfo[types][detail];
  res.json(info);
});

//登录表单处理路由
app.post('/process/login',function (req,res) {
  var uname=req.body.username||'',upassword=req.body.password||'';
  console.log(uname);
  console.log(upassword);
  if (uname&&upassword) {
    User.findOne({name:uname},function(err,doc){
      if(err){
              res.status(500);
              res.render('500');
              console.log(err);
          }else if(!doc){
          //查询不到用户名匹配信息，则用户名不存在
              req.session.error = '用户名不存在';
              console.log('用户名不存在');
              res.send({success:false});
          }else if(upassword !== doc.password){
          //查询到匹配用户名的信息，但相应的password属性不匹配
              req.session.error = "密码错误";
              console.log("密码错误");
              res.send({success:false});
          }
          else{
          //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
              req.session.user = doc;
              console.log('成功');
              res.cookie('islogin', credentials.cookieSecret, { maxAge: 60000, signed: true});
              res.send({success:true,url:'/'});
          }
      });
  }
  else{
    console.log("数据错误");
    res.send({success:false});
  }
});
//注册表单处理路由
app.post('/process/reg',function (req,res) {
  console.log(req.body);
  var uname=req.body.username||'',upassword=req.body.password||'';
  if (uname&&upassword){
    User.findOne({name: uname},function(err,doc){
      if(err){
        req.session.error =  '网络异常错误！';
        res.status(500);
        console.log(err);
        res.render('500');
        }else if(doc){ 
              req.session.error = '用户名已存在！';
              console.log('用户名已存在！')
              res.send({success:false,url:'/reg'});
          }else{ 
              User.create({
              // 创建一组user对象置入model
                  host: req.hostname,
                  id: '无名罪袋',
                  name: uname,
                  password: upassword
              },function(err,doc){ 
                  if (err) {
                      res.status(500);
                      console.log(err);
                      res.render('500');
                  }
                  else {
                      req.session.error = '用户名创建成功！';
                      req.session.user = doc;
                      res.send({success:true,url:'/'});
                  }
              });
        }
    });
  }
  else{
    console.log("数据错误");
    res.send({success:false});
  }
});

//评论获取
app.get('/message',function(req, res){
    var userName=req.query.userName||'';
    //如果有用户名，说明前面已经提交过了，传递到视图上去，这样也没刷新后不用重新填写用户名
    if (userName) {
      Message.getAll(function(err,messages){
          if(err){
              console.log(err);
              //异常跳转到error界面
              res.redirect('/505');
          }
          else{
              res.render('message', {
                msgs:messages,
                comment:true,
                user:{
                  name:userName
                }
              });
          }
      });
    }
    else{
      console.log('未登录');
      res.send('请先返回登录......');
    }
});

// 评论储存
app.post('/process/message',function(req, res){
  var opt=req.query.opt;
    var userName= req.body.userName,
      owner=req.body.owner,
      content= req.body.content;
    var conditions={userName:owner,content:content};
    console.log('userId='+userName+' content='+content);
    var callback=function(err,flag){
        if(err){
                console.log(err);
                res.redirect('/505');
            }
        else{
          console.log(flag);
            //保存成功，刷新message界面，顺便把用户名通过url传过去
            res.redirect('/message?userName='+userName);
        }
            
    }
    switch (opt){
      case 'add': Message.add(userName,content,callback);break;
      case 'remove': Message.removeMsg(conditions,callback);break;
    }
});

app.post('/process/comment',function (req,res) {
  var userName= req.body.userName,
    owner=req.body.owner,
    content= req.body.content,
    zNum= +req.body.zNum;
  console.log(req.body);
  var conditions={userName:owner,content:content};
  Message.updateData(userName,conditions,zNum,function (err,flag) {
    if(err){
            console.log(err);
            res.redirect('/505');
        }
        else if (flag) {
          console.log('点了赞');
        }
  });
})

//404页面
app.use(function (req,res,next) {
  res.status(404);
  res.render('404');
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
