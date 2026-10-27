// Michelangelo — hero "Creation of Adam": God's hand stays a fresco,
// Adam's hand is rebuilt from characters (the AI coming alive).
// Canvas2D, no libraries, no external requests.
(function () {
  'use strict';
  var root = document.querySelector('[data-hero]');
  if (!root) return;
  var canvas = root.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cs = getComputedStyle(root);
  var BG = cs.getPropertyValue('--hero-bg').trim() || '#F4EDE3';
  var INK = [21, 18, 19];
  var RED = [164, 48, 42];
  var LEVELS = [".·:'`", "-~=+*^", "<>/|!?;$%", "(){}[]λσθπ∑∂√≈", "01xy#&@∇∫", "01#@≠∞"]; // light → heavy: punctuation → operators → code → math → bits
  var SEAM = 0.493;          // gap between the fingers (fraction of image width)
  var FOCUS_X = 0.62;        // what stays visible on narrow screens
  var img = new Image();
  img.src = root.getAttribute('data-src');

  var W = 0, H = 0, dpr = 1, cell = 10, fs = 12, fresco = null, plaster = null, silhouette = null, parts = [], t0 = 0, raf = 0;
  var view = { x: 0, y: 0, w: 0, h: 0 }; // where the image is drawn (cover-fit)
  var mouse = { x: -1e4, y: -1e4, on: false };
  var running = false, visible = true, ready = false;
  var settleAt = 0, lastInput = 0, moving = false; // idle: once the hand is built and nobody touches it, stop redrawing
  var grain = makeGrain();

  function smooth(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function curve(x) { // tone curve (0→.18, .5→.56, 1→1) on darkness
    return x < 0.5 ? 0.18 + (0.56 - 0.18) * (x / 0.5) : 0.56 + (1 - 0.56) * ((x - 0.5) / 0.5);
  }
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }

  function makeGrain() {
    var g = document.createElement('canvas'); g.width = g.height = 128;
    var c = g.getContext('2d'), d = c.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    c.putImageData(d, 0, 0); return g;
  }

  function layout() {
    var r = root.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(r.width); H = Math.round(r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    // cover-fit with a focal point on the hands
    // the touch point sits in the exact centre of the screen; scale so both arms still reach the edges
    var ia = img.naturalWidth / img.naturalHeight;
    view.w = Math.max(H * ia, W / (2 * (1 - SEAM)), W / (2 * SEAM));
    view.h = view.w / ia;
    view.x = W / 2 - view.w * SEAM;
    view.y = (H - view.h) / 2;
    cell = W < 560 ? 7 : W < 1000 ? 7.5 : 8;
    buildFresco();
    buildSilhouette();
    buildParticles();
  }

  // God's half: the fresco, faded into the page on every edge and at the seam.
  function buildFresco() {
    // background: the whole fresco wall, desaturated and very faint, so both hands share one surface
    plaster = document.createElement('canvas');
    plaster.width = Math.ceil(W / 2); plaster.height = Math.ceil(H / 2);
    var pc = plaster.getContext('2d');
    pc.drawImage(img, view.x / 2, view.y / 2, view.w / 2, view.h / 2);
    var pd = pc.getImageData(0, 0, plaster.width, plaster.height), q = pd.data;
    for (var n = 0; n < q.length; n += 4) {
      var l = 0.299 * q[n] + 0.587 * q[n + 1] + 0.114 * q[n + 2];
      var arm = Math.max(smooth(0.07, 0.12, (q[n] - q[n + 2]) / 255), smooth(185, 140, l)); // painted skin + outlines → bare wall
      l = l + (214 - l) * arm;
      q[n] = l * 1.02; q[n + 1] = l * 0.98; q[n + 2] = l * 0.92;
    }
    pc.putImageData(pd, 0, 0);
    pc.globalCompositeOperation = 'destination-in';
    var pg = pc.createRadialGradient(plaster.width * 0.5, plaster.height * 0.5, 0, plaster.width * 0.5, plaster.height * 0.5, plaster.width * 0.55);
    pg.addColorStop(0, 'rgba(0,0,0,1)'); pg.addColorStop(1, 'rgba(0,0,0,0)');
    pc.fillStyle = pg; pc.fillRect(0, 0, plaster.width, plaster.height);
    var pv = pc.createLinearGradient(0, 0, 0, plaster.height);
    pv.addColorStop(0, 'rgba(0,0,0,0)'); pv.addColorStop(0.3, 'rgba(0,0,0,1)'); pv.addColorStop(0.75, 'rgba(0,0,0,1)'); pv.addColorStop(1, 'rgba(0,0,0,0)');
    pc.fillStyle = pv; pc.fillRect(0, 0, plaster.width, plaster.height);

    fresco = document.createElement('canvas');
    fresco.width = W * dpr; fresco.height = H * dpr;
    var c = fresco.getContext('2d');
    c.scale(dpr, dpr);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(img, view.x, view.y, view.w, view.h);
    // keep the arm, drop the painted wall: warm skin + dark outlines stay, plaster goes
    var id = c.getImageData(0, 0, fresco.width, fresco.height), a = id.data;
    for (var n2 = 0; n2 < a.length; n2 += 4) {
      var r = a[n2] / 255, g = a[n2 + 1] / 255, b = a[n2 + 2] / 255;
      var lum = 0.299 * r + 0.587 * g + 0.114 * b;
      var keep = Math.max(smooth(0.075, 0.14, r - b), smooth(0.74, 0.52, lum));
      a[n2 + 3] = a[n2 + 3] * keep;
    }
    c.putImageData(id, 0, 0);
    c.setTransform(1, 0, 0, 1, 0, 0); c.scale(dpr, dpr);
    // seam: the painting breaks into blocks towards the gap — it is being "digitised"
    var sx = view.x + view.w * SEAM, s0 = sx - view.w * 0.002, band = view.w * 0.012;
    c.globalCompositeOperation = 'destination-in';
    var fade = c.createLinearGradient(s0, 0, s0 + band, 0);
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(0.6, 'rgba(0,0,0,0.85)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
    c.fillStyle = fade; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'destination-in';
    var v = c.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.18, 'rgba(0,0,0,1)');
    v.addColorStop(0.82, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
    var h = c.createLinearGradient(0, 0, W, 0);
    h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.92, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = h; c.fillRect(0, 0, W, H);
  }

  function buildSilhouette() {
    var sw = Math.ceil(W / 3), shh = Math.ceil(H / 3);
    silhouette = document.createElement('canvas'); silhouette.width = sw; silhouette.height = shh;
    var c = silhouette.getContext('2d');
    c.imageSmoothingQuality = 'high';
    c.drawImage(img, view.x / 3, view.y / 3, view.w / 3, view.h / 3);
    var id = c.getImageData(0, 0, sw, shh), a = id.data, sx = (view.x + view.w * SEAM) / 3;
    for (var n = 0, px = 0; n < a.length; n += 4, px++) {
      var x = px % sw, m = smooth(0.075, 0.15, (a[n] - a[n + 2]) / 255) * smooth(sx, sx - 6, x);
      var l = (0.299 * a[n] + 0.587 * a[n + 1] + 0.114 * a[n + 2]) / 255;
      a[n] = 164; a[n + 1] = 48; a[n + 2] = 42; a[n + 3] = 255 * m * (0.35 + 0.65 * (1 - l));
    }
    c.putImageData(id, 0, 0);
  }

  // Adam's half: the arm is written with words — one particle per word.
  // what a language model "thinks" in: tokens, tensors, and a few creative calls
  var WORDS = ('attention softmax(z) embed() token logits predict weights argmax decode <eos> ' +
    'q·k 0.97 0.58 w[i] f(x) relu tensor 1024 ∂L/∂w σ(z) Σx·w ∇loss λ=0.01 lr=3e-4 √d x² O(n) ' +
    'if(x) for(i) while return => async fn() map() sort() hash() 0x1F 01001 eval() ' +
    'create() imagine() carve() render() inspire() frame++').split(' ');
  var SHORT = 'art cut be now joy aim yes'.split(' ');
  var wi = 0;
  function pickWord(maxLen) {
    for (var tries = 0; tries < WORDS.length; tries++) {
      var w = WORDS[wi++ % WORDS.length];
      if (w.length <= maxLen) return w;
    }
    var f = SHORT.filter(function (x) { return x.length <= maxLen; });
    return f.length ? f[(wi++) % f.length] : null;
  }

  function buildParticles() {
    var cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
    var s = document.createElement('canvas'); s.width = cols; s.height = rows;
    var c = s.getContext('2d');
    c.drawImage(img, view.x / cell, view.y / cell, view.w / cell, view.h / cell);
    var d = c.getImageData(0, 0, cols, rows).data;
    var sx = view.x + view.w * SEAM;
    var V = new Float32Array(cols * rows), L = new Float32Array(cols * rows), S = new Float32Array(cols * rows);
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var x = (i + 0.5) * cell, y = (j + 0.5) * cell;
      if (x > sx) continue;
      var k = (j * cols + i) * 4, R = d[k] / 255, G = d[k + 1] / 255, B = d[k + 2] / 255;
      var lum = 0.299 * R + 0.587 * G + 0.114 * B;
      L[j * cols + i] = lum;
      var dark = Math.min(1, Math.max(0, (1 - lum) * 1.4 - 0.2));
      S[j * cols + i] = dark;
      var skin = smooth(0.075, 0.15, R - B); // warm = arm, the wall is neutral
      var edge = smooth(0, 0.06, (x - view.x) / view.w) * smooth(0, 0.18, (y - view.y) / view.h) * smooth(0, 0.18, (view.y + view.h - y) / view.h);
      V[j * cols + i] = Math.min(1, Math.max(0, (skin * (0.34 + 0.66 * curve(dark)) - 0.04) * edge));
    }
    // contour: silhouette border + strong tonal edges (finger gaps, knuckles) → drawn darker, like pen lines
    var E = new Float32Array(cols * rows);
    var IN = function (a, b) { return a >= 0 && b >= 0 && a < cols && b < rows && V[b * cols + a] >= 0.1; };
    var LL = function (a, b) { a = Math.max(0, Math.min(cols - 1, a)); b = Math.max(0, Math.min(rows - 1, b)); return L[b * cols + a]; };
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      if (!IN(i, j)) continue;
      var border = !IN(i - 1, j) || !IN(i + 1, j) || !IN(i, j - 1) || !IN(i, j + 1);
      var gx = (LL(i + 1, j - 1) + 2 * LL(i + 1, j) + LL(i + 1, j + 1)) - (LL(i - 1, j - 1) + 2 * LL(i - 1, j) + LL(i - 1, j + 1));
      var gy = (LL(i - 1, j + 1) + 2 * LL(i, j + 1) + LL(i + 1, j + 1)) - (LL(i - 1, j - 1) + 2 * LL(i, j - 1) + LL(i + 1, j - 1));
      var g = Math.sqrt(gx * gx + gy * gy);
      E[j * cols + i] = border ? 1 : smooth(0.4, 0.7, g);
    }
    fs = Math.round(cell * 1.2);
    ctx.font = '500 ' + fs + 'px "JetBrains Mono", Menlo, "SF Mono", ui-monospace, monospace';
    var cw = ctx.measureText('m').width;              // monospace: every letter is this wide
    parts = []; wi = 0;
    var PALE = [228, 186, 175], DEEP = [92, 26, 22];
    function push(px, j, ch, ww, v, isWord, isEgg, isGap, e, sh) {
      e = e || 0; sh = sh === undefined ? v : sh;
      // shading from pale (lit skin) → brand red → deep (shadow); contours are deep and fully opaque
      var t = curve(sh);
      var col = isWord ? mix(RED, INK, 0.25) : e > 0.5 ? mix(RED, DEEP, 0.75) : t < 0.5 ? mix(PALE, RED, t / 0.5) : mix(RED, DEEP, (t - 0.5) / 0.5);
      var dist = (sx - px) / view.w;
      parts.push({
        x: px, y: (j + 0.5) * cell, w: ww, ch: ch, v: v, word: isWord,
        col: 'rgb(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ')',
        a: e > 0.5 ? 1 : isGap ? 0.25 : isWord ? 0.95 : 0.35 + 0.6 * curve(sh), egg: !!isEgg,
        ox: (Math.random() - 0.5) * 260, oy: (Math.random() - 0.5) * 180 - 40,
        mx: 0, my: 0,
        delay: (0.65 - Math.min(0.65, dist)) * 1100 + Math.random() * 350 + (isEgg ? 1600 : 0),
        ph: px * 0.03 + j * 0.4
      });
    }
    // Adam's arm is written with one sentence, letter by letter, row by row —
    // the line attributed to Michelangelo himself. Read it up close.
    var STREAM = 'i saw the angel in the marble and carved until i set him free \u00b7 ';
    var EGGS = [
      { text: 'you found it. say hi: t.me/foundermd', from: 0.45, to: 0.75, whole: true },
      { text: 'everything around you that you call life was made up by people that were no smarter than you', from: 0.2, to: 0.45 }
    ];
    var k = 0;
    // each easter egg goes into the widest arm row of its band (the Jobs line may wrap over two rows)
    EGGS.forEach(function (eg) {
      var bestCnt = 0; eg.row = -1;
      for (var r = Math.floor(rows * eg.from); r < rows * eg.to; r++) {
        var cnt = 0; for (var q = 0; q < cols; q++) if (V[r * cols + q] >= 0.1) cnt++;
        if (cnt > bestCnt) { bestCnt = cnt; eg.row = r; }
      }
      eg.pos = 0;
    });
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var v0 = V[j * cols + i];
        if (v0 < 0.1) continue;
        var placed = false;
        for (var ei = 0; ei < EGGS.length && !placed; ei++) {
          var eg = EGGS[ei];
          if (eg.pos >= eg.text.length || (j !== eg.row && j !== eg.row + 2)) continue;
          var run = 0; while (i + run < cols && V[j * cols + i + run] >= 0.1) run++;
          var room = Math.floor(run * cell / cw) - 2;
          if (room < 12 || (eg.whole && room < eg.text.length)) continue;
          var piece = eg.text.slice(eg.pos);
          if (piece.length > room) { var cut = piece.lastIndexOf(' ', room); piece = piece.slice(0, cut > 0 ? cut : room); }
          var ex = i * cell + cw;
          for (var e = 0; e < piece.length; e++) if (piece[e] !== ' ') push(ex + e * cw, j, piece[e], cw, v0, false, true);
          eg.pos += piece.length + 1;
          i += Math.ceil((piece.length + 2) * cw / cell) - 1;
          placed = true;
        }
        if (placed) continue;
        var ch = STREAM[k++ % STREAM.length];
        // spaces keep the silhouette solid: a faint dot instead of a hole
        var ee = E[j * cols + i], sh0 = S[j * cols + i];
        // on a contour a space becomes a stroke too, so the outline never breaks
        var glyph = ch === ' ' ? (ee > 0.5 ? '\u00b7' : '\u00b7') : ch;
        push(i * cell + (cell - cw) / 2, j, glyph, cw, v0, false, false, ch === ' ' && ee <= 0.5, ee, sh0);
      }
    }
    parts.sort(function (a, b) { return a.col < b.col ? -1 : 1; });
    // assembled + the touch flash and glow have faded in (see draw)
    settleAt = 2700;
    for (var pi = 0; pi < parts.length; pi++) settleAt = Math.max(settleAt, parts[pi].delay + 900);
  }

  // a quiet editing timeline under the hands; the playhead sits exactly at the moment of creation
  function tc(sec) { var f = Math.floor((sec % 1) * 25), s2 = Math.floor(sec) % 60, m = Math.floor(sec / 60); return '00:' + (m < 10 ? '0' : '') + m + ':' + (s2 < 10 ? '0' : '') + s2 + ':' + (f < 10 ? '0' : '') + f; }
  function drawRuler(t) {
    var y = H - (W < 560 ? 18 : 26), step = W < 560 ? 16 : 22, major = 5;
    var shift = reduce ? 0 : (t * 0.006) % (step * major);   // timeline slowly scrolls
    ctx.strokeStyle = 'rgba(21,18,19,0.22)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
    ctx.font = '500 ' + (W < 560 ? 8 : 9) + 'px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillStyle = 'rgba(21,18,19,0.3)';
    ctx.beginPath();
    for (var n = -major, x = -shift - step * major; x < W + step; n++, x += step) {
      var isMajor = ((n % major) + major) % major === 0;
      ctx.moveTo(Math.round(x) + 0.5, y); ctx.lineTo(Math.round(x) + 0.5, y - (isMajor ? 8 : 4));
      if (isMajor && W >= 560) ctx.fillText(tc((n + (reduce ? 0 : Math.floor(t * 0.006 / step))) * 0.2 + 3), x + 3, y - 6);
    }
    ctx.stroke();
    // playhead
    var gx = view.x + view.w * SEAM, k = reduce ? 1 : smooth(1700, 2400, t);
    if (k > 0) {
      ctx.globalAlpha = k;
      ctx.strokeStyle = '#A4302A'; ctx.beginPath(); ctx.moveTo(Math.round(gx) + 0.5, H * 0.16); ctx.lineTo(Math.round(gx) + 0.5, y); ctx.stroke();
      ctx.fillStyle = '#A4302A'; ctx.beginPath(); ctx.moveTo(gx - 5, H * 0.16 - 7); ctx.lineTo(gx + 5, H * 0.16 - 7); ctx.lineTo(gx, H * 0.16); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function ease(x) { return 1 - Math.pow(1 - x, 3); }

  function draw(now) {
    var t = now - t0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);                        // transparent: the page background shows through
    ctx.globalAlpha = 0.34; ctx.drawImage(plaster, 0, 0, W, H); ctx.globalAlpha = 1;
    drawRuler(t);

    // fresco fades in slightly after the characters start
    ctx.globalAlpha = reduce ? 1 : smooth(200, 1300, t);
    ctx.drawImage(fresco, 0, 0, W, H);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.16 * (reduce ? 1 : smooth(600, 1900, t));
    ctx.drawImage(silhouette, 0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.font = '500 ' + fs + 'px "JetBrains Mono", Menlo, "SF Mono", ui-monospace, monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    var R2 = Math.pow(W < 560 ? 60 : 90, 2), tilt = mouse.on ? Math.max(-1, Math.min(1, (mouse.x - W * 0.5) / (W * 0.5))) * 10 : 0;
    var lastCol = '';
    moving = false;
    for (var n = 0; n < parts.length; n++) {
      var p = parts[n];
      var k = reduce ? 1 : ease(Math.min(1, Math.max(0, (t - p.delay) / 900)));
      if (k <= 0) continue;
      var x = p.x + p.ox * (1 - k), y = p.y + p.oy * (1 - k);
      if (!reduce && k >= 1) y += Math.sin(t * 0.0016 - p.ph) * 0.9;           // ripple, very soft
      // cursor: push characters away, spring back
      var tx = 0, ty = 0;
      if (mouse.on) {
        var dx = x + p.w / 2 - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) { var f = 1 - d2 / R2, dd = Math.sqrt(d2) || 1; tx = dx / dd * f * f * 34; ty = dy / dd * f * f * 34; }
      }
      p.mx += (tx - p.mx) * 0.16; p.my += (ty - p.my) * 0.16;
      if (p.mx * p.mx + p.my * p.my > 0.01) moving = true;
      x += p.mx + tilt * k * (1 - p.x / W); y += p.my;
      // the easter egg hides in plain sight and turns ink-black only under the cursor
      var colNow = p.col, aNow = p.a;
      if (p.egg && mouse.on) {
        var ex2 = x - mouse.x, ey2 = y - mouse.y;
        if (ex2 * ex2 + ey2 * ey2 < 140 * 140) { colNow = '#151213'; aNow = 1; }
      }
      if (colNow !== lastCol) { ctx.fillStyle = colNow; lastCol = colNow; }
      ctx.globalAlpha = aNow * k;
      ctx.fillText(p.ch, x, y);
    }
    ctx.globalAlpha = 1;

    // the touch: a red spark between the fingers once Adam's hand is assembled
    if (!reduce) {
      var touch = 1900, f2 = t < touch ? 0 : Math.max(0, 1 - Math.abs(t - touch - 380) / 380);
      var glow = 0.14 + 0.06 * Math.sin(t * 0.002);
      var a = t < touch ? 0 : Math.max(f2 * 0.55, smooth(touch, touch + 800, t) * glow);
      if (a > 0.005) {
        var gx = view.x + view.w * SEAM, gy = view.y + view.h * 0.485, rr = Math.max(40, view.w * 0.05) * (1 + f2 * 1.2);
        var g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr);
        g.addColorStop(0, 'rgba(200,55,45,' + a + ')'); g.addColorStop(1, 'rgba(200,55,45,0)');
        ctx.fillStyle = g; ctx.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
      }
      // film grain
      ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = ctx.createPattern(grain, 'repeat');
      ctx.save(); ctx.translate((Math.random() * 128) | 0, (Math.random() * 128) | 0);
      ctx.fillRect(-128, -128, W + 256, H + 256); ctx.restore();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  }

  var last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps
    last = now;
    draw(now);
    // at rest the last frame stays on the canvas and the CPU sleeps; a pointer wakes it up
    if (!mouse.on && !moving && now - t0 > settleAt && now - lastInput > 1200) stop();
  }
  function start() { if (running || reduce || !ready || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function init() {
    layout();
    t0 = performance.now();
    ready = true;
    root.classList.add('is-ready');
    if (reduce) { draw(t0 + 5000); return; }
    start();
  }

  function onPointer(e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
    lastInput = performance.now(); start();
  }
  function onLeave() { mouse.on = false; lastInput = performance.now(); start(); } // let the letters spring back, then sleep
  root.addEventListener('pointermove', onPointer);
  root.addEventListener('pointerdown', onPointer);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointercancel', onLeave); // iOS: a vertical swipe turns into a scroll

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (!ready) return;
      // iOS fires resize when the URL bar shows/hides; the hero's size doesn't change, so don't rebuild
      var r = root.getBoundingClientRect();
      if (Math.round(r.width) === W && Math.round(r.height) === H && Math.min(2, window.devicePixelRatio || 1) === dpr) return;
      layout();
      if (reduce) draw(t0 + 5000); else start();
    }, 150);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(root);
  }

  try { console.log('%cmichelangelo', 'font:24px Georgia;color:#A4302A', '\n"everything around you that you call life was made up by people that were no smarter than you." — steve jobs, 1994\ncurious? we are looking for testers → https://t.me/foundermd'); } catch (e) {}

  // Safari loads a web font only once something uses it, and fonts.ready doesn't wait for canvas text:
  // ask for the mono face explicitly so measureText() gets JetBrains Mono, not the fallback
  var go = function () {
    var f = document.fonts;
    (f && f.load ? Promise.all([f.load('500 12px "JetBrains Mono"', 'i saw·'), f.ready]) : Promise.resolve())
      .then(init, init);
  };
  if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go);
})();
