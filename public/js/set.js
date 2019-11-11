$(function() {
    //上传图片的方法
    function uploadFile() {
        var file = document.getElementById("exampleInputFile")
        var formData = new FormData()
        formData.append('avatar', file.files[0])
        $.ajax({
            url: '/set/updataimg',
            type: 'POST',
            data: formData,
            // async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                if (0 === data.err_code) {
                    $('#result').html(data.err_message);
                    window.location.reload()
                } else {
                    $('#result').html(data.err_message);
                }
            },
            error: function() {
                $("#result").html("与服务器通信发生错误")
            }
        })
    }

    //发送修改图片得额ajax请求
    $('#imgbtn').on('click', function() {
        uploadFile()
    })


    //发送修改信息的ajax请求
    $('#updata_info_form').on('submit', function(e) {
        e.preventDefault()
        var formData = $(this).serialize()
        $.ajax({
            url: '/set/updatainfo',
            type: 'post',
            data: formData,
            dataType: 'json',
            success: function(data) {
                if (data.err_code === 0) {
                    // 服务端重定向针对异步请求无效
                    window.location.reload()
                    $('#result_info').html(data.err_message)
                } else {
                    $('#result_info').html(data.err_message)
                }
            }
        })
    })


    //发送修改密码的ajax请求
    $('#updata_password_form').on('submit', function(e) {
        e.preventDefault()
        var formData = $(this).serialize()
        $.ajax({
            url: '/set/updatapassword',
            type: 'post',
            data: formData,
            dataType: 'json',
            success: function(data) {
                if (data.err_code === 0) {
                    window.alert('密码修改成功！')
                    // 服务端重定向针对异步请求无效
                    window.location.href = '/quit'
                } else {
                    $('#result_pwd').html(data.err_message);
                }
            }
        })
    })
})