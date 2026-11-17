/* Home page hero: each photo starts in black and white, then six colours are painted in
   from the centre one at a time. Each colour's name appears near the middle and is ticked
   when that colour is complete. The headline rotates through the colour phrases. */
(function () {
  var hero = document.querySelector('.cbc-hero');
  if (!hero) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = hero.querySelector('canvas.cbc'), box = hero.querySelector('.cbc-names'), head = hero.querySelector('.cbc-h');
  var imgs = [].slice.call(hero.querySelectorAll('.hero-slides .hs'));
  if (!cv || !cv.getContext || !imgs.length) return;
  var ctx = cv.getContext('2d', { willReadFrequently: true });
  var B = [
    { h: 0, c: '#e0484f', n: 'Ruby' }, { h: 30, c: '#ef8a32', n: 'Amber' }, { h: 55, c: '#e8c63e', n: 'Gold' },
    { h: 130, c: '#4cbf7a', n: 'Emerald' }, { h: 210, c: '#4a8ae0', n: 'Sapphire' }, { h: 310, c: '#d860a8', n: 'Rose' }
  ];
  var PH = ['Better looking in colour.', 'See yourself in colour.', 'A frame for every colour.', 'Colour, perfectly in focus.', 'Joy in colour.'];
  var GAP = 1900, SPREAD = 2700, START = 2000, REST = 7000;
  var pi = 0, ph = 0, gen = 0, raf = 0, tmr = [], slots = [], lastW = 0;
  var W, H, N, grey, cR, cG, cB, b1, b2, wt, dist, out;

  function later(fn, ms) { tmr.push(setTimeout(fn, ms)); }
  function clearAll() { tmr.forEach(clearTimeout); tmr = []; cancelAnimationFrame(raf); }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function setHead(i) {
    head.style.opacity = 0;
    setTimeout(function () { head.innerHTML = esc(PH[i]).replace(/(colour)/i, '<span class="rainbow">$1</span>'); head.style.opacity = 1; }, 350);
  }
  function ready(img) { return img.complete && img.naturalWidth > 0; }

  function prep(img) {
    var r = hero.getBoundingClientRect(), sc = Math.min(1, 1200 / r.width);
    W = Math.max(2, Math.round(r.width * sc)); H = Math.max(2, Math.round(r.height * sc)); N = W * H; lastW = r.width;
    cv.width = W; cv.height = H;
    var pos = (img.getAttribute('data-pos') || '50 50').split(' ').map(function (v) { return +v / 100; });
    var ir = img.naturalWidth / img.naturalHeight, cr = W / H, sw, sh, sx, sy;
    if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) * pos[0]; sy = 0; }
    else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) * pos[1]; }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    var p = ctx.getImageData(0, 0, W, H).data;
    grey = new Uint8ClampedArray(N); cR = new Uint8ClampedArray(N); cG = new Uint8ClampedArray(N); cB = new Uint8ClampedArray(N);
    b1 = new Uint8Array(N); b2 = new Uint8Array(N); wt = new Float32Array(N); dist = new Float32Array(N);
    var cx = W / 2, cy = H / 2, M = Math.hypot(cx, cy);
    for (var k = 0, j = 0; k < N; k++, j += 4) {
      var R = p[j], G = p[j + 1], Bl = p[j + 2]; cR[k] = R; cG[k] = G; cB[k] = Bl;
      var L = 0.3 * R + 0.59 * G + 0.11 * Bl; grey[k] = (L - 128) * 1.06 + 124;
      var mx = Math.max(R, G, Bl), mn = Math.min(R, G, Bl), d = mx - mn, h = 0;
      if (d > 0) { if (mx === R) h = ((G - Bl) / d) % 6; else if (mx === G) h = (Bl - R) / d + 2; else h = (R - G) / d + 4; h *= 60; if (h < 0) h += 360; }
      var a = B.length - 1, bb = 0;
      for (var q = 0; q < B.length - 1; q++) { if (h >= B[q].h && h < B[q + 1].h) { a = q; bb = q + 1; break; } }
      var h0 = B[a].h, h1 = bb ? B[bb].h : 360, span = (h1 - h0 + 360) % 360 || 360;
      b1[k] = a; b2[k] = bb; wt[k] = ((h - h0 + 360) % 360) / span;
      dist[k] = Math.hypot(k % W - cx, ((k / W) | 0) - cy) / M;
    }
    out = ctx.createImageData(W, H); var o = out.data; for (var m = 3; m < o.length; m += 4) o[m] = 255;
  }
  function render(prog) {
    var o = out.data, f = 0.28;
    for (var k = 0, j = 0; k < N; k++, j += 4) {
      var dd = dist[k], p1 = (prog[b1[k]] * (1 + f) - dd) / f, p2 = (prog[b2[k]] * (1 + f) - dd) / f;
      p1 = p1 < 0 ? 0 : p1 > 1 ? 1 : p1; p2 = p2 < 0 ? 0 : p2 > 1 ? 1 : p2;
      var w = p1 * (1 - wt[k]) + p2 * wt[k], g = grey[k];
      o[j] = g + (cR[k] - g) * w; o[j + 1] = g + (cG[k] - g) * w; o[j + 2] = g + (cB[k] - g) * w;
    }
    ctx.putImageData(out, 0, 0);
  }
  function makeSlots() {
    // keep the names in the clear space between the menu and the headline
    var hr = hero.getBoundingClientRect(), wr = hero.querySelector('.wrap').getBoundingClientRect(), Hh = hr.height, Ww = hr.width;
    var top = Math.min(110, Hh * 0.16), bot = Math.max(top + 60, wr.top - hr.top - 18), band = bot - top, arr = [], k;
    if (band < Hh * 0.4 || Ww < 600) { // small screens: two loose rows of three
      for (k = 0; k < B.length; k++) {
        var col = k % 3, row = (k / 3) | 0;
        arr.push([18 + col * 32 + (Math.random() - .5) * 8, (top + band * (row ? 0.72 : 0.28) + (Math.random() - .5) * band * 0.12) / Hh * 100]);
      }
    } else { // larger screens: a loose ring round the middle of the clear space
      var cy = (top + bot) / 2 / Hh * 100, ry = band * 0.34 / Hh * 100, rx = 26, off = Math.random() * Math.PI * 2;
      for (k = 0; k < B.length; k++) { var a = off + k * Math.PI * 2 / B.length + (Math.random() - .5) * 0.25, rr = 0.9 + Math.random() * 0.15; arr.push([50 + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr]); }
    }
    for (var m = arr.length - 1; m > 0; m--) { var j = Math.floor(Math.random() * (m + 1)), t = arr[m]; arr[m] = arr[j]; arr[j] = t; }
    slots = arr; box.textContent = ''; box.classList.remove('out');
  }
  var NS = 'http://www.w3.org/2000/svg';
  function showName(i) {
    var el = document.createElement('div'); el.className = 'cbc-name'; el.style.color = B[i].c; el.style.left = slots[i][0] + '%'; el.style.top = slots[i][1] + '%';
    var t = document.createElement('span'); t.textContent = B[i].n;
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24');
    var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '10.5');
    var p = document.createElementNS(NS, 'path'); p.setAttribute('d', 'M7 12.5l3.2 3.2L17 8.8'); svg.appendChild(c); svg.appendChild(p);
    el.appendChild(t); el.appendChild(svg); box.appendChild(el);
    void el.offsetWidth; el.classList.add('show');
    later(function () { el.classList.add('ticked'); }, Math.round(SPREAD * 0.75));
  }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function run() {
    clearAll(); var my = ++gen, img = imgs[pi];
    if (!ready(img)) { img.addEventListener('load', run, { once: true }); return; }
    prep(img); makeSlots();
    var prog = B.map(function () { return 0; });
    render(prog);
    cv.classList.remove('drift'); void cv.offsetWidth; cv.classList.add('on', 'drift');
    var t0 = performance.now() + START;
    B.forEach(function (_, i) { later(function () { if (my === gen) showName(i); }, START + i * GAP); });
    (function step(now) {
      if (my !== gen) return; var done = true;
      for (var i = 0; i < B.length; i++) { var t = (now - (t0 + i * GAP)) / SPREAD; t = t < 0 ? 0 : t > 1 ? 1 : t; prog[i] = ease(t); if (t < 1) done = false; }
      if (!document.hidden) render(prog);
      if (!done) raf = requestAnimationFrame(step);
    })(performance.now());
    later(function () {
      if (my !== gen) return;
      var nx = (pi + 1) % imgs.length; imgs[pi].classList.remove('on'); imgs[nx].classList.add('on');
      cv.classList.remove('on'); box.classList.add('out');
      later(function () { if (my !== gen) return; pi = nx; ph = (ph + 1) % PH.length; setHead(ph); run(); }, 900);
    }, START + (B.length - 1) * GAP + SPREAD + REST);
  }
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(hero.getBoundingClientRect().width - lastW) > 40) run(); }, 300); });
  run();
})();
