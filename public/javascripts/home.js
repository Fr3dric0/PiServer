
var categoryList = $('.category-list-li');

// Iterate over each category list element
categoryList.each(function(idx){
    var li = $('.category-list-li:eq('+idx+')');
    var prevImg = li.find('.preview-img'); // The element which should be deblurred
    var deblur = 'deblur'; // Name of the CSS-class

    li.hover(
    // Mouse in
    function(){
        prevImg.addClass(deblur)
    },
    //Mouse out
    function(){
        prevImg.removeClass(deblur);
    });
});
