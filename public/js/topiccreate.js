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
    //获取到把标题文本元素对象
    var title = $("input[name='title']")
    //获取下拉框文本对象
    var type = $("select[name='type']")

    //判断类型值是否为0，假如为0 ，则提示请选择话题类型
    if (type.val() === '0') {
        return window.alert('请选择话题')
    }
    //判断标题的长度是否大于10个字，假如不大于提示重新设置标题
    if (title.val().length <= 10) {
        return window.alert('标题过短')
    }
    $.ajax({
            //请求方式
            type : "POST",
            //请求的媒体类型
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            //请求地址
            url : "/topic/create",
            //数据，json字符串
            data : {
                content: editor.txt.html(),
                type: type.val(),
                title: title.val()
            },
            //请求成功
            success : function(result) {
                // console.log(result);
                window.alert(result.message)
            },
            //请求失败，包含具体的错误信息
            error : function(e){
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
