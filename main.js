(function () {
    'use strict';

    // Новинки стримингов — значки в левом меню Lampa, данные из TMDB через встроенный источник Lampa
    if (window.netflix_new_plugin) return;
    window.netflix_new_plugin = true;

    // network — id сети в TMDB (сериалы), provider — id сервиса в watch providers (фильмы)
    var SERVICES = [
        {
            id: 'netflix', name: 'Netflix', network: 213, provider: 8,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#E50914" d="M5 2h4.2l5.6 13.4V2H19v20c-1.3-.2-2.7-.3-4.1-.4L9.2 8.3V21.3c-1.4.1-2.8.3-4.2.5V2z"/></svg>'
        },
        {
            id: 'appletv', name: 'Apple TV+', network: 2552, provider: 350,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3.01-.8-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.73c1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.53 1.26-2.6-.03-.01-2.42-.93-2.46-3.72zM14.08 5.84c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.03.08 2.07-.52 2.71-1.28z"/></svg>'
        }
    ];

    function day(offset) {
        var d = new Date(Date.now() + offset * 86400000);
        return d.toISOString().slice(0, 10);
    }

    function open(s, type) {
        var from = day(-120), to = day(0), url, title;

        if (type === 'tv') {
            url = 'discover/tv?with_networks=' + s.network + '&sort_by=popularity.desc' +
                '&first_air_date.gte=' + from + '&first_air_date.lte=' + to;
            title = s.name + ' — новые сериалы';
        } else if (type === 'season') {
            url = 'discover/tv?with_networks=' + s.network + '&sort_by=popularity.desc' +
                '&air_date.gte=' + day(-30) + '&air_date.lte=' + to;
            title = s.name + ' — выходят сейчас';
        } else {
            url = 'discover/movie?with_watch_providers=' + s.provider + '&watch_region=US&sort_by=popularity.desc' +
                '&primary_release_date.gte=' + from + '&primary_release_date.lte=' + to;
            title = s.name + ' — новые фильмы';
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

    function menu(s) {
        Lampa.Select.show({
            title: s.name,
            items: [
                { title: 'Новые сериалы', type: 'tv' },
                { title: 'Выходят сейчас (новые серии)', type: 'season' },
                { title: 'Новые фильмы', type: 'movie' }
            ],
            onSelect: function (a) { open(s, a.type); },
            onBack: function () { Lampa.Controller.toggle('menu'); }
        });
    }

    function add() {
        var list = $('.menu .menu__list').eq(0);
        SERVICES.forEach(function (s) {
            // старая версия плагина ставила Netflix с data-action="netflix_new"
            var action = s.id === 'netflix' ? 'netflix_new' : s.id + '_new';
            var item = $('<li class="menu__item selector" data-action="' + action + '">' +
                '<div class="menu__ico">' + s.icon + '</div>' +
                '<div class="menu__text">' + s.name + '</div></li>');
            item.on('hover:enter', function () { menu(s); });
            list.append(item);
        });
    }

    if (window.appready) add();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') add(); });
})();
