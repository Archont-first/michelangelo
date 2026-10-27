// Анимации платформы (Lottie): кубик в «Монтаже», Давид на экране «закрытый тест». Перекраска в цвета бренда — при
// загрузке, в копии данных (порт web/lib/lottie.ts платформы). Плеер lottie-web (light, MIT) и данные подключаются
// лениво, тегами <script> своего домена (CSP connect-src 'none': fetch не нужен). prefers-reduced-motion — первый кадр.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- перекраска ----------
  function hex(h) { return [0, 2, 4].map(function (i) { return parseInt(h.slice(1 + i, 3 + i), 16) / 255; }); }
  function mix(a, b, t) { t = Math.min(1, Math.max(0, t)); return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function near(a, b, eps) { eps = eps || 0.06; return a.every(function (v, i) { return Math.abs(v - b[i]) <= eps; }); }
  var MILK = hex('#F4EDE3'), INK = hex('#151213'), RED = hex('#A4302A'), RED_ON_DARK = hex('#E8928A');
  var RED_LIGHT = hex('#D9564D'), RED_DARK = hex('#5E1612'), RED_PALE = hex('#FBF1EE');
  var WHITE = [1, 1, 1], BLACK = [0, 0, 0];

  // жёлтый → красный бренда той же «светлоты»: светлые — светлее, оливковые — темнее, кремовые — бледно-розовые
  function yellowToRed(c) {
    var r = c[0], g = c[1], b = c[2];
    if (r < 0.5 || Math.abs(r - g) > 0.06 || b > r - 0.04) return null;
    var s = 1 - b / r, t = (r - 0.8) / 0.2;
    var base = t >= 0 ? mix(RED, RED_LIGHT, t) : mix(RED, RED_DARK, -t * 2);
    return mix(base, RED_PALE, (0.4 - s) / 0.4);
  }
  var MAPS = {
    'cube-light': function (kind, c) { return kind === 'stroke' ? RED : near(c, WHITE) ? MILK : near(c, BLACK) ? INK : null; },
    'cube-dark': function (kind, c) { return kind === 'stroke' ? RED_ON_DARK : near(c, BLACK) ? INK : near(c, WHITE) ? MILK : null; },
    'david': function (kind, c) { return yellowToRed(c) || (near(c, [0.0353, 0.0353, 0.0353], 0.04) ? INK : null); }
  };
  // кубик занимает ~⅓ холста — без увеличения в кнопке он был бы с булавочную головку
  var ZOOM = { 'cube-light': 2.6, 'cube-dark': 2.6, 'david': 1 };

  function paint(c, kind, map) {
    function swap(arr) {
      if (!Array.isArray(arr) || arr.length < 3 || typeof arr[0] !== 'number') return arr;
      var out = map(kind, [arr[0], arr[1], arr[2]]);
      return out ? out.map(function (v) { return Math.round(v * 10000) / 10000; }).concat(arr.slice(3)) : arr;
    }
    if (c.a === 1 && Array.isArray(c.k)) {
      c.k.forEach(function (key) {
        if (key && typeof key === 'object') { if ('s' in key) key.s = swap(key.s); if ('e' in key) key.e = swap(key.e); }
      });
    } else c.k = swap(c.k);
  }
  function recolor(data, map) {
    var copy = JSON.parse(JSON.stringify(data));
    (function walk(o) {
      if (Array.isArray(o)) return o.forEach(walk);
      if (!o || typeof o !== 'object') return;
      if ((o.ty === 'fl' || o.ty === 'st') && o.c && typeof o.c === 'object') paint(o.c, o.ty === 'fl' ? 'fill' : 'stroke', map);
      Object.keys(o).forEach(function (k) { walk(o[k]); });
    })(copy);
    return copy;
  }

  // ---------- ленивая загрузка ----------
  var loaded = {};
  function script(src) {
    return loaded[src] || (loaded[src] = new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = ok;
      s.onerror = function () { delete loaded[src]; s.remove(); fail(new Error(src)); };
      document.head.appendChild(s);
    }));
  }
  function player() {
    return script('/assets/vendor/lottie/lottie_light.min.js').then(function () { return window.lottie; });
  }
  function data(name) {
    if (window.MichelAnimData && window.MichelAnimData[name]) return Promise.resolve(window.MichelAnimData[name]);
    return script('/assets/anim/' + name + '.js').then(function () { return window.MichelAnimData[name]; });
  }

  // mount(el, 'cube-light' | 'cube-dark' | 'david') → destroy(). Нет анимации — в рамке остаётся то, что было рядом.
  function mount(el, name) {
    var anim = null, gone = false, playing = true;
    var box = document.createElement('span');
    var z = ZOOM[name] || 1;
    box.style.cssText = 'position:absolute;inset:' + (-(z - 1) / 2 * 100) + '%';
    el.appendChild(box);
    Promise.all([player(), data(name)]).then(function (r) {
      if (gone) return;
      anim = r[0].loadAnimation({
        container: box, renderer: 'svg', loop: !reduce, autoplay: !reduce,
        animationData: recolor(r[1], MAPS[name]),
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
      if (reduce) anim.goToAndStop(0, true);
      else if (!playing) anim.pause();
      el.setAttribute('data-ready', '');
    }).catch(function () {});
    function stop() { gone = true; if (anim) anim.destroy(); box.remove(); el.removeAttribute('data-ready'); }
    // play/pause — для анимации, которая проигрывается только пока на экране (до загрузки плеера запоминаем желаемое)
    stop.play = function () { playing = true; if (anim && !reduce) anim.play(); };
    stop.pause = function () { playing = false; if (anim && !reduce) anim.pause(); };
    return stop;
  }

  // mountInView: плеер и данные грузятся, когда блок подъезжает к экрану; на экране — играет, вне экрана — пауза
  function mountInView(el, name) {
    var stop = null;
    if (!('IntersectionObserver' in window)) return mount(el, name);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!stop) stop = mount(el, name); else stop.play(); }
        else if (stop) stop.pause();
      });
    }, { rootMargin: '120px 0px', threshold: 0.01 });
    io.observe(el);
    return function () { io.disconnect(); if (stop) stop(); };
  }

  window.MichelAnim = {
    mount: mount,
    mountInView: mountInView,
    preload: function (names) { player().catch(function () {}); (names || []).forEach(function (n) { data(n).catch(function () {}); }); }
  };
})();
