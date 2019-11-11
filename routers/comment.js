var express = require('express')
var path = require('path')

//加载mysql数据连接实例
var mysql = require('mysql')
var connection = require('../models/database')

// 加载文件上传的第三方模块支持 设置存放上传文件的位置
var multer = require('multer')
var upload = multer({ dest: path.join(__dirname, '../public/upload/') });

var router = express.Router()




//上传图片的路由
router.post('/uploads', upload.any(), function(req, res, next) {
    //定义一个数组，用来存储所有的图片路径
    var arrPath = []
    for (var i = 0; i < req.files.length; i++) {
        var path = "/public/upload/" + req.files[i].filename;
        arrPath.push(path)
    }
    res.send({
        "errno": 0,
        "data": arrPath
    })
})


//提交文本的路由
router.post('/comment', function(req, res, next) {
    console.log(req.body)
    // 获取提交过来的评论数据以及文章相关的数据
    var comment_content = req.body.content
    var comment_user_id = req.session.user.user_id
    var create_time = Date.now()
    var post_id = req.body.post_id
    connection = mysql.createConnection(connection.config)
    connection.connect();
    var addSql = `INSERT INTO comment_info(comment_id,comment_user_id,comment_content,post_id,create_time) 
    VALUES(null,${comment_user_id},'${comment_content}',${post_id},'${create_time}')`
    //增
    connection.query(addSql, function(err, result) {
        if (err) {
            // return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 500, 503, err.message, 'register', res)
            return res.send({
                success: false,
                message: err.message
            })
        }
        //程序执行到此处时，已经成功获取到文章的内容，此时记作一次浏览
        //查询数据库对文字表的浏览数据做修改
        sql = `UPDATE post_info SET comment_number=comment_number + 1 where post_id = ${post_id}`
        connection.query(sql, function(err, result) {
            if (err) {
                console.log('[DELETE ERROR] - ', err.message);
                return res.render('404.html')
            }
            connection.end()
            console.log('INSERT ID:', result);
            res.send({
                success: true,
                message: 'success'
            })
        });
    })

})


module.exports = router