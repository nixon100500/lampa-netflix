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
        },
        {
            id: 'hbo', name: 'HBO', network: '49|3186', provider: 1899,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="12" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="10" fill="currentColor">HBO</text></svg>'
        },
        {
            id: 'prime', name: 'Prime Video', network: 1024, provider: 9,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="12" y="14" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="8.5" fill="#00A8E1">prime</text><path fill="#00A8E1" d="M5 17c4 2.2 10 2.2 14 0l-.6 1.4c-4 1.8-8.8 1.8-12.8 0z"/></svg>'
        },
        {
            id: 'disney', name: 'Disney+', network: 2739, provider: 337,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="12" y="17" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="13" fill="#3D7BFF">D+</text></svg>'
        }
    ];

    function day(offset) {
        var d = new Date(Date.now() + offset * 86400000);
        return d.toISOString().slice(0, 10);
    }

    // период для «новых сериалов» и «новых фильмов», в месяцах; 0 — за всё время
    var PERIODS = [1, 2, 4, 6, 0];

    function period() {
        var p = parseInt(Lampa.Storage.get('streaming_new_period', '4'), 10);
        return PERIODS.indexOf(p) >= 0 ? p : 4;
    }

    function periodName(p) {
        if (!p) return 'за всё время';
        return 'за ' + p + (p === 1 ? ' месяц' : (p < 5 ? ' месяца' : ' месяцев'));
    }

    function open(s, type) {
        var p = period(), to = day(0), url, title;
        var from = p ? day(-30 * p) : '';

        if (type === 'tv') {
            url = 'discover/tv?with_networks=' + s.network + '&sort_by=popularity.desc' +
                (from ? '&first_air_date.gte=' + from : '') + '&first_air_date.lte=' + to;
            title = s.name + ' — новые сериалы, ' + periodName(p);
        } else if (type === 'season') {
            url = 'discover/tv?with_networks=' + s.network + '&sort_by=popularity.desc' +
                '&air_date.gte=' + day(-30) + '&air_date.lte=' + to;
            title = s.name + ' — выходят сейчас';
        } else {
            url = 'discover/movie?with_watch_providers=' + s.provider + '&watch_region=US&sort_by=popularity.desc' +
                (from ? '&primary_release_date.gte=' + from : '') + '&primary_release_date.lte=' + to;
            title = s.name + ' — новые фильмы, ' + periodName(p);
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
                { title: 'Новые фильмы', type: 'movie' },
                { title: 'Период: ' + periodName(period()), type: 'period' }
            ],
            onSelect: function (a) {
                if (a.type === 'period') choosePeriod(s);
                else open(s, a.type);
            },
            onBack: function () { Lampa.Controller.toggle('menu'); }
        });
    }

    function choosePeriod(s) {
        var cur = period();
        Lampa.Select.show({
            title: 'Период новинок',
            items: PERIODS.map(function (p) {
                return { title: periodName(p), value: p, selected: p === cur };
            }),
            onSelect: function (a) {
                Lampa.Storage.set('streaming_new_period', String(a.value));
                menu(s);
            },
            onBack: function () { menu(s); }
        });
    }

    // ---------- Star Wars: ручной список по хронологии событий ----------
    // [тип, id в TMDB, мульт?]
    var SW_CANON = [
        ['tv', 202998, 1], ['tv', 114479], ['movie', 1893], ['movie', 1894], ['movie', 12180, 1], ['tv', 4194, 1],
        ['tv', 203085, 1], ['tv', 288055, 1], ['movie', 1895], ['tv', 289219, 1], ['tv', 251091, 1], ['tv', 105971, 1],
        ['movie', 348350], ['tv', 92830], ['tv', 83867], ['tv', 60554, 1], ['movie', 330459], ['movie', 11],
        ['movie', 1891], ['movie', 1892], ['tv', 82856], ['tv', 115036], ['tv', 114461], ['tv', 202879],
        ['movie', 1228710], ['tv', 79093, 1], ['movie', 140607], ['movie', 181808], ['movie', 181812]
    ];
    // неканон, спецвыпуски, LEGO, антологии
    var SW_OTHER = [
        ['tv', 3122, 1], ['movie', 74849], ['tv', 25, 1], ['tv', 3478, 1], ['movie', 1884], ['movie', 10372],
        ['tv', 114478, 1], ['tv', 289324, 1], ['tv', 71412, 1], ['tv', 66837, 1], ['tv', 85536, 1]
    ];

    // Категории: chrono — только ручной список по хронологии; остальные — ручной список
    // плюс всё новое из поиска TMDB по «Star Wars», отсортировано по дате выхода.
    function swKind(type, anim, title) {
        if (/^lego /i.test(title || '')) return 'other';
        if (anim) return 'anim';
        return type === 'movie' ? 'movie' : 'tv';
    }

    function swDate(x) { return x.release_date || x.first_air_date || ''; }

    function swComponent(object) {
        var comp = new Lampa.InteractionCategory(object);
        var net = new Lampa.Reguest();

        comp.create = function () {
            var self = this, cat = object.sw_cat;
            var lang = Lampa.Storage.field('tmdb_lang') || 'ru';
            var key = '&api_key=' + Lampa.TMDB.key() + '&language=' + lang;
            var cache = { cache: { life: 60 * 24 } };
            var tasks = [], manual = [], found = [];

            var list = cat === 'chrono' ? SW_CANON : SW_CANON.concat(SW_OTHER).filter(function (x) {
                var k = SW_OTHER.indexOf(x) >= 0 ? 'other' : (x[2] ? 'anim' : (x[0] === 'movie' ? 'movie' : 'tv'));
                return k === cat;
            });

            list.forEach(function (it, i) {
                tasks.push(function (next) {
                    net.silent(Lampa.TMDB.api(it[0] + '/' + it[1] + '?' + key.slice(1)), function (json) {
                        json.source = 'tmdb'; json.sw_type = it[0];
                        manual[i] = json; next();
                    }, next, false, cache);
                });
            });

            if (cat !== 'chrono') {
                ['movie', 'tv'].forEach(function (type) {
                    [1, 2, 3].forEach(function (page) {
                        tasks.push(function (next) {
                            net.silent(Lampa.TMDB.api('search/' + type + '?query=Star%20Wars&page=' + page + key), function (json) {
                                (json.results || []).forEach(function (r) { r.sw_type = type; found.push(r); });
                                next();
                            }, next, false, cache);
                        });
                    });
                });
            }

            var left = tasks.length;
            if (!left) return done();
            tasks.forEach(function (t) { t(function () { if (--left === 0) done(); }); });

            function done() {
                var out = manual.filter(Boolean);

                if (cat !== 'chrono') {
                    var have = {}, yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
                    SW_CANON.concat(SW_OTHER).forEach(function (x) { have[x[0] + x[1]] = 1; });

                    found.forEach(function (r) {
                        var orig = r.original_title || r.original_name || '';
                        var genres = r.genre_ids || [];
                        var date = swDate(r);
                        if (have[r.sw_type + r.id]) return;
                        var loc = r.title || r.name || '';
                        if (!/^(lego )?star wars/i.test(orig) && !/^(lego |лего )?зв[её]здные войны/i.test(loc)) return;
                        if (genres.indexOf(99) >= 0 || !r.poster_path || !date) return;
                        if (r.vote_count < 30 && date < yearAgo) return;
                        if (/podcast|flythrough|sounds|icons of the force|insider|making of/i.test(orig)) return;
                        if (swKind(r.sw_type, genres.indexOf(16) >= 0, orig) !== cat) return;
                        have[r.sw_type + r.id] = 1;
                        r.source = 'tmdb';
                        out.push(r);
                    });

                    out.sort(function (x, y) { return swDate(x) < swDate(y) ? -1 : 1; });
                }

                self.build({ results: out, total_pages: 1, page: 1 });
            }
        };

        comp.nextPageReuest = function (object, resolve, reject) { reject(); };

        var destroy = comp.destroy;
        comp.destroy = function () { net.clear(); if (destroy) destroy.apply(comp, arguments); };

        return comp;
    }

    function swMenu() {
        Lampa.Select.show({
            title: 'Звёздные войны',
            items: [
                { title: 'Всё по хронологии', cat: 'chrono' },
                { title: 'Фильмы', cat: 'movie' },
                { title: 'Сериалы', cat: 'tv' },
                { title: 'Мультсериалы и мультфильмы', cat: 'anim' },
                { title: 'Другое: старое, LEGO, спецвыпуски', cat: 'other' }
            ],
            onSelect: function (a) {
                Lampa.Activity.push({ url: '', title: 'Звёздные войны — ' + a.title.toLowerCase(), component: 'sw_list', sw_cat: a.cat, source: 'tmdb', page: 1 });
            },
            onBack: function () { Lampa.Controller.toggle('menu'); }
        });
    }

    // ---------- Фильмы и сериалы по играм (ключевое слово TMDB 41645) ----------
    function gamesMenu() {
        var items = [
            { title: 'Фильмы — популярные', url: 'discover/movie?with_keywords=41645&sort_by=popularity.desc' },
            { title: 'Фильмы — лучшие по оценкам', url: 'discover/movie?with_keywords=41645&sort_by=vote_average.desc&vote_count.gte=300' },
            { title: 'Фильмы — новые', url: 'discover/movie?with_keywords=41645&sort_by=primary_release_date.desc&primary_release_date.lte=' + day(0) },
            { title: 'Сериалы — популярные', url: 'discover/tv?with_keywords=41645&sort_by=popularity.desc' },
            { title: 'Сериалы — лучшие по оценкам', url: 'discover/tv?with_keywords=41645&sort_by=vote_average.desc&vote_count.gte=200' }
        ];
        Lampa.Select.show({
            title: 'По играм',
            items: items,
            onSelect: function (a) {
                Lampa.Activity.push({ url: a.url, title: 'По играм — ' + a.title.toLowerCase(), component: 'category_full', source: 'tmdb', card_type: true, page: 1 });
            },
            onBack: function () { Lampa.Controller.toggle('menu'); }
        });
    }

    var EXTRA = [
        {
            action: 'starwars_menu', name: 'Star Wars', open: swMenu,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#6EC1FF" d="M12 .5l.6 5.5v17.5h-1.2V6z"/><g fill="none" stroke="#6EC1FF" stroke-width="1.1"><circle cx="12" cy="15" r="6.2"/><path d="M11.4 12.5 8.7 18.5M12.6 15l2.9-3M13.7 14l2.3 4.5"/></g></svg>'
        },
        {
            action: 'games_menu', name: 'По играм', open: gamesMenu,
            icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M7 6h10a5 5 0 0 1 4.9 6l-.8 4.2a2.6 2.6 0 0 1-4.5 1.2L14.3 15H9.7l-2.3 2.4a2.6 2.6 0 0 1-4.5-1.2L2.1 12A5 5 0 0 1 7 6zm0 3v1.5H5.5V12H7v1.5h1.5V12H10v-1.5H8.5V9zm9 .2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2.3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>'
        }
    ];

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

        EXTRA.forEach(function (e) {
            var item = $('<li class="menu__item selector" data-action="' + e.action + '">' +
                '<div class="menu__ico">' + e.icon + '</div>' +
                '<div class="menu__text">' + e.name + '</div></li>');
            item.on('hover:enter', e.open);
            list.append(item);
        });
    }

    Lampa.Component.add('sw_list', swComponent);

    if (window.appready) add();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') add(); });
})();
