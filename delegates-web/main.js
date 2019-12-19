$(function () {
    getFiles().then(initialize)

    function getFiles() {
        return fetch('./files.json?' + Math.random())
            .then(res => res.json())
    }

    function initialize(files) {
        // console.log(files);
        var $container = $('#container');

        // const html = files.map(file => $(`<div class="item"><img data-src="https://drive.google.com/uc?export=view&id=${file.id}" /></div>`));

        // $container.append(html);

        // $('.item img').Lazy({
        //     scrollDirection: 'vertical',
        //     effect: 'fadeIn',
        //     visibleOnly: true,
        //     onError: function (element) {
        //         console.log('error loading ' + element.data('src'));
        //     }
        // });

        // $container.imagesLoaded(function () {
        //     $container.masonry({
        //         itemSelector: '.item',
        //         columnWidth: function (containerWidth) {
        //             return containerWidth / 12;
        //         }
        //     });
        // });
    }
});