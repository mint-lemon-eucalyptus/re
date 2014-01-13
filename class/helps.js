var Helps = function (storage) {
    var helps = this;
    this.chapters = [];

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
            helps.chapters = rs;
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


    helps.getChapterByPos = function (pos) {
        return helps.chapters[pos];
    }
    helps.getChapterById = function (id) {
        for (var i = 0; i < this.chapters.length; ++i) {
            if (this.chapters[i].id === id) {
                return this.chapters[i];
            }
        }
        return null;
    }
    helps.getChapterAdmin = function (id) {
        return helps.chaptersAdmin[id];
    }

    helps.updateChapter = function (ch, callback) {
        if (ch.pos === '') {
            ch.pos = null;
        }

        storage.postgresQuery({
                name: 'update chapter (name content)',
                text: "update help_chapters set name=$2, content=$3, published=$4, pos=$5 where id=$1 returning *;",
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


    this.refresh = function () {
        this.reLoadChaptersForAdmin(function () {
            console.log('HELPS>>>', 'reLoadChaptersForAdmin ... done')
        })
        this.reLoadChaptersForUser(function () {
            console.log('HELPS>>>', 'reLoadChaptersForUser ... done')
        })
    }
    this.refresh();


    this.asSql = function () {
        var a = this.chaptersAdmin;
        var res = '';
        for (var i in a) {
            var text = "insert into help_chapters(id,name,author,content,pos,published) values(" + a[i].id + ',' + "'" + a[i].name + "'," + a[i].author + ",'" + a[i].content + "'," + a[i].pos + ',' + a[i].published + ');';
            res += text.replace(/\n/g, '').replace(/insert into/gi, '\ninsert into');
        }
        return res;
    }
    return this;
}


module.exports = Helps;