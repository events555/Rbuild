/*********************************************************************************

	Template Name: Tacko Auto Parts Bootstrap5 Html Template
	Description: A perfect template to build beautiful and unique Autopart websites. It comes with nice and clean design.
	Version: 1.0

**********************************************************************************/

/*************************************************
	1. Preloader Loading
	2. Myaccount Custom dropdown
    3. Header Sticky
    4. Search Popup
    5. Mobile Menu
    6. Slick Slideshow
        6.1 Homepage Slideshow
        6.2 Logo Slider
        6.3 Latest Blog Slider
        6.4 Testimonial Slider
    7. Number Counter
    8. Footer links for mobiles Expan/collapsed
    9. Scroll Top
    10. Sidebar Categories Level links
	11. Product Page Popup
	12. Masonry Collection Banners
    13. Price Range Slider
    14. Color Swacthes
    15. SHOW HIDE PRODUCT Filters
    16. Product Zoom Detail Page
	17. Product Slick Slider
		17.1 Product Detail Page Horizontal Thumb Slider
		17.2 Product Detail Vertical Thumb Slider
		17.3 Sidebar Recently View Slider
    18. Quantity Plus Minus
    19 Product Tabs Detail Page
    20. Products Slider Related/You May like Slider
    21. Tooltip
    22. Checkout Toggles
    
    *************************************************/

(function ($) {
	// Start of use strict
	'use strict';
    
    /*************************************************
	1. Preloader Loading
    *************************************************/
    function preloader() {
        $('#preloader').delay(500).fadeOut(500);
    }
	preloader();
	
	/*************************************************
	 2. Myaccount Custom dropdown
	 *************************************************/
	function setting_box(){
		$(".setting-link").on("click", function() {
		  	$("#settingsBox").toggleClass("active");
		});
		$("body").on("click", function(e) {
			var t = $(e.target);
			t.parents().is("#settingsBox") || t.parents().is(".setting-link") || t.is(".setting-link") || $("#settingsBox").removeClass("active")
		});
	}
	setting_box();
    
    /*************************************************
	3. Header Sticky
    *************************************************/
	function sticky_header(){
		if ($("#header").hasClass("header-fixed")) {
            var nav = $(".header");
            if (nav.length) {
                var offsetTop = nav.offset().top,
                    headerHeight = nav.height(),
                    injectSpace = $("<div />", { height: headerHeight }).insertAfter(nav);
                injectSpace.hide();
                $(window).on("load scroll", function () {
                    if ($(window).scrollTop() > offsetTop) {
                        nav.addClass("is-fixed");
                        injectSpace.show();
                    } else {
                        nav.removeClass("is-fixed");
                        injectSpace.hide();
                    }
                    if ($(window).scrollTop() > 350) {
                        nav.addClass("is-small animated fadeIn");
                    } else {
                        nav.removeClass("is-small animated fadeIn");
                    }
                });
            }
        }
	}
    sticky_header();
	
	/*************************************************
	4. Search Popup
    *************************************************/
	$('.modalOverly, .closeSearch').bind('click', function(){
      $('#search-popup').removeClass("active");
      $('body').removeClass("showOverly search-active");
    });
    
    $('.header .search-icon').on('click', function(e){
      e.preventDefault();
      $('body').addClass("showOverly search-active");
      $('#search-popup').addClass("active");
      setTimeout(function(){ $('input[name=q]').focus(); }, 600);
    });
	
	/*************************************************
	5. Mobile Menu
    *************************************************/
	/*var selectors = {
      	body: 'body',
      	sitenav: '#siteNav',
      	navLinks: '#siteNav .lvl1 > a',
      	menuToggle: '.js-mobile-nav-toggle',
      	mobilenav: '.mobile-nav-wrapper',
      	menuLinks: '#MobileNav .cps',
      	closemenu: '.closemobileMenu'
	};
     
  	$(selectors.navLinks).each(function(){
        if($(this).attr('href') == window.location.pathname) $(this).addClass('active');
    })
	
  	$(selectors.menuToggle).on("click",function(){
      body: 'body',
      $(selectors.mobilenav).toggleClass("active");
      $(selectors.body).toggleClass("menuOn");
      $(selectors.menuToggle).toggleClass('mobile-nav--open mobile-nav--close');
    });
  
    $(selectors.closemenu).on("click",function(){
      body: 'body',
      $(selectors.mobilenav).toggleClass("active");
      $(selectors.body).toggleClass("menuOn");
      $(selectors.menuToggle).toggleClass('mobile-nav--open mobile-nav--close');
    });
    $("body").on('click', function (event) {
      var $target = $(event.target);
      if(!$target.parents().is(selectors.mobilenav) && !$target.parents().is(selectors.menuToggle) && !$target.is(selectors.menuToggle)){
          $(selectors.mobilenav).removeClass("active");
          $(selectors.body).removeClass("menuOn");
          $(selectors.menuToggle).removeClass('mobile-nav--close').addClass('mobile-nav--open');
      }
    });
	$(selectors.menuLinks).on('click', function(e) {
		e.preventDefault();
		$(this).toggleClass('cp-plus cp-minus');
		$(this).parent().next().slideToggle();
    });*/
    
    /*************************************************
	6. Slick Slideshow
    *************************************************/
    /* 6.1 Homepage Slideshow */
      function home_slider(){
         $('.home-slideshow').slick({
            dots: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            arrows: true,
            autoplay: true,
            autoplaySpeed: 6000,
            responsive: [
            {
			  breakpoint: 991,
			  settings: {
				arrows: false
			  }
			},
			]
          });
      }
     home_slider();
	  
	   /* 6.2 Logo Slider */
	   function logo_slider(){
		$('.logo-items').slick({
			dots: false,
			infinite: true,
			slidesToShow: 12,
			slidesToScroll: 1,
			autoplay: true,
			autoplaySpeed: 3000,
			arrows: true,
			responsive: [
            {
			  breakpoint: 1440,
			  settings: {
				slidesToShow: 9,
				slidesToScroll: 1
			  }
			},
            {
			  breakpoint: 1240,
			  settings: {
				slidesToShow: 7,
				slidesToScroll: 1
			  }
			},
			{
			  breakpoint: 1024,
			  settings: {
				slidesToShow: 5,
				slidesToScroll: 1
			  }
			},
			{
			  breakpoint: 768,
			  settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			  }
			},
			{
			  breakpoint: 480,
			  settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			  }
			}
			]
		});
	}
    logo_slider();
    
    /* 6.3 Latest Blog Slider */
	function blogpost_slider(){
		$('.latest-blog-post-slider').slick({
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1,
			arrows: true,
			responsive: [
			{
			  breakpoint: 991,
			  settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
                arrows: false
			  }
			},
			{
			  breakpoint: 768,
			  settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
                arrows: false
			  }
			},
			{
			  breakpoint: 480,
			  settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
                arrows: false
			  }
			}
			]
		});
	}
    blogpost_slider();
    
    /* 6.4 Testimonial Slider */
    function testimonial_slider() {
        $('.quotes-slider').slick({
            dots: true,
            infinite: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: true,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        arrows: false
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false
                    }
                }
            ]
        });
    }
    testimonial_slider();
    
    /*************************************************
	7. Number Counter
    *************************************************/
	function counter_items(){
		$.fn.jQuerySimpleCounter = function( options ) {
			var settings = $.extend({
				start:  0,
				end:    1900,
				easing: 'swing',
				duration: 1900,
				complete: ''
			}, options );
		
			var thisElement = $(this);
		
			$({count: settings.start}).animate({count: settings.end}, {
				duration: settings.duration,
				easing: settings.easing,
				step: function() {
					var mathCount = Math.ceil(this.count);
					thisElement.text(mathCount);
				},
				complete: settings.complete
			});
		};
		
		$('.counter-section .counter-store').jQuerySimpleCounter({end: 733,duration: 8000});
		$('.counter-section .counter-rewards').jQuerySimpleCounter({end: 100,duration: 8000});
		$('.counter-section .counter-country').jQuerySimpleCounter({end: 25,duration: 8000});
	}
    counter_items();
    
    /*************************************************
	8. Footer links for mobiles Expan/collapsed
    *************************************************/
    function footer_dropdown() {
        $(".footer-links .title").on('click', function () {
            if ($(window).width() < 766) {
                $(this).nextAll().slideToggle();
                $(this).toggleClass("active");
            }
        });
    }
    footer_dropdown();
        
    //Resize Function 
    var resizeTimer;
    $(window).resize(function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $(window).trigger('delayed-resize', e);
        }, 250);
    });
    $(window).on("load resize", function (e) {
        if ($(window).width() > 766) {
            $(".footer-links ul").show();
        } else {
            $(".footer-links ul").hide();
        }
    });
    
    /*************************************************
	9. Scroll Top
    *************************************************/
    function scroll_top() {
        $("#site-scroll").on("click", function () {
            $("html, body").animate({scrollTop: 0}, 1000);
            return false;
        });
    }
    scroll_top();

    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $("#site-scroll").fadeIn();
        } else {
            $("#site-scroll").fadeOut();
        }
    });
    
    
    /*************************************************
	10. Sidebar Categories Level links
    *************************************************/
    function categories_level() {
        $(".block-categories .sub-level a").on("click", function () {
            $(this).next(".block-categories .sublinks").slideToggle("slow");
            $(this).toggleClass('active');
        });        
    }
    
    $(".filterbar .block .block-title").on("click", function () {
        $(this).next().slideToggle('300');
        $(this).toggleClass("active");
    });
    categories_level();
    
    /*************************************************
     11. Product Page Popup
     *************************************************/
    function video_popup() {
        if ($('.popup-video').length) {
            $('.popup-video').magnificPopup({
                type: 'iframe', mainClass: 'mfp-zoom-in', removalDelay: 400, preloader: false, fixedContentPos: false
            });
        }
    }
    video_popup();
    
    function image_gallery() {
        if ($(".img-gallery").length) {
            var groups = {};
            $(".img-gallery").each(function () {
              var id = parseInt($(this).attr("data-group"), 10);

              if (!groups[id]) {
                groups[id] = [];
              }

              groups[id].push(this);
            });

            $.each(groups, function () {
              $(this).magnificPopup({
                type: "image",
                closeOnContentClick: true,
                closeBtnInside: false,
                gallery: {
                  enabled: true
                }
              });
            });
          }
    }
    image_gallery();
    
    /*************************************************
	 12. Masonry Collection Banners
	 *************************************************/
	var $grid = $('.gallery-col-2, .gallery-col-3, .gallery-col-4').masonry({
	  itemSelector: '.grid-item',
	  percentPosition: true,
	  columnWidth: '.grid-sizer',
	});
	
	// layout Masonry after each image loads
	$grid.imagesLoaded().progress( function() {
	  $grid.masonry();
	});
    
    /*************************************************
	13. Price Range Slider
    *************************************************/
    function price_slider() {
        $("#slider-range").slider({
            range: true,
            min: 12,
            max: 200,
            values: [0, 100],
            slide: function (event, ui) {
                $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
            }
        });
        $("#amount").val("$" + $("#slider-range").slider("values", 0) +
                " - $" + $("#slider-range").slider("values", 1));
    }
    price_slider();
    
    
    /*************************************************
	14. Color Swacthes
    *************************************************/
    function color_swacthes() {
        $.each($(".swacth-list"), function () {
            var n = $(".swacth-btn");
            n.on("click", function () {
                $(this).parent().find(n).removeClass("checked");
                $(this).addClass("checked");
            });
        });
    }
    color_swacthes();

    function img_swacthes() {
        var selector = '.swatches li';
        $(selector).on('click', function () {
            $(selector).removeClass('active');
            $(this).addClass('active');
        });
    }
    img_swacthes();
    
     function size_swacthes() {
        var selector = '.swatches-size li';
        $(selector).on('click', function () {
            $(selector).removeClass('active');
            $(this).addClass('active');
        });
    }
    size_swacthes();
    
    /*************************************************
	15. SHOW HIDE PRODUCT Filters
    *************************************************/
    $('.btn-filter').on("click", function () {
        $(".filterbar").toggleClass("active");
    });
    $('.closeFilter').on("click", function () {
        $(".filterbar").removeClass("active");
    });
    // Hide Cart on document click
    $("body").on('click', function (event) {
        var $target = $(event.target);
        if (!$target.parents().is(".filterbar") && !$target.is(".btn-filter")) {
            $(".filterbar").removeClass("active");
        }
    });
    
    /*************************************************
	16. Product Zoom Detail Page
    *************************************************/
    function product_zoom() {
        $(".zoompro").elevateZoom({
            gallery: "gallery",
            galleryActiveClass: "active",
            zoomWindowWidth: 300,
            zoomWindowHeight: 100,
            scrollZoom: false,
            zoomType: "inner",
            cursor: "crosshair"
        });
    }
    product_zoom();
    
    /*************************************************
	17. Product Slick Slider
    *************************************************/
    
    /* 17.1 Product Detail Page Horizontal Thumb Slider */
    function product_thumb1() {
        $('.product-thumb-style1').slick({
            infinite: true,
            slidesToShow: 4,
            stageMargin: 5,
            slidesToScroll: 1
        });
    }    
    product_thumb1();
    
    /* 17.2 Product Detail Vertical Thumb Slider */
	function product_thumb(){
		$('.product-vertical-slider').slick({
			infinite: false,
			slidesToShow: 5,
			vertical: true,
			verticalSwiping: true,
			centerPadding: '0',
			draggable: true, 
			slidesToScroll: 1
		});
	}
	product_thumb();
    
    /* 17.3 Sidebar Recently View Slider */
    function recently_view() {
        $('.recently-product-slider').slick({
            infinite: false,
            slidesToShow: 1,
            stageMargin: 5,
            slidesToScroll: 1
        });
    }    
    recently_view();
    
    /*************************************************
	18. Quantity Plus Minus
    *************************************************/
    function qnt_incre() {
        $(".qtyBtn").on("click", function () {
            var qtyField = $(this).parent(".qtyField"),
                    oldValue = $(qtyField).find(".qty").val(),
                    newVal = 1;

            if ($(this).is(".plus")) {
                newVal = parseInt(oldValue) + 1;
            } else if (oldValue > 1) {
                newVal = parseInt(oldValue) - 1;
            }
            $(qtyField).find(".qty").val(newVal);
        });
    }
    qnt_incre();
    
    /*************************************************
	19 Product Tabs Detail Page
    *************************************************/
    $(".tab-content").hide();
    $(".tab-content:first").show();
    /* if in tab mode */
    $(".product-tabs li").on('click', function () {
        $(".tab-content").hide();
        var activeTab = $(this).attr("rel");
        $("#" + activeTab).fadeIn();

        $(".product-tabs li").removeClass("active");
        $(this).addClass("active");
    });

    $('.product-tabs li:first-child').addClass("active");
    $('.tab-container h3:first-child + .tab-content').show();

    /* if in drawer mode */
    $(".acor-ttl").on("click", function () {
        $(".tab-content").hide();
        var activeTab = $(this).attr("rel");
        $("#" + activeTab).fadeIn();

        $(".acor-ttl").removeClass("active");
        $(this).addClass("active");
        if ($(window).width() < 767) {
            var tabposition = $(this).offset();
            $("html, body").animate({scrollTop: tabposition.top}, 700);
        }
    });
    
    // Homepage Category Tabs
    $(".c-tab-content").hide();
    $(".c-tab-content:first").show();
    /* if in tab mode */
    $(".category-tabs li").on('click', function () {
        $(".c-tab-content").hide();
        var activeTab = $(this).attr("rel");
        $("#" + activeTab).fadeIn();

        $(".category-tabs li").removeClass("active");
        $(this).addClass("active");
    });

    $('.category-tabs li:first-child').addClass("active");
    $('.c-tab-container h3:first-child + .c-tab-content').show();
    
    /* if in drawer mode */
    $(".c-acor-ttl").on("click", function () {
        $(".c-tab-content").hide();
        var activeTab = $(this).attr("rel");
        $("#" + activeTab).fadeIn();

        $(".c-acor-ttl").removeClass("active");
        $(this).addClass("active");
        if ($(window).width() < 767) {
            var tabposition = $(this).offset();
            $("html, body").animate({scrollTop: tabposition.top}, 700);
        }
    });
    
    /*************************************************
	20. Products Slider Related/You May like Slider
    *************************************************/
    function product_slider() {
        $('.productSlider').slick({
            dots: false,
            infinite: false,
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]

        });
    }
    
    product_slider();
    
     function product_slider_3() {
        $('.productSlider3').slick({
            dots: false,
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]

        });
    }
    
    product_slider_3();
    
    
    /*************************************************
	21. Tooltip
    *************************************************/
    function tooltip() {
        if ($(window).width() > 991) {
            // $('[data-toggle="tooltip"]').tooltip();
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl, {
                    trigger: 'hover'
                });
            });
        }
    }
    tooltip();
  
    /*************************************************
	22. Checkout Toggles
    *************************************************/
    function createAccount() {
        $('#cbox').on('click', function () {
            $('#cbox_info').slideToggle(900);
        });
    }
    createAccount();
    
    function shipAdd() {
        $('#ship-box').on('click', function () {
            $('#ship-box-info').slideToggle(1000);
        });
    }
    shipAdd();
    
    function creditc() {
        $('#cCard').on('click', function () {
            $('#cc-info').slideToggle(1000);
        });
    }
    creditc();

})(jQuery);
