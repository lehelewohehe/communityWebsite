$(function() {
    //为文件与注册状态改变事件
    $("input[type='file']").on('change', function(e) {
        var file = this.files[0];
        if (window.FileReader) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            //监听文件读取结束后事件    
            reader.onloadend = function(e) {
                $('#avatar').attr("src", e.target.result); //e.target.result就是最后的路径地址
            };
        }
    })
})