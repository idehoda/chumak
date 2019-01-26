const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const pug = require('pug');
// const mysql = require("mysql");
// const { pool } = require('./db');
const cookieParser = require('cookie-parser');
 
const { 
    homePageHandler,
    registerPageHandler,
    registerPagePostHandler,
    loginPageHandler,
    loginPagePostHandler,
    usersHandler,
    logoutHandler,
    idPageGetHandler,
    idPagePostHandler
} = require('./routes/index');


app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');

app.get('/', homePageHandler);
app.get('/users', usersHandler);

app.get('/register', registerPageHandler);
app.post('/register', registerPagePostHandler);

app.get('/login', loginPageHandler);
app.post('/login', loginPagePostHandler);
app.get('/logout', logoutHandler);

app.get('/users/:id', idPageGetHandler);
app.post('/users/:id', idPagePostHandler);

const port = 3000;
app.listen(port, () => console.log(`listening on port ${port}`))