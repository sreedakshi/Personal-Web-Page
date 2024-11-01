// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
const createError = require('http-errors');

// Include the express module
const express = require('express');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// Path module - provides utilities for working with file and directory paths.
const path = require('path');

// Helps in managing user sessions
const session = require('express-session');

// include the mysql module
var mysql = require('mysql');

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// Include the express router. 
const utilities = require('./api/utilities');

const port = 9168;

// create an express application
const app = express();

// Use express-session
// In-memory session is sufficient for this assignment
app.use(session({
        secret: "csci4131secretkey",
        saveUninitialized: true,
        resave: false
    }
));

// middle ware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// server listens on port 9002 for incoming connections
app.listen(port, () => console.log('Listening on port', port));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/welcome.html'));
});

// app.use(bodyparser.urlencoded({extended:false}));
// app.use(bodyparser.json());

// GET method route for the contacts page.
// It serves contact.html present in public folder
app.get('/contacts', function (req, res) {
    console.log(req.session.user);
    if (!req.session.user) {  // attempted checking if the user is logged in but kept getting errors
        console.log("not logged in");
        res.redirect('/login');
    }
    else {
        console.log("logged in");
        res.sendFile(path.join(__dirname, '/public/contacts.html'));
    }
});

app.get('/login', function (req, res) {
    if (!req.session.user) {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
    else {
        res.redirect('/contacts');
    }
});

app.get('/addContact', function (req,res) {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else {
        res.sendFile(path.join(__dirname, 'addContact.html'));
    }
});

app.get('/stock', function (req,res) {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else {
        res.sendFile(path.join(__dirname, '/public/stock.html'));
    }
});

app.get('/logout', function (req,res) {
    req.session.destroy();
    res.redirect('/login');
});

// TODO: Add implementation for other necessary end-points

// Makes Express use a router called utilities
app.use('/api', utilities);

// function to return the 404 message and error to client
// app.use(function (req, res, next) {
//     next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     // res.render('error');
//     res.send();
// });

var parser = bodyparser.urlencoded({extended:false});
app.post('/check1', parser, function(req, res) {
    console.log("sree");
    var loginInfo = req.body;
    var login = loginInfo.login;
    var pwd = loginInfo.password;
    console.log(pwd);
    // Query the database tbl_login with login and hashed password
    // Provided there is no error, and the results set is assigned to a variable named rows:
    console.log("Before connection to database");
    const dbCon = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131S21U143",               // replace with the database user provided to you
        password: "20479",                  // replace with the database password provided to you
        database: "C4131S21U143",           // replace with the database user provided to you
        port: 3306
    });

    console.log("Attempting database connection");
    dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Connected to database!");

        const sql = "SELECT * FROM tbl_accounts WHERE acc_login=?";
        
        console.log("Attempting to access rows of tbl_accounts");
        dbCon.query(sql, login, function (err, result) {
            if (err) {
                throw err;
            }
            var bool = bcrypt.compareSync(pwd, result[0].acc_password);
            console.log("reachedbool");
            if (bool == true) {
                req.session.user = login;
                res.json({status: 'success'});
            }
            else {
                res.json({status: 'fail'});
            }
            console.log("Validated pwd with rows of result");
        });

        dbCon.end();
    // });
    // if (rows.length >=1){
    //     // the length should be 0 or 1, but this will work for now 
    //     //success, set the session, return success
    //     req.session.user = login;
    //     res.json({status:'success'});
    // }
    // else
    //     res.json({status:'fail'});
    });

});

app.get('/getContacts', function(req,res) {
    const dbCon = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131S21U143",               // replace with the database user provided to you
        password: "20479",                  // replace with the database password provided to you
        database: "C4131S21U143",           // replace with the database user provided to you
        port: 3306
    });

    console.log("Attempting database connection");
    dbCon.connect(function (err) {
        if (err) {
            throw err;
        }

        dbCon.query('SELECT * FROM tbl_contacts', function(err,result) {
            if (err) {
                throw err;
            }
            res.json(result);
        });

        dbCon.end();
    });
});

//var parser1 = bodyparser.json();
app.post('/additcontact', parser, function(req,res) {
    var contInfo = req.body;
    console.log(req.body);
    var namel = contInfo.name;
    var categoryl = contInfo.category;
    var locationl = contInfo.location;
    var contactl = contInfo.contact;
    var emaill = contInfo.email;
    var webnamel = contInfo.website_name;
    var weburll = contInfo.website_url;
    const dbCon = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131S21U143",               // replace with the database user provided to you
        password: "20479",                  // replace with the database password provided to you
        database: "C4131S21U143",           // replace with the database user provided to you
        port: 3306
    });

    console.log("Attempting database connection");
    dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
        var newContact = {
            name: namel,
            category: categoryl,
            location: locationl,
            contact_info: contactl,
            email: emaill,
            website: webnamel,
            website_url: weburll
        };

        console.log(newContact);

        dbCon.query('INSERT tbl_contacts SET ?', newContact, function(err,result) {
            if (err) {
                throw err;
            }
            res.redirect('/contacts');
        });

        dbCon.end();
    });
});