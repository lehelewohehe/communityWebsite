var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'znode'
})


// //数据库连接
// connection.connect()

module.exports = connection