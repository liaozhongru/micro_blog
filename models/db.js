/*
 * 数据库连接配置模块 
 */

var settings = require('../settings'),//获取这个settings就是为了拿到数据库名字，
    // 名字是配置在settings.js里面的，以及为了拿到host，host也是配置在settings.js里面的
    Db = require('mongodb').Db,//放心吧，虽然，我们多次require mongodb，但是模块就只加载一次。
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

//这里新建了一个数据库，放心好了，我们通过module.exports的方式，这个模块就只会加载一次。所以，不会多次new
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}), {safe: true});
