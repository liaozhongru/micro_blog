var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var session    = require('express-session');
var MongoStore = require('connect-mongo')(session); //connect-mongo用来在本地保存cookie的，
// MongoDB session store for Connect and Express
var settings = require('./settings'); 
var flash = require('connect-flash');//
//The flash is a special area of the session used for storing messages. Messages
//are written to the flash and cleared after being displayed to the user.
//    The flash is typically used in combination with redirects, ensuring
//    that the message is available to the next page that is to be rendered.

var routes = require('./routes/index');
var users = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//设定视图位置
app.set('view engine', 'ejs');//设定模板引擎
app.use(partials());

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());//这里加载了flash，那么req，就会有req.flash这个东西
//这里的session，是要加密的，所以用配置项settings里面的字符串来做加密，然后session的存储，用mongodb存储
//，存储在settings指定的数据库里。
app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        db: settings.db,
    })
}));
//通过上面的处理后，req的session就有数据了。我们可以通过req.session拿到数据。

//这是一个中间件，每次都会经过这里。
app.use(function(req, res, next){
  console.log("session === ",req.session);
    //session ===  Session {
    //    cookie:
    //    { path: '/',
    //        _expires: null,
    //        originalMaxAge: null,
    //        httpOnly: true },
    //    flash: {},
    //    user: null }



  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
    console.log("locals === ",res.locals);
    //locals ===  { partial: [Function: bound partial],
    //user: null,
    //    post: undefined }


//    1.   res.locals是一个对象，包含用于渲染视图的上下文
//    2.   用来存储一些全局变量什么的，
//3.   在模板中可以直接使用,如：
//      res.locals.massage = "dddd";
//    handlebars 模板中直接使用 {{message}}
  var error = req.flash('error');//我们可以使用flash来挂载错误信息和正确信息。
  res.locals.error = error.length ? error : null;
 
  var success = req.flash('success');
  res.locals.success = success.length ? success : null;
  next();
});

app.use('/', routes);//  /下用routes，用index.js
app.listen(3000);
console.log("something happening");
app.use('/users', users); //  /users下用users.js


//如果这一路上，都没有人来处理这些信息，那么，就提示错误。
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
//开发环境是这样提示错误的
// development error handler
// will print stacktrace
console.log('app.js === 11111');
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

console.log('app.js === 22222');
//生产环境是这样提示错误的。
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//这个export有啥作用？？？
module.exports = app;
