var chapters = [];
var chapters_table = $('#chapters_table');
var chapters = [];

function loadUser(id, callback) {
    $.post("../user", {id: id, cmd: 'get'}, function (data) {
        callback(data);
    });
}

function reLoadChapters(callback) {
    $.post("../admin/chapters", {cmd: 'get'}, function (data) {
        console.log(data)
        chapters_table.empty();
        for (var i in data) {
            addChapterToTable(data[i]);
        }
        if (typeof callback == 'function') {
            callback(data);
        }
        ;
    });
}
function addChapterToTable(data) {
    function row(dt, user) {
        var oper = $('<p>asda</p>');
        var r = $('<tr>').attr('id', data.id)
            .append($('<td>' + dt.id + '</td>'))
            .append($('<td>' + dt.pos + '</td>'))
            .append($('<td>' + dt.name + '</td>'))
            .append($('<td>' + user.email + '</td>'))
            .append($('<td>' + dt.dtcreated + '</td>'))
            .append($('<td>' + dt.published + '</td>'))
        return r;
    }

    loadUser(data.author, function (user) {
        chapters_table.append(row(data, user));
    });
}
function Editor(selector) {
    tinymce.init({
        mode: "specific_textareas",
        selector: selector,
        plugins: [
            "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
            "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
            "table contextmenu directionality emoticons template textcolor paste textcolor"
        ],
        toolbar1: "newdocument | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
        toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | inserttime preview | forecolor backcolor",
        toolbar3: "table | hr reeditformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft",
        menubar: false,
        toolbar_items_size: 'small',
        style_formats: [
            {title: 'Bold text', inline: 'b'},
            {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
            {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
            {title: 'Example 1', inline: 'span', classes: 'example1'},
            {title: 'Example 2', inline: 'span', classes: 'example2'},
            {title: 'Table styles'},
            {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
        ],
        templates: [
            {title: 'Test template 1', content: 'Test 1'},
            {title: 'Test template 2', content: 'Test 2'}
        ]
    });
}
function fillCombo(data, combo) {
    combo.empty();
    for (var i in data) {
        if (data[i].id !== 1) {
            combo.append('<option' + ' id="' + data[i].id + '"' + '>' + data[i].name + '</option>');
        }
    }
}

$(document).ready(function () {
    reLoadChapters();

    $('#add_chapter_btn_load').click(function () {
        Editor("textarea#add_chapter_content");
        $('#add_chapter_modal').modal();
    });
    $('#add_chapter_btn_save').click(function () {
        var chapter_json = {};
        chapter_json.name = $('#add_chapter_name').val().trim();
        chapter_json.published = $('#add_pub').prop('checked');
        chapter_json.cmd = 'add';
        chapter_json.content = tinyMCE.get('add_chapter_content').getContent();
        if (chapter_json.name.length == 0) {
            alert('name must be NOT empty');
            return;
        }
        $.post("../admin/chapters", chapter_json, function (data) {
            tinyMCE.get('add_chapter_content').setContent('');
            $('#add_chapter_name').val('');
            reLoadChapters();

            $('#add_chapter_modal').modal('hide');
        });
    });

    $('#edit_chapter_btn_load').click(function () {
        Editor("textarea#edit_chapter_content");
        reLoadChapters(function (data) {
            fillCombo(data, $('#edit_what_list'));
        });
        $('#edit_chapter_modal').modal();
    });

    $('#edit_chapter_btn_save').click(function () {
        var jj = {
            id: $('#edit_what_list option:selected').attr('id'),
            name: $('#edit_what_name').val(),
            pos: $('#edit_what_pos').val(),
            published: $('#edit_pub').prop('checked'),
            content: tinyMCE.get('edit_chapter_content').getContent(),
            cmd: 'edit'
        };
        console.log(JSON.stringify(jj));
        if (!jj.name.length && !jj.content.length) {
            alert('надо что-то изменить');
            return;
        }
        if (!jj.name.length) {
            jj.name = $('#edit_what_list option:selected').text();
        }

        $.post("../admin/chapters", jj, function (data) {
            $('#edit_what_name').val('');
            $('#edit_what_pos').val('');
            reLoadChapters();

            $('#edit_chapter_modal').modal('hide');
        });

    });


});


    $(document).ready(function () {
        $('#edit_what_list').change(function (e) {
            var itemId = $('#edit_what_list option:selected').attr('id');
            var json = {
                id: $('#edit_what_list option:selected').attr('id'),
                cmd: 'content'
            };

            $.post("../admin/chapters", json, function (data) {
                $('#edit_what_pos').val(data.pos);
                $('#edit_pub').prop('checked', data.published);
                console.log(JSON.stringify(data));
                tinyMCE.get('edit_chapter_content').setContent(data.content);
            });
        });
    });


function refresh() {
    reLoadChapters();
}
function addChapterToTree(data) {
}


$(document).ready(function () {
    refresh();
    $('#show_index_modal').click(function () {
        refresh();
        $('#edit_index_modal').modal();
    });

    $('#reload_hierarchy').click(function (e) {
        refresh();
    })
});


