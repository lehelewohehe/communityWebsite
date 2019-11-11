var express = require('express')
var path = require('path')
var fs = require('fs')
//加载MD5加密第三方模块
var md5 = require('blueimp-md5')
//加载mysql数据连接实例
var mysql = require('mysql')
var connection = require('../models/database')
//加载MD5第三方模块
var md5 = require('blueimp-md5')

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
function reponseError(arr, page, res_code, err_code, err_message, title, res, req) {
    setLoadSiderbar(arr)
    if (req) {
        fs.unlink(req.file.path, function(err) {
            if (err) {
                return res.send({
                    err_code: 500,
                    err_message: '服务器忙，请稍后重试'
                })
            }
            console.log("文件删除成功！")
            res.render(page, {
                title: title,
                load_siderbar: load_siderbar,
                err_message: err_message,
                err_code: err_code,
                res_code: res_code
            })
        })
    } else {
        res.render(page, {
            title: title,
            load_siderbar: load_siderbar,
            err_message: err_message,
            err_code: err_code,
            res_code: res_code
        })
    }
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
        console.log(Date.now(), timeStamp, 'uuuuuuuuuuuuuuuu')
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



// 加载文件上传的第三方模块支持 设置存放上传文件的位置
var multer = require('multer')
var upload = multer({ dest: path.join(__dirname, '../public/upload/') });

var router = express.Router()


//用户登录get请求
router.get('/login', function(req, res, next) {
    res.render('login.html', { title: 'login' })
})

//用户登录post请求
router.post('/login', function(req, res, next) {
    // res.render('login.html', { title: 'login' })
    // console.log(req.body)
    var email = req.body.email
    var password = md5(md5(req.body.password))
    connection = mysql.createConnection(connection.config)
    connection.connect()

    var sql = `select * from user_info where email='${email}' and dense_code='${password}'`
    //查
    connection.query(sql, function(err, result) {
        if (err) {
            return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'login.html', 500, 505, err_message, 'login', res)
        }

        if (!result.length) {
            connection.end()
            return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'login.html', 200, 101, '邮箱账号不匹配', 'login', res)
        }

        //去掉结果中的RowDataPacket
        result = JSON.parse(JSON.stringify(result))
        //登录成功。则设置session
        req.session.user = result[0]
        connection.end()
        //重定向到首页，并且渲染页面
        res.redirect('/')
    })
})

//用户注册get请求
router.get('/register', function(req, res, next) {
    setLoadSiderbar([0, 1, 0, 1, 0, 0, 1, 1])
    res.render('register.html', {
        title: 'register',
        load_siderbar: load_siderbar,
    })
})


// 用户注册post请求
router.post('/register', upload.single('avatar'), function(req, res, next) {
    // 数据校验
    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    var file = req.file
    var agree = req.body.agree
    var confirm = req.body.confirm
    var personalize = '他很懒，什么都没有写'

    //判断是否同意协议
    var flag = agree && agree === 'true'
    if (!flag) {
        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 1, '请同意协议', 'register', res, req)
    }
    //密码校验
    if (password !== confirm || password === '') {
        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 2, '两次密码不一致', 'register', res, req)
    }

    //上传的图片校验
    // 1.判断是否上传
    if (!file) {
        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 3, '没有上传图片', 'register', res, req)
    }
    // 2.判断是否是图片
    if (file.mimetype.indexOf('image')) {
        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 4, '上传的不是图片', 'register', res, req)
    }
    // 3.判断文件大小是否符合要求
    if (file.size > 2 * 1024 * 1024) {
        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 5, '上传图片过大', 'register', res, req)
    }

    //邮箱的相关校验
    //1.判断是否是邮箱
    flag = /[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}/.test(email)
    if (!flag) {
        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 6, '邮箱格式错误', 'register', res, req)
    }
    //2.判断是否是被注册
    connection = mysql.createConnection(connection.config)
    connection.connect();

    var sql = `select * from user_info where email='${email}'`
    //查
    connection.query(sql, function(err, result) {
        if (err) {
            return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 500, 501, err.message, 'register', res, req)
        }
        if (result.length) {
            connection.end()
            return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 7, '邮箱已被注册', 'register', res, req)
        }

        //用户名校验
        sql = `select * from user_info where user_name='${username}'`
        connection.query(sql, function(err, result) {
            if (err) {
                return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 500, 502, err.message, 'register', res, req)
            }
            if (result.length) {
                connection.end()
                return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 8, '用户名已存在', 'register', res, req)
            }

            //验证通过，写入数据库=
            var avatar = '/public/upload/' + file.filename
            var score = 0
            var create_time = Date.now()
            password = md5(md5(password))
            //所有提交的数据符合要求后，将数据写入数据库
            addSql = `INSERT INTO user_info(user_id,user_name,email,dense_code,personalize,integral,avatar,create_time) 
            VALUES(null,'${username}','${email}','${password}','${personalize}',${score},'${avatar}','${create_time}')`
            //增
            connection.query(addSql, function(err, result) {
                if (err) {
                    return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 500, 503, err.message, 'register', res, req)
                }
                console.log('INSERT ID:', result);
                sql = `select * from user_info where email='${email}' and dense_code='${password}'`
                //查
                connection.query(sql, function(err, result) {
                    if (err) {
                        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 500, 504, err.message, 'register', res, req)
                    }

                    if (!result.length) {
                        connection.end()
                        return reponseError([0, 1, 0, 1, 0, 0, 1, 1], 'register.html', 200, 9, '邮箱账号不匹配', 'register', res, req)
                    }

                    //去掉结果中的RowDataPacket
                    result = JSON.parse(JSON.stringify(result))
                    //登录成功。则设置session
                    req.session.user = result[0]
                    connection.end()
                    //重定向到首页，并且渲染页面
                    res.redirect('/')
                }) //页面跳转结束
            }) //数据写入结束
        }) //用户名验证结束
    }) //邮箱验证结束
}) ///register路由结束

//获取主页面
router.get('/', function(req, res, next) {
    //获取get中的参数
    var page = req.query.page
    var id = req.query.id
    if (!page || page <= 0) {
        page = 1
    }
    var pageNum = 40

    //从数据库获取文章数据
    connection = mysql.createConnection(connection.config)
    connection.connect();
    // sql = `select post_info.*,user_info.avatar from post_info, user_info where post_info.user_id=user_info.user_id  order by browse_number desc LIMIT 40 offset ${offset}`
    // sql = `select post_info.*,user_info.avatar from post_info, user_info where post_info.user_id=user_info.user_id and post_type=${id} order by browse_number desc LIMIT 40 offset ${offset}`

    function simpleEncapsulation(sql) {
        connection.query(sql, function(err, result) {
            if (err) {
                return reponseError([0, 1, 0, 1, 1, 1, 1, 1], 'index.html', 500, 504, err.message, 'index', res)
            }
            //去掉结果中的RowDataPacket
            result = JSON.parse(JSON.stringify(result))
            var num = Math.ceil(result.length / pageNum)
            if (num < page) {
                page = num
            }
            if (!page || page <= 0) {
                page = 1
            }
            var offset = (page - 1) * pageNum
            //查
            sql = sql + ` order by browse_number desc LIMIT 40 offset ${offset}`
            console.log(sql)
            connection.query(sql, function(err, result) {
                if (err) {
                    return reponseError([0, 1, 0, 1, 1, 1, 1, 1], 'index.html', 500, 504, err.message, 'index', res)
                }
                //去掉结果中的RowDataPacket
                result = JSON.parse(JSON.stringify(result))
                for (var i = 0; i < result.length; i++) {
                    result[i].create_time = parseTimeStamp(result[i].create_time)
                }
                connection.end()
                if (!req.session.user) {
                    setLoadSiderbar([0, 1, 0, 1, 1, 1, 1, 1])
                    res.render('index.html', {
                        session: false,
                        title: 'index',
                        load_siderbar: load_siderbar,
                        result: result,
                        num: num,
                        page: page,
                        id: id
                    })
                } else {
                    setLoadSiderbar([1, 0, 1, 1, 1, 1, 1, 1])
                    res.render('index.html', {
                        session: req.session.user,
                        title: 'index',
                        load_siderbar: load_siderbar,
                        result: result,
                        num: num,
                        page: page,
                        id: id
                    })
                }
            })
        })
    }
    var sql
    if (!id) {
        sql = `select post_info.*,user_info.avatar from post_info, user_info where post_info.user_id=user_info.user_id`
        simpleEncapsulation(sql)
    } else {
        if (id < 0 || id > 4) {
            id = 1
        }
        sql = `select post_info.*,user_info.avatar from post_info, user_info where post_info.user_id=user_info.user_id and post_type=${id}`
        simpleEncapsulation(sql)
    }
})

//退出
router.get('/quit', function(req, res, next) {
    delete req.session.user
    //重定向到首页，并且渲染页面
    res.redirect('/login')
})


//get请求新手入门的页面
router.get('/novice', function(req, res, next) {
    if (!req.session.user) {
        setLoadSiderbar([0, 1, 0, 1, 0, 0, 1, 1])
        res.render('novice.html', {
            session: false,
            title: 'novice',
            load_siderbar: load_siderbar
        })
    } else {
        setLoadSiderbar([1, 0, 1, 1, 0, 0, 1, 1])
        res.render('novice.html', {
            session: req.session.user,
            title: 'novice',
            load_siderbar: load_siderbar
        })
    }
})

//get请求api的页面
router.get('/api', function(req, res, next) {
    res.render('api.html', { title: 'api' })
})

//get请求关于的页面
router.get('/about', function(req, res, next) {
    if (!req.session.user) {
        setLoadSiderbar([0, 1, 0, 1, 0, 0, 1, 1])
        res.render('about.html', {
            session: false,
            title: 'about',
            load_siderbar: load_siderbar
        })
    } else {
        setLoadSiderbar([1, 0, 1, 1, 0, 0, 1, 1])
        res.render('about.html', {
            session: req.session.user,
            title: 'about',
            load_siderbar: load_siderbar
        })
    }
})


//关于设置个人信息得get请求
router.get('/set', function(req, res, next) {
    if (req.session.user) {
        setLoadSiderbar([1, 0, 1, 1, 1, 1, 1, 1])
        return res.render('set.html', {
            title: 'set',
            session: req.session.user,
            load_siderbar: load_siderbar,
            // result: result
        })
    }
    res.render('404.html')
})


//设置个人信息修改密码的post请求
router.post('/set/updatapassword', function(req, res, next) {
    // console.log(req.body)
    //获取到请求体发送过来的数据
    var password = req.body.password
    var new_password = req.body.newpassword
    var new_confirm = req.body.newconfirm
    var user_id = req.session.user.user_id


    //比对两次密码是否一致
    //密码校验
    if (new_password !== new_confirm || new_password === '') {
        return res.send({
            err_code: 1,
            err_message: '两次密码不一致'
        })
    }
    password = md5(md5(password))
    //原密码校验
    connection = mysql.createConnection(connection.config)
    connection.connect()
    //获取到文章相关的信息
    var sql = `select * from user_info where dense_code='${password}' and user_id=${user_id}`
    console.log(sql)
    connection.query(sql, function(err, result) {
        if (err) {
            connection.end()
            return res.send({
                err_code: 500,
                err_message: '服务器忙，请稍后重试'
            })
        }
        if (!result.length) {
            connection.end()
            return res.send({
                err_code: 2,
                err_message: '原密码错误'
            })
        }
        new_password = md5(md5(new_password))
        sql = `update user_info set dense_code='${new_password}' where user_id=${user_id}`
        connection.query(sql, function(err, result) {
            if (err) {
                connection.end()
                return res.send({
                    err_code: 500,
                    err_message: '服务器忙，请稍后重试'
                })
            }
            connection.end()
            return res.send({
                err_code: 0,
                err_message: '修改成功'
            })
        })
    })
})


//设置个人信息修改信息的post请求
router.post('/set/updatainfo', function(req, res, next) {
    //获取到请求体发送过来的数据
    var email = req.body.email
    var user_name = req.body.username
    var textarea = req.body.textarea
    var user_id = req.session.user.user_id

    //原密码校验
    connection = mysql.createConnection(connection.config)
    connection.connect()
    //获取到文章相关的信息
    var sql = `select * from user_info where email='${email}' or user_name='${user_name}'`
    connection.query(sql, function(err, result) {
        if (err) {
            connection.end()
            return res.send({
                err_code: 500,
                err_message: '服务器忙，请稍后重试'
            })
        }
        if (result.length) {
            connection.end()
            return res.send({
                err_code: 1,
                err_message: '用户名或者邮箱已被注册'
            })
        }

        sql = `update user_info set personalize='${textarea}',user_name='${user_name}',email='${email}'
         where user_id=${user_id}`
        connection.query(sql, function(err, result) {
            if (err) {
                connection.end()
                return res.send({
                    err_code: 500,
                    err_message: '服务器忙，请稍后重试'
                })
            }
            //修改sesion里面的对应的值
            req.session.user.personalize = textarea
            req.session.user.user_name = user_name
            req.session.user.email = email
            return res.send({
                err_code: 0,
                err_message: '用户信息修改成功'
            })
        })
    })
})

//修改头像的post请求
router.post('/set/updataimg', upload.single('avatar'), function(req, res, next) {
    if (!req.file) {
        return res.send({
            err_code: 500,
            err_message: '请选择头像'
        })
    }
    // 2.判断是否是图片
    if (req.file.mimetype.indexOf('image')) {
        fs.unlink(req.file.path, function(err) {
            if (err) {
                return res.send({
                    err_code: 500,
                    err_message: '服务器忙，请稍后重试'
                })
            }
            console.log("文件删除成功！")
            return res.send({
                err_code: 500,
                err_message: '请选择头像文件，上传失败'
            })
        })
        return
    }
    // 3.判断文件大小是否符合要求
    if (req.file.size > 2 * 1024 * 1024) {
        fs.unlink(req.file.path, function(err) {
            if (err) {
                return res.send({
                    err_code: 500,
                    err_message: '服务器忙，请稍后重试'
                })
            }
            console.log("文件删除成功！")
            return res.send({
                err_code: 500,
                err_message: '选择的头像过大，上传失败'
            })
        })
        return
    }
    //当前的头象的路径
    var unlinkPath = 'C:/Users/zq/Desktop/znode' + req.session.user.avatar
    //上传过来新头想的url路径
    var newUrlPath = '/public/upload/' + req.file.filename
    var user_id = req.session.user.user_id

    //修改数据库中该用户的头像路径
    //原密码校验
    connection = mysql.createConnection(connection.config)
    connection.connect()
    var sql = `update user_info set avatar='${newUrlPath}' where user_id=${user_id}`
    connection.query(sql, function(err, result) {
        if (err) {
            connection.end()
            console.log('334534566')
            return res.send({
                err_code: 500,
                err_message: '服务器忙，请稍后重试'
            })
        }
        //修改sesion里面的对应的值
        req.session.user.avatar = newUrlPath
        // 修改成功之后删除之前的头象
        fs.unlink(unlinkPath, function(err) {
            if (err) {
                return res.send({
                    err_code: 500,
                    err_message: '服务器忙，请稍后重试'
                })
            }
            console.log("文件删除成功！")
            connection.end()
            return res.send({
                err_code: 0,
                err_message: '用户信息修改成功'
            })
        })
    })


    console.log(unlinkPath)
    console.log(req.file)
    console.log(req.files)
})

module.exports = router