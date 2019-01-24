const mysql = require("mysql");

const pool = mysql.createPool({
    connectionLimit : 100,
    host     : '85.10.205.173',
    port     :  3306,
    user     : 'chumak',
    password : 'Island2018',
    database : 'chumak',
});

const getConnection = (callback) => {
    pool.getConnection((err, conn) => {
      if(err) {
        return callback(err);
      }
      callback(err, conn);
    });
  };

  module.exports = {
    pool,
    getConnection
  }