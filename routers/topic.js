var express = require('express')
var path = require('path')

//加载mysql数据连接实例
var mysql = require('mysql')
var connection = require('../models/database')

// 加载文件上传的第三方模块支持 设置存放上传文件的位置
var multer = require('multer')
var upload = multer({ dest: path.join(__dirname, '../public/upload/') });

var router = express.Router()

//定义一个全局对象，用来管理侧边栏加载哪几个部分,默认全部为true
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

//管理load_siderbar对象的函数
function setLoadSiderbar(arr) {
    if (arr.length !== 8) {
        return console.log('传值错误')
    }
    var index = 0
    for (let key in load_siderbar) {
        load_siderbar[key] = arr[index++]
    }
}
//同步模式下错误消息响应封装
function reponseError(arr, page, res_code, err_code, err_message, title, res) {
    setLoadSiderbar(arr)
    res.render(page, {
        title: title,
        load_siderbar: load_siderbar,
        err_message: err_message,
        err_code: err_code,
        res_code: res_code
    })
}

//转换时间戳为指定内容的字符串
function parseTimeStamp(timeStamp) {
    //获取当前时间和传入时间的时间差
    var difference = (Date.now() - timeStamp) / 1000

    // num = new Number('1.111e+84')
    // num = num.toLocaleString()
    //将时间差转换为天或者小时分钟
    var years = parseInt(new Number(difference / 3600 / 24 / 365).toLocaleString())
    if (years) {
        // console.log(Date.now(), timeStamp, 'uuuuuuuuuuuuuuuu')
        return years + '年前'
    }
    var months = parseInt(new Number(difference / 3600 / 24 / 30).toLocaleString())
    if (months) {
        return years + '月前'
    }
    var days = parseInt(new Number(difference / 3600 / 24).toLocaleString())
    if (days) {
        return days + '天前'
    }
    var hours = parseInt(new Number(difference / 3600).toLocaleString())
    if (hours) {
        return hours + '小时前'
    }
    var minutes = parseInt(new Number(difference / 60).toLocaleString())
    if (minutes) {
        return minutes + '分钟前'
    }
    return '刚刚'
}

//发表话题相关的路由


//获取创建话题的页面
router.get('/topic/create', function(req, res, next) {
    if (req.session.user) {
        res.render('topic_create.html', {
            title: 'topic_create',
            session: req.session.user
        })
    } else {
        next()
    }
})
//发送创建话题的post请求
router.post('/topic/create', function(req, res, next) {
    //接收数据以及初始化数据
    var user_id = req.session.user.user_id
    var post_content = req.body.content
    var post_type = req.body.type
    var post_title = req.body.title
    var comment_number = 0
    var browse_number = 0
    var create_time = Date.now()
    connection = mysql.createConnection(connection.config)
    connection.connect()
    //将发过来的数据存储到数据库
    var addSql = `INSERT INTO post_info(post_id,user_id,post_content,post_type,post_title,comment_number,browse_number,create_time) 
    VALUES(null,${user_id},'${post_content}',${post_type},'${post_title}',${comment_number},${browse_number},'${create_time}')`
    //增
    connection.query(addSql, function(err, result) {
        if (err) {
            return res.send({
                success: false,
                message: err.message
            })
        }
        res.send({
            success: true,
            message: 'success'
        })
        connection.end()
    })

})



//get请求浏览文章页面
router.get('/article', function(req, res, next) {
    //获取到文章对应的id
    var post_id = req.query.id
    // console.log(post_id)
    if (!post_id) {
        console.log('1')
        return res.render('404.html')
    }
    //，获取新的连接实例，重新连接数据库，好像一个实例只能做一次请求
    connection = mysql.createConnection(connection.config)
    connection.connect()
    // `select post_info.*,avatar,user_name,personalize,comment_content,comment_info.create_time as 'ccreate_time' from post_info, user_info,comment_info 
    // where post_info.post_id=${post_id} and post_info.user_id=user_info.user_id and comment_info.post_id =post_info.post_id `
    //获取到文章相关的信息
    var sql = `select post_info.*,avatar,user_name,personalize from post_info, user_info where post_info.post_id=${post_id} and post_info.user_id=user_info.user_id`
    connection.query(sql, function(err, result) {
        if (err) {
            console.log('3')
            return res.render('404.html')
        }
        if (!result.length) {
            console.log('4')
            connection.end()
            return res.render('404.html')
        }
        //去掉结果中的RowDataPacket
        post_result = JSON.parse(JSON.stringify(result))
        // console.log(post_result[0])
        post_result[0].create_time = parseTimeStamp(post_result[0].create_time)

        //程序执行到此处时，已经成功获取到文章的内容，此时记作一次浏览
        //查询数据库对文字表的浏览数据做修改
        sql = `UPDATE post_info SET browse_number=browse_number + 1 where post_id = ${post_id}`
        connection.query(sql, function(err, result) {
            if (err) {
                console.log('[DELETE ERROR] - ', err.message);
                return res.render('404.html')
            }
        });

        //查询到文章相关的评论
        sql = `select avatar,user_name,comment_content,comment_info.create_time  from user_info,comment_info 
     where user_info.user_id=comment_info.comment_user_id and comment_info.post_id=${post_id} order by comment_info.create_time`
        connection.query(sql, function(err, result) {
            if (err) {
                console.log('5dasdasdasd')
                return res.render('404.html')
            }
            //去掉结果中的RowDataPacket
            comment_result = JSON.parse(JSON.stringify(result))
            // console.log(comment_result)
            comment_result.forEach(function(item, index) {
                item.create_time = parseTimeStamp(item.create_time)
            })
            //将数据渲染到页面
            setLoadSiderbar([1, 0, 0, 1, 1, 0, 1, 1])
            if (!req.session.user) {
                res.render('article.html', {
                    session: false,
                    title: 'article',
                    load_siderbar: load_siderbar,
                    post_result: post_result[0],
                    comment_result: comment_result
                })
            } else {
                res.render('article.html', {
                    session: req.session.user,
                    title: 'article',
                    load_siderbar: load_siderbar,
                    post_result: post_result[0],
                    comment_result: comment_result
                })
            }
            connection.end()
        })
    })
})
// //提交文本的路由
// router.post('/comment', function (req, res, next) {
//     console.log(req.body)
//     res.send({success:'ok'})
// })



module.exports = router