var Parser = function () {


    var parser = this;
    var container = null, lang = null;
    this.init = function (arg) {
        container = arg.container;
        lang = arg.lang;
    }

    this.fromJson = function (json) {
        if (json.results) {
            parseResults(json.results);
        } else {
            if (json.err) {
                parseError(json.err);
            }
        }
    }

    function translate(str) {
        var res = str.replace(/.+\)/, '').replace(/\n/g,'<br>').replace(/"/g,'');
        return 'У вас ошибка в запросе'+res;
    }

    function parseError(err) {
        var res = translate(err.innerError.message);
        container.html(JSON.stringify(res));
    }

    function parseResults(res) {
        container.val(JSON.stringify(res,null,4));
    }
};

Parser.Utils = Parser.Utils || {};

