$(window).scroll(function(){if($(this).scrollTop()>100){$(".navbar").addClass("fixed-me");}else{$(".navbar").removeClass("fixed-me");}});$(document).ready(function(){$('a[href^="#"].scroll-button').click(function(){var target=$(this.hash);if(target.length==0)target=$('a[name="'+this.hash.substr(1)+'"]');if(target.length==0)target=$('html');$('html, body').animate({scrollTop:target.offset().top-100},1000);return false;});});$(document).ready(function(){$(".CsAccordion .card-header a").click(function(event){$(".CsAccordion .card.gradient-accordian").removeClass("gradient-accordian");$(event.target).closest(".CsAccordion .card").addClass("gradient-accordian");});});$('.dropdown').on('show.bs.dropdown',function(){$(this).find('.dropdown-menu').first().stop(true,true).slideDown();});$('.dropdown').on('hide.bs.dropdown',function(){$(this).find('.dropdown-menu').first().stop(true,true).slideUp();});$(window).scroll(function(){var scroll=$(window).scrollTop();if(scroll>=50){$(".filterFixed").addClass("NoPad");}else{$(".filterFixed").removeClass("NoPad");}});$(document).ready(function(){$('.filtericon input[type="radio"]').click(function(){var inputValue=$(this).attr("value");var targetBox=$("."+inputValue);$(".bx").not(targetBox).hide();$(targetBox).show();});});popup={init:function(){$('figure').click(function(){popup.open($(this));});$(document).on('click','.popup img',function(){return false;}).on('click','.popup',function(){popup.close();})},open:function($figure){$('.gallery').addClass('pop');$popup=$('<div class="popup" />').appendTo($('body'));$fig=$figure.clone().appendTo($('.popup'));$bg=$('<div class="bg" />').appendTo($('.popup'));$close=$('<div class="close"><i class="fa fa-close"></i></div>').appendTo($fig);$shadow=$('<div class="shadow" />').appendTo($fig);src=$('img',$fig).attr('src');$shadow.css({backgroundImage:'url('+src+')'});$bg.css({backgroundImage:'url('+src+')'});setTimeout(function(){$('.popup').addClass('pop');},10);$('body').addClass('popopen');},close:function(){$('.gallery, .popup').removeClass('pop');setTimeout(function(){$('.popup').remove()},100);$('body').removeClass('popopen');}}
popup.init()
$(document).ready(function(){$(".fancybox").fancybox({openEffect:"none",closeEffect:"none"});});$("#chat").click(function(){openClose();});$(".backIc").click(function(){openClose();});function openClose(){$("#chat").toggleClass("active");$("#ChatBox").toggleClass("sidebar-open");$(".backIc").toggleClass("sidebar-open");$("body").toggleClass("hide_overflow");}
$(document).ready(function(){$("#DivClick").click(function(){$("#DivClick").toggleClass("active");$("#topUsers").toggle('slide',{direction:'left'},500);$("#storyData").toggle('slide',{direction:'left'},500);})});var offset=500;var duration=300;$(window).scroll(function(){if($(this).scrollTop()>offset){$('.back-to-top').fadeIn(200);}else{$('.back-to-top').fadeOut(200);}});$('.back-to-top').on("click",function(event){event.preventDefault();$('html, body').animate({scrollTop:0},500);return false;});$("#otpCntinue").click(function(){$("#RegcntTwo, #RegisTwo").show();$("#RegcntOne, #RegisOne").hide();});$('.sel').each(function(){$(this).children('select').css('display','none');var $current=$(this);$(this).find('option').each(function(i){if(i==0){$current.prepend($('<div>',{class:$current.attr('class').replace(/sel/g,'sel__box')}));var placeholder=$(this).text();$current.prepend($('<span>',{class:$current.attr('class').replace(/sel/g,'sel__placeholder'),text:placeholder,'data-placeholder':placeholder}));return;}
$current.children('div').append($('<span>',{class:$current.attr('class').replace(/sel/g,'sel__box__options'),text:$(this).text()}));});});$('.sel').click(function(){$(this).toggleClass('active');});$('.sel__box__options').click(function(){var txt=$(this).text();var index=$(this).index();$(this).siblings('.sel__box__options').removeClass('selected');$(this).addClass('selected');var $currentSel=$(this).closest('.sel');$currentSel.children('.sel__placeholder').text(txt);$currentSel.children('select').prop('selectedIndex',index+1);});$(document).ready(function(){$(".filter-button").click(function(){var value=$(this).attr('data-filter');if(value=="makeup")
{$('.filter').show('1000');}
else
{$(".filter").not('.'+value).hide('3000');$('.filter').filter('.'+value).show('3000');}});});$('.srfltBtn .filter-button').click(function(){$('.srfltBtn .filter-button').removeClass("active");$(this).addClass("active");});$(function(){$('.datepick').datetimepicker();});$(function(){$('.datepickDate').datetimepicker({format:'LT'}).on('dp.change',function(e){timecheck(this);});});$(function(){$('.datepickDateonly').datetimepicker({format:'MM/DD/YYYY'});});$(document).ready(function(){$("#slider").slider({min:0,max:50,step:1,values:[0],slide:function(event,ui){for(var i=0;i<ui.values.length;++i){$("input.sliderValue[data-index="+i+"]").val(ui.values[i]);}}});$("input.sliderValue").change(function(){var $this=$(this);$("#slider").slider("values",$this.data("index"),$this.val());});});$(function(){$("#slider-range-min").slider({range:"min",value:1,min:1,max:100,slide:function(event,ui){$("#amount").val(""+ui.value);}});$("#amount").val(""+$("#slider-range-min").slider("value"));});$('.ui.dropdown').dropdown({allowAdditions:true});(function(){var parallax=document.querySelectorAll(".parallax"),speed=0.5;window.onscroll=function(){[].slice.call(parallax).forEach(function(el,i){var windowYOffset=window.pageYOffset,elBackgrounPos="50% "+(windowYOffset*speed)+"px";el.style.backgroundPosition=elBackgrounPos;});};})();function toggleIcon(e){$(e.target).prev('.panel-heading').find(".more-less").toggleClass('glyphicon-plus glyphicon-minus');}
$('.panel-group').on('hidden.bs.collapse',toggleIcon);$('.panel-group').on('shown.bs.collapse',toggleIcon);function testAnim(x){$('.modal .modal-dialog').attr('class','modal-dialog  cascading-modal '+x+'  animated');};$('#likesList').on('show.bs.modal',function(e){testAnim("zoomIn");})
$('#likesList').on('hide.bs.modal',function(e){testAnim("zoomOut");})
$(document).ready(function(){$(".showCmt").click(function(){$(".comment").slideToggle("slow");})})
var animated=false;$('.heart').click(function(){if(!animated){$(this).addClass('happy').removeClass('broken');animated=true;}
else{$(this).removeClass('happy').addClass('broken');animated=false;}});$("#feed1").dblclick(function(){$('#heart1').click();});


$(window).resize(function() {
  $('.thumbnail.fancybox').height($('.thumbnail.fancybox').width());
});

$(window).resize(function() {
  $('.crtImg').height($('.crtImg').width());
});

$('.crtImg').height($('.crtImg').width());

$(window).resize(function()  
    {  
        var ratio = 3/4; // height / width  
        $('.feedImg').height( $('.feedImg').width() * ratio );  
    });  
      
    // When the page loads, trigger a window resize event  
    // so our element gets resized by default. Saves having   
    // to duplicate the same code on load too.  
    $(window).load(function()  
    {  
        $(window).trigger('resize');  
    });  


