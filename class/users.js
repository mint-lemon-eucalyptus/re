var crypto = require('crypto');

var Helps = function (storage, Cacher, conf) {
    var users = this;
    var usersCache = new Cacher();

    this.get = function (id, done) {
        usersCache.get(id, function (err, user) {
            if (!user[id]) {
                //user is not in the usersCache
                //attempt to find user in db and put to usersCache
                storage.postgresQuery(
                    {
                        name: 'login user',
                        text: 'select * from users where id=$1;',
                        values: [id]
                    },
                    function (err, rs) {
                        if (err || rs.length == 0) {
                            //wrong cookies
                            done(null);
                        }
                        else {
                            //good cookies - put user to usersCache
                            usersCache.set(rs[0].id, rs[0], 30, function (err) {
                                if (err) {
                                    console.log('cache error:', err);
                                }
                                //and callback true
                                done(rs[0]);
                            })
                        }
                    }
                );
            }
            else {
                console.log('auth from cache:', user[id].email);
                done(user[id])
            }
        })

    }
    this.admin = function (id, l, p, done) {
        usersCache.get(id, function (err, user) {
            console.log(user)
            if (!user[id]) {
                //user is not in the usersCache
                //attempt to find user in db and put to usersCache
                storage.postgresQuery(
                    {
                        name: 'login user',
                        text: 'select * from users where id=$1;',
                        values: [id]
                    },
                    function (err, rs) {
                        if (err || rs.length == 0) {
                            //wrong cookies
                            done(null);
                        }
                        else {
                            //good cookies - put user to usersCache
                            usersCache.set(rs[0].id, rs[0], 30, function (err) {
                                if (err) {
                                    console.log('cache error:', err);
                                }
                                //and callback true

                                if (rs[0].role === 'admin') {
                                    done(rs[0]);
                                } else {
                                    done(null);
                                }
                            })
                        }
                    }
                );
            }
            else {
                console.log('auth from cache:', user[id].email);
                done(user[id])
            }
        })

    }

    //callback is function(user) user=obj or null
    this.authByEmailPass = function (login, pass, callback) {
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
                            usersCache.set(rs[0].email, rs[0], conf.COOKIE_EXPIRE_TIME, function (err) {
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


    users.getChapters = function (done) {
        if (!users.chapters_loaded) {
            storage.postgresQuery({
                name: 'get chapters all',
                text: 'select * from help_chapters;',
                values: []
            }, function (err, rs) {
                if (err) {
                    done(err);
                    return;
                }
                for (var i = 0; i < rs.length; ++i) {
                    users.chapters[rs[i].id] = rs[i];
                }
                console.log(rs);
                users.chapters_loaded = true;
                done(null, users.chapters);
            })
        } else {
            done(null, users.chapters)
        }
    }

    this.prepareAdmin=function() {
        storage.postgresQuery({
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
                    storage.postgresQuery({
                        name: 'register admin',
                        text: 'Insert INTO users(id,name, email, pass, confirm, role) values($1, $2, $3, $4, $5,$6);',
                        values: [1,'smois', 'smois77@gmail.com', 'smois', null, 'admin']
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

    function randString(){
        return Math.random().toString().substring(2,20);
    }
this.registerNewUser=function(post,done){
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
                    from: "mint.lemon.eucalyptus@gmail.com", // sender address
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

}
    return this;
}


module.exports = Helps;