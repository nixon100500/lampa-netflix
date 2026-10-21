(function () {
    'use strict';

    // Netflix: новинки — значок в левом меню Lampa, данные из TMDB через встроенный источник Lampa
    if (window.netflix_new_plugin) return;
    window.netflix_new_plugin = true;

    var ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#E50914" d="M5 2h4.2l5.6 13.4V2H19v20c-1.3-.2-2.7-.3-4.1-.4L9.2 8.3V21.3c-1.4.1-2.8.3-4.2.5V2z"/></svg>';

    function day(offset) {
        var d = new Date(Date.now() + offset * 86400000);
        return d.toISOString().slice(0, 10);
    }

    function open(type) {
        var from = day(-120), to = day(0), url, title;

        if (type === 'tv') {
            url = 'discover/tv?with_networks=213&sort_by=popularity.desc' +
                '&first_air_date.gte=' + from + '&first_air_date.lte=' + to;
            title = 'Netflix — новые сериалы';
        } else if (type === 'season') {
            url = 'discover/tv?with_networks=213&sort_by=popularity.desc' +
                '&air_date.gte=' + day(-30) + '&air_date.lte=' + to;
            title = 'Netflix — выходят сейчас';
        } else {
            url = 'discover/movie?with_watch_providers=8&watch_region=US&sort_by=popularity.desc' +
                '&primary_release_date.gte=' + from + '&primary_release_date.lte=' + to;
            title = 'Netflix — новые фильмы';
        }

        Lampa.Activity.push({
            url: url,
            title: title,
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1
        });
    }

    function menu() {
        Lampa.Select.show({
            title: 'Netflix',
            items: [
                { title: 'Новые сериалы', type: 'tv' },
                { title: 'Выходят сейчас (новые серии)', type: 'season' },
                { title: 'Новые фильмы', type: 'movie' }
            ],
            onSelect: function (a) { open(a.type); },
            onBack: function () { Lampa.Controller.toggle('menu'); }
        });
    }

    function add() {
        var item = $('<li class="menu__item selector" data-action="netflix_new">' +
            '<div class="menu__ico">' + ICON + '</div>' +
            '<div class="menu__text">Netflix</div></li>');
        item.on('hover:enter', menu);
        $('.menu .menu__list').eq(0).append(item);
    }

    if (window.appready) add();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') add(); });
})();
