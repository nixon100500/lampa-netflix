(function () {
    'use strict';

    // Загрузчик: основной код в main.js. Сначала raw.githack.com (кэш 1 минута),
    // если недоступен — jsDelivr (у него кэш ветки бывает залипает на часы).
    var v = Math.floor(Date.now() / 600000);
    var urls = [
        'https://raw.githack.com/nixon100500/lampa-netflix/main/main.js?v=' + v,
        'https://cdn.jsdelivr.net/gh/nixon100500/lampa-netflix@main/main.js?v=' + v
    ];

    function load(i) {
        if (i >= urls.length) return;
        var s = document.createElement('script');
        s.src = urls[i];
        s.onerror = function () { load(i + 1); };
        document.head.appendChild(s);
    }

    load(0);
})();
