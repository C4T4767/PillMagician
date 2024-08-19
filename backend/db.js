var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'dbid241',
    password: 'dbpass241',
    database: 'db24103',
});
connection.connect();



// 로컬
// const connection = mysql.createConnection({
//   host : 'localhost',
//   user : 'nodejs',
//   password : 'nodejs',
//   database : 'webdb2023',
//   connectionLimit: 5,
//   });

  module.exports = connection;

