var E = window.wangEditor
var editor = new E('#editor')

var imgEditor = new E('#div1')



//设置处理上传图片的路由指令
editor.customConfig.uploadImgServer = '/uploads'
// editor.customConfig.uploadImgShowBase64 = true   // 使用 base64 保存图片
// 或者 var editor = new E( document.getElementById('editor') )
editor.create()


//以html字符串的方式提交富文本内容
document.getElementById('btn1').addEventListener('click', function() {
    // 读取 html
    // alert(editor.txt.html())
    //发送一个ajax请求将文章的html提交到服务器
    //获取文章id
    var post_id = $(this).data('id')
    // console.log(post_id)
    $.ajax({
        //请求方式
        type: "POST",
        //请求的媒体类型
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        //请求地址
        url: "/comment",
        //数据，json字符串
        data: {
            content: editor.txt.html(),
            post_id: post_id
        },
        //请求成功
        success: function(result) {
            // console.log(result);
            window.alert(result.message)
        },
        //请求失败，包含具体的错误信息
        error: function(e) {
            console.log(e.status);
            console.log(e.responseText);
        }
    })
}, false)
//以纯文本的方式提交文本内容
document.getElementById('btn2').addEventListener('click', function() {
    // 读取 text
    alert(editor.txt.text())
}, false)