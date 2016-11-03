// 引入需要的模块



var express = require('express'),
 	router = express.Router(),
 	crypto = require('crypto'),
 	User = require('../models/user.js'),
 	Post = require("../models/post.js");

// 主页路由
router.get('/', function(req, res) {
	console.log('index.js--11111');
	//这里传入null相当于把所有用户的信息都找出来了。
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}
		console.log('index.js--11112');
		//这里render的作用，同173页的res.render，这里的index指代的是index.ejs
		res.render('index', {
			title: '首页',
			posts: posts,
			user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
		});
	});
});

// 注册页路由
router.get("/reg",checkNotLogin);
router.get("/reg",function(req,res) {
	console.log('index.js--22222');
	res.render("reg",{
		title : "用户注册"
	});
});

router.post("/reg",checkNotLogin);
router.post("/reg",function(req,res) {
	console.log('index.js--33333');
	if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', '两次输入的口令不一致,liaozhongru');//这段话是如何传递回去，成为标签的呢？？？
		console.log('location === ',res.location());
		return res.redirect('/reg');//基于res.location()，然后添加路径,所以就是http://localhost:3000 在加上/reg
		//这样就redirect，也就是转跳到http://localhost:3000/reg
		//Redirect to the given `url` with optional
		//	response `status` defaulting to 302.
		//The resulting `url` is determined by `res.location()`,
		//so it will play nicely with mounted apps,
		//	relative paths, `"back"` etc.
		//return res.redirect('www.baidu.com');
	}
	console.log(req.body['password']);

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password,
	});
	//检查用户名是否已经存在
	User.get(newUser.name, function(err, user) {
		if (user)
			err = 'Username already exists.';
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}

		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
});

// 登录页路由
router.get("/login",checkNotLogin);
router.get("/login",function(req,res) {

	res.render("login",{
		title:"用户登入",
	});
});

router.post("/login",checkNotLogin);
router.post("/login",function(req,res) {
	console.log('index.js--44444');
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
});

// 登出页路由
router.get("/logout",checkLogin);
router.get("/logout",function(req,res) {
	console.log('index.js--55555');
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
});


function checkLogin(req, res, next) {
	console.log('index.js--66666');
	if (!req.session.user) {
		req.flash('error', '未登入');
		return res.redirect('/login');
	}
	next();
}
function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/');
	}
	next();
}

// 发言路由
router.post("/post",checkLogin);
router.post("/post",function(req,res) {
	console.log('index.js--77777');
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/u/' + currentUser.name);
	});
});

//这里没有做是否登陆限制，也就是说，通过get请求，无论用户是否登陆，如果用户存在，就可以看到信息。
router.get("/u/:user",function(req,res) {//注意，这里定义一个变量，叫做user,这样，就表征user这个key，下面，我们可以通过这个key找到value
	console.log('index.js--88888');
	console.log('req.params.user = ',req.params.user);//get请求的参数，直接通过params来解析。
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			//这里，不再是通过静态资源来返回了，而是套页面。我们这边通过res.render来渲染某个ejs，并把其中的数据套到这个页面中去。
			//然后返回这个页面即可。这个就是res.render的作用，这里，'user'其中指的是user.ejs，大概意思就是通过把title，posts的数据
			//套到user.ejs里面去，然后把页面返回给用户。
			res.render('user', {
				title: user.name,
				posts: posts,
			});
		});
	});
});

module.exports = router;
