const express = require('express')
const router = express.Router()
const dbCon = require('../db.js')
const bodyparser = require('body-parser')
// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

router.get('/contacts', function (req, res) {

    // dbCon.connect(function (err) {
    //     if (err) {
    //         throw err;
    //     }

        dbCon.query('SELECT * FROM tbl_contacts', function(err,result) {
            if (err) {
                throw err;
            }
            res.json(result);
        });

        // dbCon.end();
    // });
});

var parser = bodyparser.urlencoded({extended:false});
router.post('/check1', parser, function(req, res) {
    var loginInfo = req.body;
    var login = loginInfo.login;
    var pwd = loginInfo.password;
    // Query the database tbl_login with login and hashed password
    // Provided there is no error, and the results set is assigned to a variable named rows:

    // dbCon.connect(function (err) {
    //     if (err) {
    //         throw err;
    //     }

        const sql = "SELECT * FROM tbl_accounts WHERE acc_login=?";
        
        dbCon.query(sql, login, function (err, result) {
            if (err) {
                throw err;
            }
            console.log(pwd);
            var bool = bcrypt.compareSync(pwd, result[0].acc_password);
            if (bool == true) {
                req.session.user = login;
                res.json({status: 'success'});
            }
            else {
                res.json({status: 'fail'});
            }
        });

    //     dbCon.end();
    // });

});

router.post('/addContact', parser, function(req,res) {
    var contInfo = req.body;
    var namel = contInfo.name;
    var categoryl = contInfo.category;
    var locationl = contInfo.location;
    var contactl = contInfo.contact_info;
    var emaill = contInfo.email;
    var weburll = contInfo.website_url;

    // dbCon.connect(function (err) {
    //     if (err) {
    //         throw err;
    //     }
        var newContact = {
            name: namel,
            category: categoryl,
            location: locationl,
            contact_info: contactl,
            email: emaill,
            website: weburll
        };

        console.log(newContact);

        dbCon.query('SELECT * FROM tbl_contacts WHERE name=?', [namel], function(err, result) {
        	if(err) {
        		throw err;
        	}
        	if (result.length != 0) {
        		res.json({flag: false});
        	}
        	else{
        		dbCon.query('INSERT tbl_contacts SET ?', newContact, function(err,result) {
		            if (err) {
		                throw err;
		            }
		            res.json({flag: true});
		        });
        	}
        })
    //     dbCon.end();
    // });
});

router.post('/updateContact', parser, function (req, res) {
	var contInfo = req.body;
    var namel = contInfo.name;
    var categoryl = contInfo.category;
    var locationl = contInfo.location;
    var contactl = contInfo.contact_info;
    var emaill = contInfo.email;
    var weburll = contInfo.website_url;
    // dbCon.connect(function (err) {
    //     if (err) {
    //         throw err;
    //     }

	dbCon.query('SELECT * FROM tbl_contacts WHERE name=?', [namel], function(err, result) {
		if(err) {
			throw err;
		}
		dbCon.query('UPDATE tbl_contacts SET category=?, location=?, contact_info=?, email=?, website_url=? WHERE name=?', [categoryl, locationl, contactl, emaill, weburll, namel], function(err,result) {
	        if (err) {
	            throw err;
	        }
	        res.json({flag: true});
	    });
	})

      //   dbCon.end();
      // });
});

router.post('/deleteContact', parser, function (req, res) {
	var contInfo = req.body;
	console.log(contInfo);
    var namel = contInfo.name;
    // dbCon.connect(function (err) {
    //     if (err) {
    //         throw err;
    //     }

        dbCon.query('DELETE FROM tbl_contacts WHERE name=?', [namel], function(err,result) {
            if (err) {
                throw err;
            }
            res.json({flag: true});
        });

      //   dbCon.end();
      // });
});

module.exports = router;