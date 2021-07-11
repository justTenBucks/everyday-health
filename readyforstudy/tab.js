
for (let i = 0; i < 3; i++) {
    $(".tab-button").eq(i).click(function(){
        $(".tab-button").removeClass('active');
        $(".tab-content").removeClass('show');
        $(".tab-button").eq(i).addClass('active');
        $(".tab-content").eq(i).addClass('show');
})}
