var mongodb = require('./db');//如果我们想要全局变量，我们，可以写某个文件，然后module.exports new把这个全局变量导出来。
//这样，我们什么地方需要了，我们直接require就行了。因为是module.exports 就执行一次，所以这个new就执行一次。

/*
 * 集合`users`的文档`User`构造函数
 * @param {Object} user: 包含用户信息的一个对象
 */
//这是类的写法。
function User(user) {
	this.name = user.name;
	this.password = user.password;
};

module.exports = User;

//
//我们在别的地方,可以通过这种方式来创建对象
//User = require('../models/user.js');
//var newUser = new User({
//	name: req.body.username,
//	password: password,
//});

/*
 * 保存一个用户到数据库
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */

//下面这个写法，实际上是这么用的
//newUser.save(function(err) {});这么写，实际上是实例方法
User.prototype.save = function save(callback) {
	var user = {
		name: this.name,
		password: this.password,
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//在mongodb中：文档=一条数据，集合=表，这里，users就是表，而user对象是一条数据，而db是数据库。
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			// collection.ensureIndex('name', {unique: true});

			//注意，我们的一条数据，不是插在数据库里面，而是插在某个表里面。所以，我们要把这个表找出来。这个表就是collection，也叫集合

			collection.insert(user, {safe: true}, function(err, user) {
				mongodb.close();
				callback(err, user);
			});
		});
	});
}


/*
 * 查询在集合`users`是否存在一个制定用户名的用户
 * @param {String} username: 需要查询的用户的名字 
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */

//这么写，调用的时候，只能这么调用User.get(newUser.name, function(err, user) {}）
///也就是说这么写是类方法
User.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.findOne({name: username}, function(err, doc) {
				mongodb.close();
				if (doc) {

					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};