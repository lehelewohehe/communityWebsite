// var express = require('express')
// var multer  = require('multer')
// var upload = multer({ dest: 'uploads/' })
// var template = require('art-template')
// var path = require('path')
// var app = express()

// //开放静态资源权限
// app.use('/node_modules', express.static(path.join(__dirname, './node_modules/')))

// app.use('/public', express.static(path.join(__dirname, './public/')))

// //art-template的相关配置
// app.engine('html', require('express-art-template'));
// //如果想改变 render 第一个参数 页面的默认所在目录views 用下面这条代码改
// app.set('views', path.join(__dirname, './views/'));


// app.get('/register', function(req, res, next) {
//     res.render('register.html', {
//         title: 'register',
//         personinfo: false,
//         login: true,
//         issuetopic:false,
//         banner: true,
//         noresponse: false,
//         top: false,
//         community: true,
//         qrcode: true
//     })
// })
// app.post('/register', upload.single('avatar'), function (req, res, next) {
//   console.log(req.file)
//   console.log(req.body)
// })

// // app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
// //   // req.files 是 `photos` 文件数组的信息
// //   // req.body 将具有文本域数据，如果存在的话
// // })

// // var cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
// // app.post('/cool-profile', cpUpload, function (req, res, next) {
// //   // req.files 是一个对象 (String -> Array) 键是文件名，值是文件数组
// //   //
// //   // 例如：
// //   //  req.files['avatar'][0] -> File
// //   //  req.files['gallery'] -> Array
// //   //
// //   // req.body 将具有文本域数据，如果存在的话
// // })
// // 如果你需要处理一个只有文本域的表单，你应当使用 .none():

// // var express = require('express')
// // var app = express()
// // var multer  = require('multer')
// // var upload = multer()

// // app.post('/profile', upload.none(), function (req, res, next) {
// //   // req.body 包含文本域
// // })
// //开启服务器
// app.listen(80, function () {
//   console.log('running!!!!')
// })
var load_siderbar = {
    personinfo: true, //个人信息
    login: true, //登录部分
    issuetopic: true, //发表话题
    banner: true, //广告
    noresponse: true, //无人回复的话题
    top: true, //积分榜
    community: true, //社区
    qrcode: true //二维码
}
console.log([RowDataPacket load_siderbar])