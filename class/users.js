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

                                if (rs[0].role === 'admin' && rs[0].pass === p && rs[0].email === l) {
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

    users.getChapter = function (id, done) {
        if (!users.chapters[id]) {
            storage.postgresQuery({
                name: 'get chapter by id',
                text: 'select * from help_chapters where id=$1;',
                values: [id]
            }, function (err, rs) {
                if (err) {
                    done(err);
                    return;
                }
                users.chapters[id] = rs[0];
                done(null, rs[0]);
            })
        }
    }

    users.updateChapter = function (ch, callback) {
        storage.postgresQuery({
                name: 'update chapter (name content)',
                text: 'update help_chapters set name=$2, content=$3 where id=$1 returning name, content;',
                values: [ch.id, ch.name, ch.content]
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    users.chapters[ch.id].name = res[0].name;
                    users.chapters[ch.id].content = res[0].content;
                    callback(null, res[0]);
                }
            })
    }

    users.createChapter = function (ch, callback) {
        storage.postgresQuery({
                name: 'insert chapter (name content)',
                text: 'insert into help_chapters (name,author,content) values($1,$2,$3) returning *;',
                values: [ch.name, ch.author, ch.content]
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    users.chapters[res[0].id] = res[0];
                    console.log(res);
                    callback(null, res[0]);
                }
            })
    }

    users.createRazdel = function (ch, callback) {
        storage.postgresQuery({
                name: 'insert razdel (pos, name)',
                text: 'insert into help_razd (name,pos) values($1,$2) returning *;',
                values: [ch.name, ch.pos]
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    users.razdels[res[0].pos] = res[0];
                    console.log(res);
                    callback(null, res[0]);
                }
            })
    }

    users.updateRazdel = function (ch, callback) {
        storage.postgresQuery({
                name: 'update razdel (pos, name)',
                text: 'update help_razd set name=$1, pos=$2,chapters=$3 returning *;',
                values: [ch.name, ch.pos, ch.chapters]
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    users.razdels[res[0].pos] = res[0];
                    console.log(res);
                    callback(null, res[0]);
                }
            })
    }

    users.getRazdels = function (callback) {
        storage.postgresQuery({
                name: 'get all razdel',
                text: 'select * from help_razd;',
                values: []
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    for (var i = 0; i < res.length; ++i) {
                        users.razdels[res[i].pos] = res[i];
                    }
                    console.log(res);
                    callback(null, res);
                }
            })
    }

    return this;
}


module.exports = Helps;