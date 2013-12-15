function MVC() {
    var self = this;
    function out(a){
        console.log('MVC Logging:',arguments)
    }
    this.init = function (arg) {
        self.frames = arg.frames;
        self.header = arg.header;
        for (var i = 0; i < self.frames.length; ++i) {
            if (i !== arg.startFrame) {
                self.frames.eq(i).hide();
            }
        }
        out(arg.jumps)
        for (var i = 0; i < arg.jumps.length; ++i) {
            arg.jumps[i].elem.click(function(){hideAllExcept(arg.jumps[i].frame);})
        }

    };
    function hideAllExcept(jQElem) {
        self.frames.hide();
        jQElem.show();
    }

    return this;
};

