const { getConnection } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const homePageHandler = (req, res) => {
    res.send("home page");
}
const registerPageHandler = (req, res) => {
    res.render("register");
} 
const usersHandler = (req, res) => {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ auth: false, message: 'No token provided.' });
    }
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
          return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
      }
      getConnection((err, client) => {
          client.query('SELECT * FROM student', function(err, rows) {
              if(err){
                  console.log('Query Error');
              }
              res.json(rows);
              client.release();
          });
      });  
    });
}
const registerPagePostHandler = (req, res) => {
    const { name, kierunek, email, phone, password } = req.body;
    let hashedPassword = bcrypt.hashSync(password, 10);

    getConnection((err, client) => {
        const query =`INSERT INTO student (name,kierunek,email,phone, password) values 
            ('${name}','${kierunek}','${email}',${phone},'${hashedPassword}')`;
        client.query(query, function(err, result, fileds) {
            if(err){
                console.log('Query Error', err);
            }      
            console.log(result);
            const token = jwt.sign({ id: result.insertId}, config.secret, {
                expiresIn: 86400
            });
            client.release();
            res.cookie('token', token);
            res.redirect('/users');
        });
    });  
}
const loginPageHandler = (req, res) => {
    res.render('login');
}
const loginPagePostHandler = (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM student WHERE email = '${email}'`;
    getConnection((error, client) => {
        if(error) {
            res.send(error);
        }
        client.query(query, function(err, rows) {
            if(err){
                console.log('Query Error', err);
            }
            if(rows[0]){
                client.release();
                bcrypt.compare(password, rows[0].password, (err, response) => {
                    if(response){
                        const token = jwt.sign({ id: rows[0].student_id}, config.secret, {
                            expiresIn: 86400
                        });
                        res.cookie('token', token);
                        res.redirect('/users');
                    } else {
                        res.render('login', { message: "wrong password 😟"});
                    }
                })
            } else {
                res.render('login', { message: "email not found 😢"});
            }
        });
    });  
}

module.exports = {
    homePageHandler,
    registerPageHandler,
    registerPagePostHandler,
    loginPageHandler,
    loginPagePostHandler,
    usersHandler
}