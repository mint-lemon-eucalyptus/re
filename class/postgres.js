var util = require('util');
var PG = require('pg');

var DBNAME = 'testing';
var DBUSER = 'auth_user';
var DBPASS = '12';

var Postgres = function(host,dbname,user,pass){
 var pg=this;
    this.postgresQuery=function(q, callback) {
        PG.connect('postgres://' + user + ':' + pass + '@'+host+':5432/' + dbname, function (err, db, done) {
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

    this.prepareDataBase=function() {
        pg.postgresQuery({
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
                    pg.postgresQuery({
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
    return this;
}


module.exports=Postgres;