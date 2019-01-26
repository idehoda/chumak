const mysql = require("mysql");

const pool = mysql.createPool({
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    aquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host     : '85.10.205.173',
    port     :  3306,
    user     : 'chumak',
    password : 'Island2018',
    database : 'chumak',
    connectionLimit : 10,
});


  module.exports = {
    pool
  }