/* History Time Travel — site scripts */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Loading screen ---------- */
  (function () {
    var loader = $('#loader');
    if (!loader) return;
    var icons = $$('.loader-icons svg', loader);
    var start = Date.now(), minTime = reduce ? 0 : 1500, i = 0, timer;
    function light() { if (i < icons.length) { icons[i++].classList.add('lit'); } }
    if (!reduce) { timer = setInterval(light, 230); } else { icons.forEach(function (s) { s.classList.add('lit'); }); }
    function finish() {
      clearInterval(timer);
      icons.forEach(function (s) { s.classList.add('lit'); });
      loader.classList.add('done');
      document.body.classList.remove('is-loading');
    }
    function whenReady() { setTimeout(finish, Math.max(0, minTime - (Date.now() - start))); }
    if (document.readyState === 'complete') whenReady(); else window.addEventListener('load', whenReady);
    setTimeout(finish, 6000); // never block the page for long
    loader.addEventListener('click', finish);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !loader.classList.contains('done')) finish(); });
  })();

  /* ---------- Header: solid on scroll, active section ---------- */
  var header = $('#header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navLinks = $$('.main-nav a, .dock-panel a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuBtn'), mobileNav = $('#mobileNav');
  menuBtn.addEventListener('click', function () {
    var open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('a', mobileNav).forEach(function (a) { a.addEventListener('click', function () { mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- Side dock ---------- */
  var dock = $('#dock'), dockTab = $('#dockTab');
  function setDock(open) { dock.classList.toggle('open', open); dockTab.setAttribute('aria-expanded', open); dockTab.setAttribute('aria-label', open ? 'Hide quick links' : 'Show quick links'); }
  setDock(window.innerWidth >= 1600);
  dockTab.addEventListener('click', function () { setDock(!dock.classList.contains('open')); });

  /* ---------- Hero: "Tap anywhere to start" ---------- */
  var heroArt = $('#heroArt');
  function start() { $('#game').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  heroArt.addEventListener('click', start);
  heroArt.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } });

  /* ---------- Carousel ---------- */
  (function () {
    var car = $('#carousel'); if (!car) return;
    var slides = $$('.car-slide', car);
    slides.forEach(function (s) { var im = $('img', s), f = im.cloneNode(); f.className = 'fill'; f.alt = ''; f.setAttribute('aria-hidden', 'true'); s.insertBefore(f, im); });
    var dotsBox = $('.car-dots', car), idx = 0, auto;
    var dots = slides.map(function (s, n) {
      var b = document.createElement('button');
      b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Screen ' + (n + 1));
      b.addEventListener('click', function () { go(n); restart(); });
      dotsBox.appendChild(b); return b;
    });
    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === idx ? 'true' : 'false'); });
    }
    function restart() { clearInterval(auto); if (!reduce) auto = setInterval(function () { go(idx + 1); }, 5000); }
    $('.car-btn.prev', car).addEventListener('click', function () { go(idx - 1); restart(); });
    $('.car-btn.next', car).addEventListener('click', function () { go(idx + 1); restart(); });
    car.addEventListener('mouseenter', function () { clearInterval(auto); });
    car.addEventListener('mouseleave', restart);
    go(0); restart();
  })();

  /* ---------- Story / Play / Learn tabs ---------- */
  var infoTabs = $$('.info-tabs [role="tab"]');
  infoTabs.forEach(function (t) {
    t.addEventListener('click', function () {
      infoTabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });

  /* ---------- Book strips ---------- */
  $$('.strip-head').forEach(function (h) {
    h.addEventListener('click', function () {
      var strip = h.parentNode, open = !strip.classList.contains('open');
      strip.classList.toggle('open', open);
      h.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- Gallery filter + lightbox ---------- */
  var tabs = $$('.tab'), cards = $$('#grid .card');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      var f = t.dataset.f;
      cards.forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.c === f); });
    });
  });
  var lb = $('#lb'), lbImg = $('img', lb), lbCap = $('.cap', lb), cur = 0;
  function visible() { return cards.filter(function (c) { return !c.hidden; }); }
  function show(k) {
    var v = visible(); cur = (k + v.length) % v.length;
    var c = v[cur], im = $('img', c);
    lbImg.src = im.src; lbImg.alt = im.alt; lbCap.innerHTML = $('.cap', c).innerHTML;
  }
  cards.forEach(function (c) { c.addEventListener('click', function () { show(visible().indexOf(c)); lb.classList.add('open'); $('.x', lb).focus(); }); });
  function closeLb() { lb.classList.remove('open'); }
  $('.x', lb).addEventListener('click', closeLb);
  $('.prev', lb).addEventListener('click', function () { show(cur - 1); });
  $('.next', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
