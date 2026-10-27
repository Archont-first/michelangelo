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

  // ---------- Давид в блоке «Скульптор…»: играет, пока блок на экране (assets/anim.js) ----------
  var how = document.querySelector('[data-david-how]');
  if (how && window.MichelAnim) window.MichelAnim.mountInView(how, 'david');
})();
