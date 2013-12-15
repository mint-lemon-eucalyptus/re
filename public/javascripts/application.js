
var mvc=new MVC();
$("document").ready(function () {

    /*Start: Prevent the default white background on blur of top navigation */
    $(".dropdown-menu li a").mousedown(function () {
        var dropdown = $(this).parents('.dropdown');
        var link = dropdown.children(':first-child');
        link.css('background-color', "#2E3436");
        link.css('color', 'white');
    });
    /*End: Prevent the default white background on blur of top navigation */
  /*  $('#index').hide();
    $('#index').show();
    var frames = $('#frames>div');
    var pageHeader = $('.page-header');
    var headerTabs=$('header li>a');
    console.log(frames.eq(1));

      //  * список элементов перехода между окнами

    var jumpsMatrix=[
        {elem:headerTabs.eq(0),frame:frames.eq(1)}
//        {elem:}
    ];
mvc.init({
    frames:frames,
    header:pageHeader,
    startFrame:0,
    jumps:jumpsMatrix
});
*/
});
