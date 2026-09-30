// Menu overlay, scroll reveals, review slider, today's opening hours
(function () {
  var ov = document.getElementById('overlay'), mb = document.querySelector('.menu-btn'), cl = document.getElementById('close');
  if (ov && mb) {
    mb.addEventListener('click', function () { ov.classList.add('open'); mb.setAttribute('aria-expanded', 'true'); });
    cl.addEventListener('click', function () { ov.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); });
    ov.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { ov.classList.remove('open'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ov.classList.remove('open'); });
  }
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add('in'); });

  var s = [].slice.call(document.querySelectorAll('.slide'));
  if (s.length) {
    var i = 0, t, box = document.getElementById('slides'), num = document.getElementById('rv-n');
    function go(k) { s[i].classList.remove('on'); i = (k + s.length) % s.length; s[i].classList.add('on'); if (num) num.textContent = i + 1; }
    function start() { stop(); t = setInterval(function () { go(i + 1); }, 7000); }
    function stop() { if (t) clearInterval(t); }
    var p = document.querySelector('.slide-nav .prev'), n = document.querySelector('.slide-nav .next');
    if (p) p.onclick = function () { go(i - 1); start(); };
    if (n) n.onclick = function () { go(i + 1); start(); };
    if (box) { box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', start); }
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  }
  // Click-to-play videos: privacy-enhanced YouTube, optional start/end clip, no end screen
  var ytReady = null;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise(function (res) {
      if (window.YT && window.YT.Player) return res();
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
      var sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(sc);
    });
    return ytReady;
  }
  document.querySelectorAll('.vid-play').forEach(function (b) {
    var fig = b.parentNode;
    b.addEventListener('click', function () {
      var holder = document.createElement('div'); holder.className = 'vid-frame';
      b.replaceWith(holder);
      var target = document.createElement('div'); holder.appendChild(target);
      var st = parseFloat(b.getAttribute('data-start') || '0'), en = parseFloat(b.getAttribute('data-end') || '0');
      loadYT().then(function () {
        var timer, done = false;
        function finish(p) {
          if (done) return; done = true; clearInterval(timer);
          try { p.destroy(); } catch (e) {}
          holder.replaceWith(b); b.querySelector('.vid-label').textContent = 'Watch again';
        }
        var pv = { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, start: st || 0 };
        if (en) pv.end = en;
        var p = new YT.Player(target, {
          host: 'https://www.youtube-nocookie.com', videoId: b.getAttribute('data-vid'), playerVars: pv,
          events: {
            onReady: function (e) { e.target.playVideo(); if (en) timer = setInterval(function () { try { if (p.getCurrentTime() >= en - 0.25) finish(p); } catch (x) {} }, 200); },
            onStateChange: function (e) { if (e.data === 0) finish(p); }
          }
        });
      });
    });
  });
  // Hero slideshow: slow cross-fade between images
  var hs = [].slice.call(document.querySelectorAll('.hero-slides .hs'));
  if (hs.length > 1 && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var h = 0;
    setInterval(function () {
      if (document.hidden) return;
      hs[h].classList.remove('on'); h = (h + 1) % hs.length;
      hs[h].classList.remove('on'); void hs[h].offsetWidth; hs[h].classList.add('on');
    }, 7000);
  }
  var now; try { now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' })); } catch (e) { now = new Date(); }
  var day = now.getDay();
  document.querySelectorAll('.hours tr[data-d="' + day + '"], .hours tr[data-d="' + (day >= 1 && day <= 5 ? 'wk' : 'x') + '"]')
    .forEach(function (r) { r.classList.add('today'); });
})();
