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

    return this;
}


module.exports=Postgres;