const backgroundImage = "/assets/portada-cropped.jpg";
const swippers = {};
var restShowed = false;
// var backgroundImage = 'https://via.placeholder.com/9584x840.png/09f/fff';

getImgDimentions().then(initialize);

function getImgDimentions() {
    return new Promise(resolve => {
        $(`<img src="${backgroundImage}" style="position:absolute; right:9999999" />`)
            .on('load', function () {
                resolve({
                    width: this.width,
                    height: this.height
                });

                $(this).remove();
            })
            .appendTo('body');
    })
}

function initialize(dim) {

    initializeSmothNavigation();

    $(window)
        .on('resize', () => plotSwipperCover(dim))
        .trigger('resize');
}

function initializeSmothNavigation() {
    $('.nav-link, .navbar-brand').click(function () {
        const to = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(to).offset().top - $('.navbar').outerHeight()
        }, 1500);
    });
}

function plotSwipperCover(dim) {

    const width = $(window).height() * dim.width / dim.height;
    const windowWidth = $(window).width();
    const nSlides = Math.ceil(width / windowWidth);
    const until = width - windowWidth;

    $('.parallax-bg')
        .css({ width, 'background-image': `url(${backgroundImage})` })
        .attr('data-swiper-parallax', `-${until}`);

    $('#home .swiper-wrapper').css('transition-timing-function', 'linear !important');

    if (swippers.cover) {
        swippers.cover.destroy();
        $('#home .swiper-wrapper').empty();
    }

    for (var i = 0; i < nSlides; i++) {
        $('#home .swiper-wrapper').append('<div class="swiper-slide"></div>')
    }

    swippers.cover = new Swiper('#home .swiper-container', {
        speed: 10000 / nSlides,
        parallax: true,
        allowTouchMove: false,
        allowClick: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '#home .swiper-button-next',
            prevEl: '#home .swiper-button-prev',
        },
        autoplay: {
            delay: 0,
            disableOnInteraction: false
        },
        on: {
            slideChangeTransitionEnd: function () {
                if (this.autoplay.running) {
                    if (this.realIndex === this.slides.length - 1) {
                        this.allowTouchMove = true;
                        this.allowClick = true;

                        showRest();
                    }

                    if (this.realIndex === 0) {
                        this.autoplay.stop();
                    }
                }
            }
        }
    });

    $('.swiper-container').hover(
        () => swippers.cover.autoplay.stop(),
        () => swippers.cover.autoplay.start()
    );

    setTimeout(showRest, 15000);
}

function showRest() {

    if (!restShowed) {

        $('.hide')
            .removeClass('hide')
            .addClass('animated fast fadeIn');

        getFiles().then(plotGallery);

        setTimeout(typeFirstPhrase, 1000);

        restShowed = true;

    }
}

function typeFirstPhrase() {
    new Typed('.first-phrase', {
        strings: ["¡Miren qué bueno es y qué gusto da<br> que los hermanos vivan juntos en unidad!<br>(Sal 133: 1)"],
        typeSpeed: 40
    });
}

function plotGallery(files) {

    files.forEach(file => $(`
        <div data-background="https://drive.google.com/uc?export=view&id=${file.id}" class="swiper-slide swiper-lazy">
            <div class="swiper-lazy-preloader"></div>
        </div>`)
        .appendTo('#gallery .swiper-wrapper'));

    const initialSlide = localStorage.getItem('gallery-index');

    swippers.gallery = new Swiper('#gallery .swiper-container', {
        speed: 2000,
        preloadImages: false,
        initialSlide: (initialSlide && +initialSlide) || 0,
        keyboard: {
            enabled: true,
            onlyInViewport: false,
        },
        autoplay: {
            delay: 10000,
            disableOnInteraction: false
        },
        navigation: {
            nextEl: '#gallery .swiper-button-next',
            prevEl: '#gallery .swiper-button-prev',
        },
        lazy: {
            loadOnTransitionStart: true,
            loadPrevNext: true,
            loadPrevNextAmount: 2
        },
        on: {
            init: function () {
                this.autoplay.stop();
                changeAutoplayGallery();
            },
            slideChangeTransitionEnd: function () {
                localStorage.setItem('gallery-index', this.realIndex);
            }
        }
    });
}

function getFiles() {
    return fetch('./assets/files.json?' + Math.random())
        .then(res => res.json())
        .then(files => files.map(file => ({
            ...file,
            number: +file.name.replace(/AGAF|\.JPG/gmi, '')
        })
        ))
        .then(files => files.sort((f1, f2) => f1.number < f2.number ? -1 : 1))
}

function changeAutoplayGallery() {
    $(window).scroll(function () {
        if (swippers.gallery) {
            var $gallery = $('#gallery');
            var top_of_element = $gallery.offset().top;
            var bottom_of_element = $gallery.offset().top + $gallery.outerHeight();
            var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
            var top_of_screen = $(window).scrollTop();
            var isVisible = (bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element);

            if (isVisible && !swippers.gallery.autoplay.running) {
                swippers.gallery.autoplay.start();
            }

            if (!isVisible && swippers.gallery.autoplay.running) {
                swippers.gallery.autoplay.stop();
            }
        }
    });
}
