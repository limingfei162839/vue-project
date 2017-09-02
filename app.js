
var express = require('express');
var ueditor = require("ueditor");
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var http = require('http');
var session=require('express-session');
var fs = require("fs");
var EventSocket = require('./lib/modules').eventsocket;
var config = require('./config');
var urlScreen=require('./router/urlSizer');
var log4js = require('log4js');

var app = express();



log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'dateFile', //文件输出
      filename: 'logs/app',
      "pattern": "-yyyy-MM-dd.log",
      "alwaysIncludePattern": true,
      "pollInterval": 1,
      //maxLogSize: 1024,
      //backups:3,
      //category: 'app'
    }
  ],
  //replaceConsole: true
});

exports.glogger = function(name){
  var logger = log4js.getLogger(name);
  logger.setLevel(log4js.levels.WARN);//trace、debug、info、warn、error、fatal
  return logger;
}

var logger = this.glogger('app');
app.use(log4js.connectLogger(logger,{level:log4js.levels.Info}));

// var mongoose = require('mongoose');
// var mgconfig = require('./conf/config');

// var dbIP = mgconfig.dbIP,
// 	dbPort = mgconfig.dbPort,
// 	dbName = mgconfig.dbName;
// var dbUrl = 'mongodb://'+ dbIP + ':' + dbPort + '/' + dbName;
//mongoose链接mongodb
// mongoose.connect(dbUrl);

var models_path = __dirname + '/models/scada';	//models路径
// var view_path = __dirname + '/dist';
//读取指定目录下的文件，可包含文件夹
var walk = function(path) {
    fs
        .readdirSync(path)
        .forEach(function(file) {
            var newPath = path + '/' + file
            var stat = fs.statSync(newPath)

            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    require(newPath)
                }

            }
            else if (stat.isDirectory()) {
                walk(newPath)
            }
        })
};
walk(models_path);
// walk(view_path);

app.set('views', path.join(__dirname, 'dist'));
// app.engine('html', require('ejs').renderFile);
app.engine('html',require('ejs-mate'));
app.set('view engine', 'html');

app.use(session({ resave: true, saveUninitialized: true,  secret: 'prjuser'}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    limit:'50mb',
    extended: true,
    parameterLimit:50000
}));
//ueditor
// app.use("/common/ueditor/ueditor", ueditor(path.join(__dirname, 'models/maintain/upload'), function(req, res, next) {
//     // ueditor 客户发起上传图片请求
//     if (req.query.action === 'uploadimage') {
//         var foo = req.ueditor;

//         var imgname = req.ueditor.filename;

//         var img_url = '/phone/';
//         //你只要输入要保存的地址 。保存操作交给ueditor来做
//         res.ue_up(img_url);
//     }
//     //  客户端发起图片列表请求
//     else if (req.query.action === 'listimage') {
//         var dir_url = '/phone/';
//         // 客户端会列出 dir_url 目录下的所有图片
//         res.ue_list(dir_url);
//     }
//     // 客户端发起其它请求
//     else {
//         res.setHeader('Content-Type', 'application/json');
//         res.redirect('/common/ueditor/php/config.json');
//     }
// }));



app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'router/controller')));
// app.use(express.static(path.join(__dirname, 'models/maintain/upload')));
// app.use(express.static(path.join(__dirname, 'maptiles')));

app.use('/', require('./router/index'));
// app.use('/scada',require('./router/scada/router'));
// app.use('/manage',require('./router/manage/index'));
app.use('/map',require('./router/map/index'));
// ----------------------------
// app.use('/map',urlScreen.urlSizer,require('./router/map/infoBorad'));


// app.use('/tunnel',require('./router/tunnel/index'));
// app.use('/maintain',urlScreen.urlSizer,require('./router/maintain/index'));
// app.use('/maintain',require('./router/maintain/index'));
// app.use('/phone',require('./router/phone/index'));
// app.use('/cms',require('./router/cms/index'));
// app.use('/video',require('./router/video/video'));
// app.use('/manage',urlScreen.urlSizer,require('./router/manage/dataaccess'));

app.use('/map',urlScreen.urlSizer,require('./router/map/infoBorad'));
app.use('/dataConllection',require('./router/dataConllection/index'));
var port = normalizePort(process.env.PORT || config.app.webPort);
app.set('port', port);
var server = http.createServer(app);

// var device_scada = require('./router/scada/device');

// var scadaData = require('./router/scada/data');
// var cmsData = require('./router/cms/data');
// var eventSocketData = require('./router/eventsocket/data');
// var eventbus = require('./router/eventbus/data');
// var io = require('socket.io')(server);
// function socket_use(socket, path, router) {
//   router.socket_connect(socket,io);
//   socket.on(path + ':read', router.read);
//   socket.on(path + ':update', router.update);
//   socket.on(path + ':create', router.create);
//   socket.on(path + ':delete', router.delete);
//   socket.on('disconnect', router.disconnect);
// }

// io.sockets.on('connection', function(socket) {
//   socket_use(socket, 'scada', scadaData);
// 	socket_use(socket,'cms',cmsData);
// 	 socket_use(socket,'eventsocket',eventSocketData);
// 	 socket_use(socket,'eventbus',eventbus);
// });

// var eventsocket = new EventSocket(config);
// eventsocket.start();


server.listen(port);
console.log("server running on:" + port);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
