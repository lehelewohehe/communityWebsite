//加载express框架
var express = require('express')
//加载路径模块
var path = require('path')
//加载art-tempalete模块
var template = require('art-template')
//加载解析post请求体的第三方模块
var bodyParser = require('body-parser')
//加载expresssession的第三方模块
var express_session = require('express-session')

//加载所有的路由
var session = require('./routers/session')
var comment = require('./routers/comment')
var topic = require('./routers/topic')


//加载文件上传的第三方模块支持
// var multer  = require('multer')
// var upload = multer({ dest: 'uploads/' })

//创建express实例
var app = express()

//express_session相关配置
app.use(express_session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

//开放静态资源权限
app.use('/node_modules', express.static(path.join(__dirname, './node_modules/')))

app.use('/public', express.static(path.join(__dirname, './public/')))

//art-template的相关配置
app.engine('html', require('express-art-template'));
//如果想改变 render 第一个参数 页面的默认所在目录views 用下面这条代码改
app.set('views', path.join(__dirname, './views/'));
// template.config("escape", false)

//解析post请求体的第三方模块相关配置
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


//挂载路由
app.use(session)
app.use(comment)
app.use(topic)

//404页面的路由
app.use(function (req, res, next) {
	res.render('404.html', {title:'主页'})
})
// 配置一个全局错误处理中间件
// app.use(function (err, req, res, next) {
//   res.status(500).json({
//     err_code: 500,
//     message: err.message
//   })
// })


//开启服务器
app.listen(80, function () {
	console.log('running!!!!')
})