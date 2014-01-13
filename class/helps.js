var Helps = function (storage) {
    var helps = this;
    this.chapters = null;

    this.chapters_loaded = false;

    this.chapters_idxs = [];

    this.chaptersAdmin = null;

    this.reLoadChaptersForUser = function (done) {
        storage.postgresQuery({
            name: 'get chapters all',
            text: 'select * from help_chapters where published=true order by pos;',
            values: []
        }, function (err, rs) {
            if (err) {
                done(err);
                return;
            }
            delete helps.chapters;
            helps.chapters = {};
            for (var i = 0; i < rs.length; ++i) {
                helps.chapters[rs[i].id] = rs[i];
                helps.chapters_idxs.push(rs[i].id);
                helps.chapters[rs[i].id].pre = i + 1;
            }
            var cc = 1;
            for (var i in helps.chapters) {
                helps.chapters[i].pre = cc++;
                helps.chapters_idxs.push(i);
            }
            helps.chapters_idxs.sort();
            helps.chapters_loaded = true;
            done(null, helps.chapters);
        })
    }
    this.reLoadChaptersForAdmin = function (done) {
        storage.postgresQuery({
            name: 'get chapters all',
            text: 'select * from help_chapters;',
            values: []
        }, function (err, rs) {
            if (err) {
                done(err);
                return;
            }
            delete helps.chaptersAdmin;
            helps.chaptersAdmin = {};
            for (var i = 0; i < rs.length; ++i) {
                helps.chaptersAdmin[rs[i].id] = rs[i];
                helps.chaptersAdmin[rs[i].id].pre = i + 1;
            }
            done(null, helps.chaptersAdmin);
        })
    }

    helps.getChaptersForUser = function () {
        return helps.chapters;
    }

    helps.getChaptersForAdmin = function () {
        return helps.chaptersAdmin;
    }


    helps.getChapter = function (id) {
        return helps.chapters[id];
    }
    helps.getChapterAdmin = function (id) {
        return helps.chaptersAdmin[id];
    }

    helps.updateChapter = function (ch, callback) {
        console.log(ch)
        if(ch.pos===''){
            ch.pos=null;
        }
        storage.postgresQuery({
                name: 'update chapter (name content)',
                text: 'update help_chapters set name=$2, content=$3, published=$4, pos=$5 where id=$1 returning *;',
                values: [ch.id, ch.name, ch.content, ch.published, ch.pos]
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    helps.refresh()
                    callback(null, res[0]);
                }
            })
    }

    helps.createChapter = function (ch, callback) {
        storage.postgresQuery({
                name: 'insert chapter (name content)',
                text: 'insert into help_chapters (name,author,content,pos,published) values($1,$2,$3,(select coalesce(max(pos),0)+1 from help_chapters),$4) returning *;',
                values: [ch.name, ch.author, ch.content, ch.published]
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                    callback([]);
                }
                else {
                    helps.refresh()
                    callback(null, res[0]);
                }
            })
    }

    helps.getNextId = function (id) {
        var c = helps.chapters_idxs[helps.chapters_idxs.indexOf(parseInt(id) + 1)];
        console.log(c)
        return (!c) ? null : c;
    }
    helps.generatePre = function (id) {
        return helps.chapters[id].pre + '.';
    }
    helps.createRazdel = function (ch, callback) {
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
                    helps.razdels[res[0].pos] = res[0];
                    console.log(res);
                    callback(null, res[0]);
                }
            })
    }

    helps.updateRazdel = function (ch, callback) {
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
                    helps.razdels[res[0].pos] = res[0];
                    console.log(res);
                    callback(null, res[0]);
                }
            })
    }

    helps.getRazdels = function (callback) {
        if (!helps.razdels_loaded) {
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
                        helps.razdels_loaded = true;
                        helps.razdels = res;
                        callback(null, helps.razdels);
                    }
                })
        } else {
            callback(null, helps.razdels)
        }

    }
    this.canShowChapter = function (id) {
        for (var i = 0; i < this.razdels.length; ++i) {
            console.log(id, this.razdels[i].chapters, this.razdels[i].chapters.indexOf(id))
            if (this.razdels[i].chapters.indexOf(parseInt(id)) >= 0) {
                return true;
            }
        }
        return false;
    }


    this.refresh = function () {
        this.reLoadChaptersForAdmin(function () {
            console.log('HELPS>>>', 'reLoadChaptersForAdmin ... done')
        })
        this.reLoadChaptersForUser(function () {
            console.log('HELPS>>>', 'reLoadChaptersForUser ... done')
        })
    }
    this.refresh();


    this.asSql = function (done) {
        var a = this.chaptersAdmin;
        for (var i in a) {
            console.log('info:  writing', i)
        }

        var fs = require('fs');
        var writer = fs.createWriteStream('./sql/helps.sql', {encoding: 'utf-8', flags: 'w'});
        writer.on('finish', function () {
            console.error('Запись выполнена успешно.');
        });

        function write() {

            var res = '';

            for (var i in a) {
                console.log('writing', i)
                var text = "insert into help_chapters(id,name,author,content,pos,published) values(" + a[i].id + ',' + "'" + a[i].name + "'," + a[i].author + ",'" + a[i].content + "'," + a[i].pos + ',' + a[i].published + ');';

                res += text;
            }

            console.log(res.substr(62,70))
            var ok = writer.write(res);


            if (!ok) {
                console.log('not ok', i)

                return;
            }
            writer.on('close', function () {
                console.log('All done!');
            });

            writer.end('---==== Конец =====\n');

        }

       // writer.once('drain', write);
        writer.write('\n');
       write();


        done();

    }
    return this;
}


module.exports = Helps;