
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');


const getConnection = (callback) => {
    pool.getConnection((err, conn) => {
      if(err) {
        return callback(err);
      }
      callback(err, conn);
    });
  };



const homePageHandler = (req, res) => {
    const token = req.cookies.token;
    if(token){
        const { id } = jwt.verify(token, config.secret);
        getConnection((err, client) => {
            if(err){
                console.log(err);
                client.release();
                return res.send(400, 'Couldnt get a connection');
            }
            client.query(`SELECT * FROM student where student_id=${id}`, function(err, rows) {
                if(err){
                     console.log(err);
                    client.release();
                    return res.send(400, 'Couldnt get a connection');
                }
                client.release();
                res.render("index", { credentials: rows[0], isLogged: true});
            });
        }); 
    } else {
        res.render("index", { credentials: "", isLogged: false });
    }
}

const registerPageHandler = (req, res) => {
    res.render("register");
} 
const usersHandler = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.render("users", { credentials:"", isLogged: false});
    }
    const { id } = jwt.verify(token, config.secret);
    getConnection((err, client) => {
        if(err){
            console.log(err);
            client.release();
            return res.send(400, 'Couldnt get a connection');
        }
        client.query(`SELECT * FROM student where student_id=${id}`, function(err, rows) {
            if(err){
                console.log(err);
                client.release();
                return res.send(400, 'Couldnt get a connection');
            }
            const user = rows[0];
                getConnection((err, client) => {
                    if(err){
                        console.log(err);
                        client.release();
                        return res.send(400, 'Couldnt get a connection');
                    }
                    client.query('SELECT * FROM student', function(err, studentsRows) {
                        if(err){
                            client.release();
                            return res.send(400, 'Couldnt get users');
                        }
                        const students = studentsRows;
                        client.release();
                        res.render("users", { credentials: user, isLogged: true, students});
                    });
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
    res.render('login', {renderBar: true});
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
                        const back = req.get('Origin');
                        res.redirect(back);
                        
                    } else {
                        res.render('login', { message: "wrong password 😟, renderBar: false"});
                    }
                })
            } else {
                res.render('login', { message: "email not found 😢, renderBar: false"});
            }
        });
    });  
}
const logoutHandler = (req, res) => {
    res.clearCookie("token");
    res.redirect('back');
} 
const idPageGetHandler = (req, res) => {
    const { id } = req.params;
    getConnection((err, client) => {
        if(err){
            console.log(err);
            client.release();
            return res.send(400, 'Couldnt get a connection');
        }
        client.query(`SELECT * FROM student where student_id=${id}`, function(err, rows) {
            if(err){
                client.release();
                return res.send(400, 'Couldnt get a connection');
            }
            const user = rows[0];
            const token = req.cookies.token;
            const tokenId = jwt.verify(token, config.secret).id;
;
            if(!user){
                client.release(); 
                return res.render("error", {message: `🤔 nie ma uzytkownika z id = ${id}`});
            }
            if (!token) {
                client.release(); 
                return res.render('login', { message: "Musisz sie zalogować! 😟", renderBar: false});
            }
            if(tokenId !== parseInt(id)) {
                client.release(); 
                return res.render('login', { message: "Nie twoj profil! zaloguj sie ponownie! 😟", renderBar: false});
            } 

            res.render('edit', {credentials: user});
        
        });
    }); 
    
}
const idPagePostHandler = (req, res) => {
    const { name, kierunek, email, phone } = req.body;
    const { id } = req.params;
    console.log(id);

    getConnection((err, client) => {
        const query = `UPDATE student SET 
            name='${name}',kierunek='${kierunek}',email='${email}',phone=${phone}
            WHERE student_id='${id}'`;
        client.query(query, function(err, result, fileds) {
            if(err){
                console.log('Query Error', err);
            }      
            client.release();
            res.redirect('/users');
        });
    });  
}

module.exports = {
    homePageHandler,
    registerPageHandler,
    registerPagePostHandler,
    loginPageHandler,
    loginPagePostHandler,
    usersHandler,
    logoutHandler,
    idPageGetHandler,
    idPagePostHandler
}
