// Сайт v2: «Монтаж» (выбор файлов и прогресс — только в браузере, файлы никуда не отправляются; CSP connect-src 'none')
// и «Примеры» (до/после, звук). Без библиотек и трекеров.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICON_MUTED = "<svg fill=\"currentColor\" viewBox=\"0 0 256 256\" aria-hidden=\"true\"><path d=\"M53.92,34.62A8,8,0,1,0,42.08,45.38L73.55,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V175.09l42.08,46.29a8,8,0,1,0,11.84-10.76ZM32,96H72v64H32ZM144,207.64,88,164.09V95.89l56,61.6Zm42-63.77a24,24,0,0,0,0-31.72,8,8,0,1,1,12-10.57,40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.59Zm-80.16-76a8,8,0,0,1,1.4-11.23l39.85-31A8,8,0,0,1,160,32v74.83a8,8,0,0,1-16,0V48.36l-26.94,21A8,8,0,0,1,105.84,67.91ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z\"></path></svg>";
  var ICON_SOUND = "<svg fill=\"currentColor\" viewBox=\"0 0 256 256\" aria-hidden=\"true\"><path d=\"M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z\"></path></svg>";

  // ---------- Монтаж ----------
  var editor = document.querySelector('[data-editor]');
  if (editor) {
    var drop = editor.querySelector('[data-drop]');
    var input = editor.querySelector('[data-files]');
    var list = editor.querySelector('[data-picked]');
    var counter = editor.querySelector('[data-counter]');
    var go = editor.querySelector('[data-go]');
    var prompt = editor.querySelector('[data-prompt]');
    var progress = editor.querySelector('[data-progress]');
    var bar = editor.querySelector('[data-bar]');
    var steps = editor.querySelectorAll('[data-step]');
    var gate = editor.querySelector('[data-gate]');
    var MAX = 20;
    var picked = [];
    var busy = false;

    var mb = function (n) { return n < 1 << 30 ? Math.max(1, Math.round(n / (1 << 20))) + ' МБ' : (n / (1 << 30)).toFixed(2).replace('.', ',') + ' ГБ'; };
    var fmt = function (s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
    var kindOf = function (f) {
      if (/^video\//.test(f.type) || /\.(mp4|mov|m4v|webm|mkv)$/i.test(f.name)) return 'video';
      if (/^image\//.test(f.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(f.name)) return 'photo';
      if (/^audio\//.test(f.type) || /\.(mp3|m4a|wav|aac|flac|ogg)$/i.test(f.name)) return 'music';
      return null;
    };
    var LABEL = { video: 'Видео', photo: 'Фото', music: 'Музыка' };

    function render() {
      list.innerHTML = '';
      var total = 0, secs = 0;
      picked.forEach(function (p) {
        total += p.file.size;
        secs += p.seconds || 0;
        var li = document.createElement('li');
        var th = document.createElement('div');
        th.className = 'picked__thumb';
        if (p.kind === 'video' && p.url) {
          var v = document.createElement('video');
          v.muted = true; v.playsInline = true; v.preload = 'metadata';
          v.src = p.url + '#t=0.1';
          v.addEventListener('loadedmetadata', function () {
            if (isFinite(v.duration) && !p.seconds) { p.seconds = v.duration; updateCounter(); }
          });
          th.appendChild(v);
        } else if (p.kind === 'photo' && p.url) {
          var im = document.createElement('img');
          im.alt = ''; im.src = p.url;
          th.appendChild(im);
        } else {
          th.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 256 256" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M212.92,17.71a7.89,7.89,0,0,0-6.86-1.46l-128,32A8,8,0,0,0,72,56V166.1A36,36,0,1,0,88,196V102.25l112-28V134.1A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.71Z"/></svg>');
        }
        var b = document.createElement('span');
        b.textContent = LABEL[p.kind];
        th.appendChild(b);
        var n = document.createElement('span'); n.className = 'picked__name'; n.textContent = p.file.name; n.title = p.file.name;
        var s = document.createElement('span'); s.className = 'picked__size'; s.textContent = mb(p.file.size);
        li.appendChild(th); li.appendChild(n); li.appendChild(s);
        list.appendChild(li);
      });
      list.hidden = picked.length === 0;
      updateCounter();
      go.disabled = busy || picked.length === 0;
    }
    function updateCounter() {
      var total = 0, secs = 0;
      picked.forEach(function (p) { total += p.file.size; secs += p.seconds || 0; });
      counter.hidden = picked.length === 0;
      counter.textContent = picked.length + ' из ' + MAX + ' файлов, ' + mb(total) + (secs > 0 ? ', видео ' + fmt(secs) : '');
    }
    function add(files) {
      if (busy || !files) return;
      Array.prototype.forEach.call(files, function (f) {
        if (picked.length >= MAX) return;
        if (picked.some(function (p) { return p.file.name === f.name && p.file.size === f.size; })) return;
        var kind = kindOf(f);
        if (!kind) return;
        var url = kind !== 'music' && !/\.hei[cf]$/i.test(f.name) ? URL.createObjectURL(f) : null;
        picked.push({ file: f, kind: kind, url: url, seconds: 0 });
      });
      render();
    }
    input.addEventListener('change', function () { add(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.setAttribute('data-over', 'true'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.setAttribute('data-over', 'false'); });
    });
    drop.addEventListener('drop', function (e) { add(e.dataTransfer && e.dataTransfer.files); });

    editor.querySelectorAll('[data-format]').forEach(function (b) {
      b.addEventListener('click', function () {
        editor.querySelectorAll('[data-format]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      });
    });
    editor.querySelectorAll('.hints button').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = prompt.value.trim();
        prompt.value = t ? t.replace(/[.,;\s]*$/, '') + ', ' + b.textContent : b.textContent;
        prompt.focus();
      });
    });

    // «загрузка» и разбор — только анимация: файлы не читаются целиком и не отправляются
    go.addEventListener('click', function () {
      if (busy || !picked.length) return;
      busy = true;
      go.disabled = true;
      go.textContent = 'Готовлю черновик…';
      progress.hidden = false;
      gate.hidden = true;
      var dur = reduce ? 600 : 5200;
      var t0 = performance.now();
      var pb = progress.querySelector('[role="progressbar"]');
      function tick(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 1.6);
        bar.style.width = (e * 100).toFixed(1) + '%';
        pb.setAttribute('aria-valuenow', String(Math.round(e * 100)));
        steps.forEach(function (li, i) {
          var a = i / steps.length, z = (i + 1) / steps.length;
          li.setAttribute('data-state', e >= z ? 'done' : e >= a ? 'run' : 'wait');
        });
        if (k < 1) requestAnimationFrame(tick);
        else {
          gate.hidden = false;
          go.textContent = 'Собрать черновик';
          busy = false;
          go.disabled = false;
          gate.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // ---------- Примеры: до/после, звук; играет только карточка на экране ----------
  var videos = [];
  document.querySelectorAll('[data-example]').forEach(function (card) {
    var v = card.querySelector('video');
    var tag = card.querySelector('[data-tag]');
    var sound = card.querySelector('[data-sound]');
    var sides = card.querySelectorAll('[data-side]');
    var side = 'after';
    function show(s) {
      side = s;
      var playing = !v.paused;
      v.poster = v.getAttribute('data-poster-' + s);
      v.src = v.getAttribute('data-src-' + s);
      v.style.objectFit = s === 'before' ? 'contain' : 'cover';
      sides.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-side') === s)); });
      var label = card.querySelector('[data-side="' + s + '"]').textContent;
      tag.textContent = label;
      // у «до» звука нет (исходники без звука) — кнопка звука только у «после»
      sound.hidden = s === 'before';
      if (playing || card._visible) v.play().catch(function () {});
    }
    v.src = v.getAttribute('data-src-after');
    sound.innerHTML = ICON_MUTED;
    sound.addEventListener('click', function () {
      v.muted = !v.muted;
      sound.innerHTML = v.muted ? ICON_MUTED : ICON_SOUND;
      sound.setAttribute('aria-label', v.muted ? 'Включить звук' : 'Выключить звук');
      if (!v.muted) {
        videos.forEach(function (o) { if (o !== v) { o.muted = true; o._card && (o._card.querySelector('[data-sound]').innerHTML = ICON_MUTED); } });
        v.play().catch(function () {});
      }
    });
    sides.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-side')); }); });
    v._card = card;
    videos.push(v);
  });
  document.querySelectorAll('video[data-autoplay]').forEach(function (v) { videos.push(v); });
  // iOS Safari пускает автозапуск только у беззвучного видео: свойство muted, не только атрибут
  // нажатие на видео — пауза/пуск: автозапуск бывает запрещён (iOS в режиме энергосбережения)
  videos.forEach(function (v) {
    v.defaultMuted = true; v.muted = true; v.playsInline = true;
    v.addEventListener('click', function () { if (v.paused) v.play().catch(function () {}); else v.pause(); });
  });
  if (videos.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (v._card) v._card._visible = e.isIntersecting;
        if (e.isIntersecting) v.play().catch(function () {});
        else v.pause();
      });
    }, { threshold: 0.4 });
    videos.forEach(function (v) { io.observe(v); });
  }
})();
