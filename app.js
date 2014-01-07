/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
//var pg = require('pg');
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var util = require('util');
var pg = require('pg');

var COOKIES_EXPIRE = 1000 * 60 * 60;

var LOCAL = true;
var DBNAME = 'testing';
var DBUSER = 'auth_user';
var DBPASS = '12';
var neo4j = require('neo4j-js');

function execQuery(query_, callback) {
    neo4j.connect('http://localhost:7474/db/data/', function (error, graph) {
        if (error) {
            callback({error: error, cause: 'Neo4j server is not started'}, null);

            return;
        }
        // do something with graph object
        graph.query(query_, function (err, results) {
            callback(null, results);
        });
    });


}
//
//process.env.HEROKU_POSTGRESQL_YELLOW_URL
// "postgres://evouvpryqzoccf:6Yne99-CjdKmPQoygYXqQavOFt@ec2-54-221-196-140.compute-1.amazonaws.com:5432/ddmrsd6pq9j7sa"
//'postgres://postgres:12@localhost:5432/testinghall'


function postgresQuery(q, callback) {
    pg.connect('postgres://' + DBUSER + ':' + DBPASS + '@localhost:5432/' + DBNAME, function (err, db, done) {
        if (err) {
            done();
            if (callback) {
                callback(err);
            }
            console.log('storage error');
            return;
        }
        db.query(
            q,
            function (err, rs) {
                done();
                if (rs) {
                    console.log(rs.rows)
                }
                if (callback) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, rs.rows);
                }
            }
        );
    });
}

var excercises = require('./excercises.js');
var config = require('./config.js');

var helps = require('./helps.js');

function prepareDataBase() {


    postgresQuery({
        name: 'register admin check',
        text: 'select * from users where role=$1;',
        values: ['admin']
    }, function (err, rs) {
        if (err) {
            console.log(new Date() + '\tdb error ' + err);
//            return;
        } else {
            console.log(rs)
            if (!rs[0]) {
                console.log(new Date() + '\tno admin found');
                postgresQuery({
                    name: 'register admin',
                    text: 'Insert INTO users(name, email, pass, confirm, role) values($1, $2, $3, $4, $5);',
                    values: ['qqq', 'qqq@qqq.ru', 'qqq', null, 'admin']
                }, function (err, res) {
                    if (err) {
                        console.log(new Date() + '\tregister error ' + err);
//            return;
                    } else {
                        console.log(new Date() + '\tregister success');
                    }
                });
            } else {
                console.log(new Date() + '\t admin found: ', rs[0]);
            }
        }
    });
}
prepareDataBase();


var app = express();
// all environments
//var MemoryStore = require('connect/middleware/session/memory');

app.set('port', process.env.PORT || 16097);
app.set('views', __dirname + '/views/jade');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser('1234567890QWERTY'));
app.use(express.cookieSession({
    secret: 'secret',
    cookie: {maxAge: COOKIES_EXPIRE}
}));
//app.use(express.session({ store: new MemoryStore({ reapInterval: 60000 * 10 }) }));
//app.use(express.methodOverride());

app.use(function (req, res, next) {
    res.locals.cookies = req.cookies;
    res.locals.session = req.session;
    next();
});
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(function (req, res, next) {
    res.status(404);
    // respond with html page


    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

/*app.get('/', function(req, res){
 req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;
 res.send('You have visited this page ' + req.session.visitCount + ' times');
 });
 */

app.locals.config = config;


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', function (req, res) {
    //   console.log(util.inspect(req))
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var n = req.cookies.n;  //username
    var role = req.cookies.role;
    console.log('role:  ', role)
    var bean = {role: role};
    if (!res.locals.session.auth || !l || !p || !n) {
        res.render('index');
    } else {
        postgresQuery(
            {
                name: 'login user',
                text: 'select id, name, role from users where email=$1 and pass=$2;',
                values: [l, p]
            },
            function (err, rs) {
                if (err || rs.length == 0) {
                    res.clearCookie('l');
                    res.clearCookie('i');
                    res.clearCookie('n');
                    res.clearCookie('p');
                    res.clearCookie('role');
                    res.render('index');
                }
                else {
                    res.locals.session.auth = true;
                    res.locals.cookies.l = l;
                    res.locals.cookies.p = p;
                    if (rs[0].role) {
                        res.locals.cookies.role = rs[0].role;
                    }
                    res.locals.cookies.n = rs[0].name;
                    res.locals.cookies.id = rs[0].id;
                    res.render('index', bean);
//            res.send(new Date()+'   '+util.inspect(res.locals.session));
//              res.send(res.locals.cookies);
                }
            }
        );
    }
});

function to404(req,res){
    res.redirect('404')
}
function to403(req,res){
    res.redirect('403')
}

app.get('/admin', function (req, res) {
    checkAdmin(req, res, function (bean) {
        console.log('checkAdmin:  ',true );
        res.render('admin');
    })
});

function checkAdmin(req, res, success) {
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var n = req.cookies.n;  //username
    var role = req.cookies.role;
    var bean = {role: role};

    postgresQuery(
        {
            name: 'check admin login',
            text: 'select id, name, role from users where email=$1 and pass=$2;',
            values: [l, p]
        },
        function (err, rs) {
            if (err || rs.length == 0) {
                res.clearCookie('l');
                res.clearCookie('i');
                res.clearCookie('n');
                res.clearCookie('p');
                res.clearCookie('role');
                res.render('index');
            }
            else {
                res.locals.session.auth = true;
                res.locals.cookies.l = l;
                res.locals.cookies.p = p;
//                console.log('checkAdmin:  ',rs[0] );
                res.locals.cookies.n = rs[0].name;
                res.locals.cookies.id = rs[0].id;
                if (rs[0].role=='admin') {
                    res.locals.cookies.role = rs[0].role;
                    success(bean);
                }else{
                    to403(req,res);
                }
            }
        });

}


app.get('/excercises', function (req, res) {
    res.render('excercises', {excercises: excercises});
});

app.get('/excercises/:id', function (req, res) {
    if (excercises[req.params.id]) {
        res.cookie('exNum', req.params.id, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
        res.render('excercise', {chapters: helps, excercise: excercises[req.params.id]});
    } else {
        res.render('excercises', {excercises: excercises});

    }
});


//login
app.post('/ex-check', function (req, res) {
    var query = req.body.query;
    console.log(query)
    execQuery(query, function (err, results) {
        if (err) {
            console.log(err, results)
            res.send(
                {
                    err: err
                });
        }
        else {
            res.send({results: results})
        }
    })
})
;


app.get('/help/:id', function (req, res) {
    res.render('help_chapter', {chapters: helps, active: req.params.id});
});
app.get('/help', function (req, res) {

    res.render('help_index', {helps: helps});

});


//login
app.get('/sign_in', function (req, res) {
    if (!res.locals.session.auth) {
        res.render('sign_in');
    }
    else {
        res.redirect('/');
    }
});

//register
app.get('/sign_up', function (req, res) {
    if (!res.locals.session.auth) {
        res.render('sign_up');
    }
    else {
        res.redirect('/');
    }
});

//register controller
app.post('/sign-up-controller', function (req, res) {
    var post = req.body;
    var bean = {};
    var md5 = crypto.createHash('md5').update(post.email + 'aaa' + post.pass).digest("hex");
    // res.send(md5);
    postgresQuery(
        {
            name: 'register user',
            text: 'Insert INTO users(name, email, pass, confirm, role) values($1, $2, $3, $4, $5);',
            values: [post.name, post.email, post.pass, md5, 'user']
        },
        function (err, rs) {
            if (err) {
                bean = {
                    reg_email: post.email,
                    reg_name: post.name,
                    reg_err: err
                };
                res.render('sign_up', bean);
                console.log(new Date() + '\tregister error');
                return;
            } else {
                res.locals.session.reg_email = post.email;
                res.locals.session.reg_name = post.name;

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: "ya.dim.tk@gmail.com", // sender address
                    to: post.email, // list of receivers
                    subject: "Регистрация на сайте pokrov-mead.tk", // Subject line
                    text: "Для подтверждения регистрации перейдите по ссылке: ", // plaintext body
                    html: "<b>Для подтверждения регистрации перейдите по </b><a href='localhost/register/" + md5 + "'>ссылке</a>" // html body
                }

                var smtpTransport = nodemailer.createTransport("SMTP", {
                    service: "Gmail",
                    auth: {
                        user: "superoot.protech@gmail.com",
                        pass: "hflbfnjh_nhfdjzlysq"
                    }
                });

                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log('SMTP>>:', error, '\n\t\t', post.to);
                    } else {
                        console.log("Message sent: " + response.message);
                    }
                    smtpTransport.close();
                });
                res.redirect('/');
            }
        }
    );
});

//login controller
app.post('/sign-in-controller', function (req, res) {
    var post = req.body;
    postgresQuery(
        {
            name: 'login user',
            text: 'select id, name, role from users where email=$1 and pass=$2 and confirm is null;',
            values: [post.email, post.pass]
        },
        function (err, rs) {
            if (err || rs.length == 0) {
                res.render('sign_in', {error: true});
                return;
            }
            //    console.log(rs)
            res.cookie('i', rs[0].id, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('l', post.email, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('p', post.pass, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('n', rs[0].name, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            console.log(rs[0].role)
            if (rs[0].role != null) {
                res.cookie('role', rs[0].role, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            }
            res.locals.session.auth = true;
//        res.send(rs);
            res.redirect('/');
        }
    );
});

app.get('/logout', function (req, res) {
    delete req.session;
    res.clearCookie('l');
    res.clearCookie('i');
    res.clearCookie('n');
    res.clearCookie('p');
    res.redirect('/');
});

app.get('/product/:id', function (req, res) {
    res.render('product', {
        cur: req.params.id
    });
});

app.get('/order/:id', function (req, res) {
    res.render('order', {
        cur: req.params.id
    });
});

app.get('/register/:key?', function (req, res) {
    var sublink = req.params.key;
    postgresQuery(
        {
            name: 'register user confirm',
            text: 'update users set confirm = null where confirm=$1 returning id, email, pass, name;',
            values: [sublink]
        },
        function (err, rs) {
            if (!err && rs.length === 1) {
                res.cookie('l', rs[0].email, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
                res.cookie('p', rs[0].pass, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
                res.cookie('n', rs[0].name, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
                res.locals.session.auth = true;
            }
            res.redirect('/');
        }
    );
});

app.get('/contact_us', function (req, res) {
    res.render('contact_us', obj);
});
app.get('/403', function (req, res) {
        res.render('403');
});

app.get('/db_name', db_name);
app.get('/db_view', db_view);
app.get('/env', function (req, res) {
    res.send(process.env)
});


/*
 function signIn(req, res) {
 res.send(res.session);

 res.render('sign_in');
 }
 app.post('/sign-in-controller', function (req, res) {
 var post = req.body;
 postgresQuery(
 {
 name: 'login user',
 text: 'select name from users where email=$1 and pass=$2;',
 values: [post.email, post.pass]
 },
 function (err, rs) {
 if (err || rs.length == 0) {
 res.render('sign_in', {error: true});
 return;
 }
 res.send(rs);
 res.cookie('l', post.email, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
 res.cookie('p', post.pass, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
 res.cookie('n', rs[0].name, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
 //        res.redirect('/');
 }
 );
 });


 */
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function db_name(req, res) {
    var t = '';
    postgresQuery(
        {
            text: 'select * from current_database();',
            name: 'database name',
            values: null
        },
        function (err, rs) {
            if (err) {
                res.send('db_name err: ' + util.inspect(err) + '\t' + process.env.HEROKU_POSTGRESQL_YELLOW_URL);
                return;
            }
            res.send('db_name: ' + util.inspect(rs));
        }
    );
}

function db_view(req, res) {
    var t = '';
    postgresQuery(
        {
            text: 'select * from users;',
            name: 'database name',
            values: null
        },
        function (err, rs) {
            if (err) {
                res.send('db_name err: ' + util.inspect(err) + '\t' + process.env.HEROKU_POSTGRESQL_YELLOW_URL);
                return;
            }
            res.send('db_name: ' + util.inspect(rs));
        }
    );
}
