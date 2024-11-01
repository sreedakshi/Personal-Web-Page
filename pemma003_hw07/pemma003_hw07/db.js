// include the mysql module
var mysql = require('mysql');

const dbCon = mysql.createConnection({ //replace the strings with reading in dbconfig.xml
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131S21U143",               // replace with the database user provided to you
        password: "20479",                  // replace with the database password provided to you
        database: "C4131S21U143",           // replace with the database user provided to you
        port: 3306
});

module.exports = dbCon;