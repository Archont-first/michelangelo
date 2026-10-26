// Michelangelo — лендинг. Без трекеров и внешних запросов.

// Кнопки «Стать тестером» берут ссылку из единственного места — #tester-link в index.html.
// Без JS они просто ведут к блоку #join с той же ссылкой.
(function () {
  var link = document.getElementById('tester-link');
  if (!link) return;
  var url = link.getAttribute('href');
  document.querySelectorAll('[data-tester]').forEach(function (a) {
    a.setAttribute('href', url);
    a.setAttribute('rel', 'noopener');
  });
})();

// До/после: видео грузится только по нажатию, звук включается тем же нажатием
// (жест пользователя — иначе Safari не даст снять muted). Одновременно играет одно видео.
(function () {
  var clips = Array.prototype.slice.call(document.querySelectorAll('[data-clip]'));

  function stopOthers(current) {
    clips.forEach(function (c) {
      if (c === current) return;
      var v = c.querySelector('video');
      if (!v.paused) v.pause();
    });
  }

  clips.forEach(function (clip) {
    var video = clip.querySelector('video');
    var button = clip.querySelector('.clip__play');

    button.addEventListener('click', function () {
      stopOthers(clip);
      video.muted = false;
      video.controls = true;
      clip.classList.add('is-playing');
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          // Автозапуск со звуком запрещён (режим экономии, политика браузера) — пробуем без звука.
          video.muted = true;
          video.play().catch(function () {});
        });
      }
    });

    video.addEventListener('play', function () { stopOthers(clip); });
  });
})();
