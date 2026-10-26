// Michelangelo landing. No trackers, no external requests.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // All "get access" buttons take their URL from the single #tester-link.
  var link = document.getElementById('tester-link');
  if (link) {
    var url = link.getAttribute('href');
    document.querySelectorAll('[data-access]').forEach(function (a) { a.setAttribute('href', url); });
  }

  // ---------- Interactive demo (scripted on a real before/after result) ----------
  var demo = document.querySelector('[data-demo]');
  if (demo) {
    var log = demo.querySelector('[data-log]');
    var run = demo.querySelector('[data-run]');
    var video = demo.querySelector('[data-video]');
    var phone = demo.querySelector('.phone');
    var play = demo.querySelector('[data-play]');
    var tag = demo.querySelector('[data-tag]');
    var btns = demo.querySelectorAll('[data-show]');
    var SRC = {
      before: { src: 'assets/media/before.mp4', poster: 'assets/media/before.jpg', tag: 'До · 45,6 с' },
      after: { src: 'assets/media/after.mp4', poster: 'assets/media/after.jpg', tag: 'После · 29,8 с' }
    };
    var current = 'before';
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };

    function msg(cls, html) {
      var d = document.createElement('div');
      d.className = 'msg ' + cls;
      d.innerHTML = html;
      log.appendChild(d);
      return d;
    }

    function show(which) {
      current = which;
      var s = SRC[which];
      video.pause();
      video.muted = true;
      video.controls = false;
      phone.classList.remove('is-playing');
      video.setAttribute('poster', s.poster);
      video.setAttribute('src', s.src);
      tag.textContent = s.tag;
      btns.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-show') === which); });
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { if (!b.disabled) show(b.getAttribute('data-show')); });
    });

    play.addEventListener('click', function () {
      video.muted = false;
      video.controls = true;
      phone.classList.add('is-playing');
      var p = video.play();
      if (p && p.catch) p.catch(function () { video.muted = true; video.play().catch(function () {}); });
    });

    run.addEventListener('click', function () {
      run.disabled = true;
      msg('msg--me', 'Смонтируй круто');
      var t = msg('msg--bot', '<span class="typing" aria-label="Думаю"><i></i><i></i><i></i></span>');
      var steps = [
        'Убрать «эээ», «ммм» и длинные паузы',
        'Вырезать неудачный дубль и прощание',
        'Поставить самую сильную фразу в начало',
        'Субтитры, цвет и 5 зумов на ключевых словах',
        'Проверить, что смысл фраз не потерялся'
      ];
      wait(900).then(function () {
        t.innerHTML = 'План:<ul>' + steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';
        var items = t.querySelectorAll('li');
        var chain = Promise.resolve();
        items.forEach(function (li) { chain = chain.then(function () { return wait(650).then(function () { li.classList.add('done'); }); }); });
        return chain;
      }).then(function () { return wait(400); }).then(function () {
        msg('msg--bot', 'Готово. Ролик стал короче и живее — нажмите на видео.<small>45,6 с → 29,8 с · субтитры · цвет · 5 зумов</small>');
        var after = demo.querySelector('[data-show="after"]');
        after.disabled = false;
        show('after');
      });
    });
  }

  // ---------- Isometric wireframe cube that assembles itself ----------
  var cube = document.querySelector('[data-cube]');
  if (cube) {
    var NS = 'http://www.w3.org/2000/svg';
    var body = cube.querySelector('.cube__body');
    var S = 34, CX = 150, CY = 124, C = Math.cos(Math.PI / 6), H = 0.5;
    function P(x, y, z) { return [(CX + (x - y) * S * C).toFixed(1), (CY + (x + y) * S * H - z * S).toFixed(1)].join(','); }
    function face(pts, cls) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', 'M' + pts.map(function (q) { return P(q[0], q[1], q[2]); }).join('L') + 'Z');
      if (cls) p.setAttribute('class', cls);
      return p;
    }
    var pieces = [];
    for (var k = 0; k < 3; k++) for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) pieces.push([i, j, k]);
    pieces.sort(function (a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]) || a[2] - b[2]; });
    var groups = pieces.map(function (c, n) {
      var i = c[0], j = c[1], k = c[2];
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'piece');
      g.appendChild(face([[i + 1, j, k], [i + 1, j + 1, k], [i + 1, j + 1, k + 1], [i + 1, j, k + 1]]));
      g.appendChild(face([[i, j + 1, k], [i + 1, j + 1, k], [i + 1, j + 1, k + 1], [i, j + 1, k + 1]]));
      g.appendChild(face([[i, j, k + 1], [i + 1, j, k + 1], [i + 1, j + 1, k + 1], [i, j + 1, k + 1]], 'face-top'));
      // scattered start position (deterministic so it looks designed, not random noise)
      var exposed = i === 2 || j === 2 || k === 2;
      var dx = exposed ? ((n * 37) % 120) - 60 : 0;
      var dy = exposed ? -(((n * 53) % 90) + 20) : 0;
      if (!reduce) {
        g.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        g.style.opacity = exposed ? '0.0' : '1';
        g.style.transitionDelay = (n * 45) + 'ms';
      }
      body.appendChild(g);
      return g;
    });
    function assemble() { groups.forEach(function (g) { g.style.transform = 'translate(0,0)'; g.style.opacity = '1'; }); }
    if (reduce || !('IntersectionObserver' in window)) assemble();
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { assemble(); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(cube);
    }
  }
})();
