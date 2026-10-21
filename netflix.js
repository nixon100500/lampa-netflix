(function () {
    'use strict';

    // Загрузчик: основной код в main.js, параметр v обходит кэш браузера (jsDelivr отдаёт max-age 7 дней)
    var v = Math.floor(Date.now() / 3600000);
    Lampa.Utils.putScriptAsync(['https://cdn.jsdelivr.net/gh/nixon100500/lampa-netflix@main/main.js?v=' + v], function () {});
})();
