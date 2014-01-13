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

var NodeCache = require("node-cache");

var MyPG = require('./class/postgres.js');
var Helps = require('./class/helps.js');
var Users = require('./class/users.js');


var DBNAME = 'testing';
var DBUSER = 'auth_user';
var DBPASS = '12';


var COOKIES_EXPIRE_SECS = 10060 * 60;
var COOKIES_EXPIRE = COOKIES_EXPIRE_SECS * 1000;

var mypg = new MyPG('localhost', DBNAME, DBUSER, DBPASS);
var helps = new Helps(mypg);
var users = new Users(mypg, NodeCache, {COOKIE_EXPIRE_TIME: COOKIES_EXPIRE});

users.get(23, function (user) {
    console.log(user)
})


//return;
mypg.prepareDataBase();
setTimeout(function(){
    helps.asSql(function(){
        return;

    });

},2000)



/*
 helps.updateRazdel({name:'sdasd',pos:1,chapters:'[11,15,13,16]'},function(err,rs){
 console.log(rs)
 })
 */


var LOCAL = true;
var neo4j = require('neo4j-js');

function execCypherQuery(query_, callback) {
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
                    console.log('postgresql: ', q.name, rs.rows)
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
//            console.log(rs)
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
                console.log(new Date() + '\t admin found: ', rs[0].email, rs[0].pass);
            }
        }
    });
}

prepareDataBase();

var usersCache = new NodeCache();

function loadChapterHierarchy(clbck) {
    getChapterFullInfo(function (carr) {
        clbck(carr);
    })
}

var hierarchy = [];
function reloadContent() {
    loadChapterHierarchy(function (res) {
        hierarchy = res;
        hierarchy.forEach(function (e) {
            loadChapterContent({id: e.id}, function (r) {
                console.log(r);
                e.content = r.content;
            })
        })
    });
}
//reloadContent();
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
app.use(express.cookieParser('124567890QWERTY'));
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


function getChapterFullInfo(callback) {
    postgresQuery({
            name: 'get user by id',
            text: 'select h.id,h.name as name, h.dtcreated, h.pos, h.indent, u.email as author, u.id as uid from help_chapters h join users u on h.author=u.id order by h.pos;',
            values: []
        },
        function (err, res) {
            if (err) {
                console.log(err);
                callback([]);
            }
            else {
                callback(res);
            }
        })
}

function getChapters(callback) {
    postgresQuery({
            name: 'get chapters info',
            text: 'select id,name,pos,author,dtcreated from help_chapters order by pos;',
            values: []
        },
        function (err, res) {
            if (err) {
                console.log(err);
                callback([]);
            }
            else {
                callback(res);
            }
        })
}

function loadChapterContent(json, callback) {
    postgresQuery({
            name: 'get chapters content',
            text: 'select content from help_chapters where id=$1;',
            values: [json.id]
        },
        function (err, res) {
            if (err) {
                console.log(err);
                callback([]);
            }
            else {
                callback(res[0]);
            }
        })
}

function updateChapter(ch, callback) {
    postgresQuery({
            name: 'update chapter (name content)',
            text: 'update help_chapters set name=$2, content=$3 where id=$1;',
            values: [ch.id, ch.name, ch.content]
        },
        function (err, res) {
            if (err) {
                console.log(err);
                callback([]);
            }
            else {
                reloadContent();
                callback(res[0]);
            }
        })
}


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

function clearAllCookies(res) {
    res.clearCookie('l');
    res.clearCookie('i');
    res.clearCookie('n');
    res.clearCookie('p');
    res.clearCookie('role');
    delete res.locals.session.auth;
}

app.get('/', function (req, res) {
    //   console.log(util.inspect(req))
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var n = req.cookies.n;  //username
    var id = req.cookies.i;  //user id
    var role = req.cookies.role;
    console.log('role:  ', role, id)
    if (!res.locals.session.userid) {
        res.render('index');
        return;
    }
    if (!l || !p || !n) {
        users.get(res.locals.session.userid, function (user) {
            res.cookie('i', user.id, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('l', user.email, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('p', user.pass, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('n', user.name, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.render('index');
        })
    } else {
        authByEmailPass(l, p, function (user) {
            if (user) {
                res.locals.session.userid = user.id;
                res.locals.session.role = user.role;
                res.locals.session.username = user.name;

                res.locals.user = user;
                res.render('index');
            } else {
                clearAllCookies(res);
                res.render('index');
            }
        })
    }
});

//stats
app.get('/help', function (req, res) {
    var userid = req.session.userid;
    helps.getRazdels(function (err, rs) {
//    console.log('help_index2',rs)

        res.render('help_index', {razd: rs, chapters: helps.getChaptersForUser()})
    });
});
app.get('/help/:id', function (req, res) {
    var chapter = helps.getChapter(req.params.id);
        if (chapter) {
            res.render('help_chapter', {chapters: helps.getChaptersForUser(), active: req.params.id, next: helps.getNextId(req.params.id), pre: helps.generatePre(req.params.id)})
        } else {
            res.redirect('403');
        }
});


//callback is function(user) user=obj or null
function authByEmailPass(login, pass, callback) {
    if (!login || !pass) {
        callback(null);
        return;
    }
    usersCache.get(login, function (err, user) {
        if (!user[login]) {
            //user is not in the usersCache
            //attempt to find user in db and put to usersCache
            postgresQuery(
                {
                    name: 'login user',
                    text: 'select * from auth_user($1,$2);',
                    values: [login, pass]
                },
                function (err, rs) {
                    if (err || rs.length == 0) {
                        //wrong cookies
                        callback(null);
                    }
                    else {
                        //good cookies - put user to usersCache
                        usersCache.set(rs[0].email, rs[0], COOKIES_EXPIRE_SECS, function (err) {
                            if (err) {
                                console.log('cache error:', err);
                            }
                            //and callback true
                            callback(rs[0]);
                        })
                    }
                }
            );
        }
        else {
            console.log('auth from cache:', user[login].email);
            callback(user[login])
        }
    })
}

function auth(req, callback) {
    authByEmailPass(req.cookies.l, req.cookies.p, callback)
}

function to403(req, res) {
    res.redirect('403')
}


app.get('/admin', function (req, res) {
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var userid = req.session.userid;
    if (userid) {
        users.admin(userid, l, p, function (user) {
            if (user && user.pass == p && user.email == l) {
                res.render('admin', {path: 'admin'});
            } else {
                clearAllCookies(res)
                res.redirect('403');
            }
        })
    } else {
        res.redirect('403');
    }
});

app.get('/admin/help-editor', function (req, res) {
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var userid = req.session.userid;
    if (userid) {
        users.admin(userid, l, p, function (user) {
            if (user && user.pass == p && user.email == l) {
                res.render('help-editor', {});
            } else {
                clearAllCookies(res)
                res.redirect('403');
            }
        })
    } else {
        res.redirect('403');
    }
});

app.post('/admin/chapters', function (req, res) {
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var json = req.body;
    var userid = req.session.userid;
    if (userid) {
        users.admin(userid, l, p, function (user) {
            if (user) {
                json.author = user.id;
                switch (json.cmd) {
                    case 'get':
                    {
                        res.send(helps.getChaptersForAdmin());
                        return;
                    }
                    case 'content':
                    {
                        res.send(helps.getChapterAdmin(json.id));
                        return;
                    }
                    case 'add':
                    {
                        helps.createChapter(json, function (chaptersArr) {
                            res.send(chaptersArr);
                        });
                        return;
                    }
                    case 'edit':
                    {
                        helps.updateChapter(json, function (chapter) {
                            res.send(chapter);
                        });
                        return;
                    }
                }
            } else {
                clearAllCookies(res)
                res.redirect('403');
            }
        })
    } else {
        res.redirect('403');
    }
});

//login
app.post('/user', function (req, res) {
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var json = req.body;
    var userid = req.session.userid;
    if (userid) {
        users.admin(userid, l, p, function (user) {
            if (user && user.role == 'admin' && user.pass == p && user.email == l) {
                json.author = user.id;
                switch (json.cmd) {
                    case 'get':
                    {
                        users.get(json.id, function (usr) {
                            res.send(usr);
                        });
                        return;
                    }
                    case 'content':
                    {
                        helps.getChapter(json.id, function (err, chaptersArr) {
                            console.log(chaptersArr)
                            res.send(chaptersArr);
                        });
                        return;
                    }
                    case 'add':
                    {
                        helps.createChapter(json, function (chaptersArr) {
                            res.send(chaptersArr);
                        });
                        return;
                    }
                    case 'edit':
                    {
                        helps.updateChapter(json, function (chapter) {
                            res.send(chapter);
                        });
                        return;
                    }
                }
            } else {
                clearAllCookies(res)
                res.redirect('403');
            }
        })
    } else {
        res.redirect('403');
    }
});


app.post('/admin/index', function (req, res) {
    var l = req.cookies.l;  //email
    var p = req.cookies.p;  //pass
    var json = req.body;
    console.log('req.body', json);
    authByEmailPass(l, p, function (user) {
        if (user && user.role == 'admin') {
            json.author = user.id;
            switch (json.cmd) {
                case 'get':
                {
                    getChapters(function (chaptersArr) {
                        res.send(chaptersArr);
                    });
                    return;
                }
                case 'content':
                {
                    loadChapterContent(json, function (chaptersArr) {
                        res.send(chaptersArr);
                    });
                    return;
                }
                case 'bind':
                {
                    if (!json.chapter) {
                        res.send([]);
                        return;
                    }
                    if (json.parent === 'null') {
                        json.parent = null;
                    }
                    addIndex(json, function (chaptersArr) {
                        res.send(chaptersArr);
                    });
                    return;
                }
                case 'remove':
                {
                    removeIndex(json, function (chapter) {
                        res.send(chapter);
                    });
                    return;
                }
            }
        } else {
            clearAllCookies(res)
            res.render('403');
        }
    })
});


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
    execCypherQuery(query, function (err, results) {
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

//login
app.get('/sign_in', function (req, res) {
    if (!res.locals.session.userid) {
        res.render('sign_in');
    }
    else {
        res.redirect('/');
    }
});

//register
app.get('/sign_up', function (req, res) {
    if (!res.locals.session.userid) {
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
            text: 'select * from reg_user($1, $2, $3, $4, $5);',
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
                    from: "mint.lemon.eucalyptys@gmail.com", // sender address
                    to: post.email, // list of receivers
                    subject: "Регистрация для neo4j-ex", // Subject line
                    text: "подтверждение регистрации: ", // plaintext body
                    html: "<b>Для подтверждения регистрации " +
                        'вставьте в адресую строку:   ' + (req.protocol + "://" + req.get('host') + '/register/') + md5
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
    console.log(post)
    authByEmailPass(post.email, post.pass, function (user) {
        if (user == null) {
            res.render('sign_in', {error: true});
        } else {
            res.cookie('i', user.id, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('l', user.email, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('p', user.pass, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            res.cookie('n', user.name, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            console.log(user.role)
            if (user.role != null) {
                res.cookie('role', user.role, { expires: new Date(Date.now() + COOKIES_EXPIRE), path: '/' });
            }
            res.locals.session.userid = user.id;
//        res.send(rs);
            res.redirect('/');

        }
    });
});

app.get('/logout', function (req, res) {
    delete req.session;
    clearAllCookies(res);
    res.redirect('/');
});

app.get('/product/:id', function (req, res) {
    res.render('product', {
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
                res.locals.session.userid = rs[0].id;
                res.locals.session.username = rs[0].name;
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


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


//stats
app.get('/cache-stats', function (req, res) {
    res.send(usersCache.getStats());
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
