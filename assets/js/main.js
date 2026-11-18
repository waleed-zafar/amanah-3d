/*!
 * Amanah Mall — "The Vertical City"
 * Rendering + interaction + GSAP motion system
 * Requires: content.js. Optional (progressive): GSAP, ScrollTrigger, SplitText, ScrollToPlugin, Lenis.
 */
(function () {
  'use strict';

  var C = window.AMANAH;
  if (!C) return;

  var doc = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mqDesktop = window.matchMedia('(min-width: 901px)');

  /* Shared state, read by scene.js (Three.js) every frame */
  var STATE = window.AMANAH_STATE = window.AMANAH_STATE || {};
  STATE.heroProgress = 0;
  STATE.ready = false;
  STATE.reduce = mqReduce.matches;
  STATE.mobile = !mqDesktop.matches;

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var emLast = function (title) {
    var w = esc(title).split(' ');
    if (w.length < 2) return '<em>' + w[0] + '</em>';
    var last = w.pop();
    return w.join(' ') + ' <em>' + last + '</em>';
  };
  var plate = function (word, label) {
    return '<div class="plate"><div class="plate__grid"></div>' +
      (label ? '<span class="plate__label">' + esc(label) + '</span>' : '') +
      '<span class="plate__word">' + esc(word) + '</span></div>';
  };
  var img = function (src, alt, extra) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async"' + (extra || '') + '>';
  };

  /* ==================================================================
     1 · RENDER CONTENT  (CMS-ready: swap content.js for ACF/REST data)
     ================================================================== */
  function render() {
    // Brands — horizontal editorial index
    var bl = $('[data-brands-list]');
    if (bl) {
      bl.innerHTML = C.brands.map(function (b, i) {
        return '<li class="brand"><a href="https://amanahmall.com.pk/brands/" data-cursor="View">' +
          '<span class="brand__top"><span class="brand__idx">' + pad(i + 1) + '</span>' +
          '<span class="brand__logo">' + img(b.logo, b.name + ' logo', ' width="104" height="56"') + '</span></span>' +
          '<span class="brand__name">' + esc(b.name) + '</span></a></li>';
      }).join('');
    }

    // Directory marquee (duplicated for a seamless loop)
    var mr = $('[data-marquee-row]');
    if (mr) {
      var names = C.directory.map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('');
      mr.innerHTML = names + names;
      mr.lastElementChild && mr.querySelectorAll('span').forEach(function (s, i) {
        if (i >= C.directory.length) s.setAttribute('aria-hidden', 'true');
      });
    }

    // Beyond — sticky stage + facility list
    var stage = $('[data-beyond-stage]');
    var list = $('[data-beyond-list]');
    if (stage && list) {
      var total = C.facilities.length;
      stage.innerHTML = C.facilities.map(function (f, i) {
        return '<figure class="beyond__frame' + (i === 0 ? ' is-first is-current' : '') + '" data-frame="' + i + '">' +
          (f.image ? img(f.image, f.title) : plate(f.plate || f.title, f.title)) +
          '<figcaption>' + esc(f.kicker) + '</figcaption></figure>';
      }).join('') + '<span class="beyond__counter" data-beyond-counter>01 / ' + pad(total) + '</span>';

      list.innerHTML = C.facilities.map(function (f, i) {
        return '<li class="facility' + (i === 0 ? ' is-active' : '') + '" id="' + esc(f.id) + '" data-facility="' + i + '">' +
          '<div class="facility__media">' + (f.image ? img(f.image, f.title) : plate(f.plate || f.title, f.title)) + '</div>' +
          '<p class="facility__kicker"><span>' + pad(i + 1) + '</span><span>' + esc(f.kicker) + '</span></p>' +
          '<h3 class="facility__title">' + emLast(f.title) + '</h3>' +
          '<p class="facility__text">' + esc(f.text) + '</p>' +
          '<p class="facility__hours">' + esc(f.hours) + '</p>' +
          '<a class="link-arrow link-arrow--light" href="' + esc(f.url) + '" data-cursor="Explore">Discover ' + esc(f.title) + '</a>' +
          '</li>';
      }).join('');
    }

    // Moments collage
    var mo = $('[data-moments]');
    if (mo) {
      var speeds = [0.18, -0.12, 0.08, -0.2, 0.14];
      var html = C.moments.map(function (src, i) {
        return '<figure class="moment moment--' + (i + 1) + '" data-moment data-speed="' + speeds[i % speeds.length] + '">' +
          '<div class="img-mask">' + img(src, ['Basant festival at Amanah Mall', 'Play at Magic Planet', 'Kites over the Basant celebration', 'Rides and arcades at Magic Planet', 'Families together at Amanah'][i % 5]) + '</div></figure>';
      }).join('');
      mo.insertAdjacentHTML('afterbegin', html);
    }

    // Events
    var ev = $('[data-events]');
    if (ev) {
      ev.innerHTML = C.events.map(function (e, i) {
        return '<li class="event"><a href="' + esc(e.url) + '" data-preview="' + i + '" data-cursor="Open">' +
          '<span class="event__idx">' + pad(i + 1) + '</span>' +
          '<span class="event__title">' + esc(e.title) + '</span>' +
          '<span class="event__cat">' + esc(e.category) + '</span>' +
          '<span class="event__arrow" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 7h12M8 2l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></span>' +
          '</a></li>';
      }).join('');
    }

    var po = $('[data-posters]');
    if (po) {
      po.innerHTML = C.posters.map(function (src) {
        return '<a class="poster" href="https://amanahmall.com.pk/recent-events/" data-cursor="View" data-reveal-img>' +
          '<div class="img-mask">' + img(src, 'Event poster at Amanah Mall') + '</div></a>';
      }).join('');
    }

    // Journal
    var jo = $('[data-journal]');
    if (jo) {
      jo.innerHTML = C.journal.map(function (a, i) {
        var cls = i === 0 ? 'article--lead' : 'article--side';
        return '<article class="article ' + cls + '"><a href="' + esc(a.url) + '" data-cursor="Read">' +
          '<div class="img-mask" data-reveal-img>' + img(a.image, '') + '</div>' +
          '<p class="article__meta"><b>' + esc(a.tags.join(' · ')) + '</b><span>' + esc(a.date) + '</span></p>' +
          '<h3><span class="article__title">' + esc(a.title) + '</span></h3>' +
          (i === 0 ? '<p class="article__excerpt">' + esc(a.excerpt) + '</p>' : '') +
          '</a></article>';
      }).join('');
    }

    // Opening hours — highlight today's column (Lahore time)
    var tb = $('[data-timings]');
    var isSunday = false;
    try {
      isSunday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' }).format(new Date()) === 'Sun';
    } catch (e) { isSunday = new Date().getDay() === 0; }
    if (tb) {
      tb.innerHTML = C.timings.map(function (t) {
        return '<tr><td>' + esc(t.label) + '</td>' +
          '<td' + (!isSunday ? ' class="is-now"' : '') + '>' + esc(t.week) + '</td>' +
          '<td' + (isSunday ? ' class="is-now"' : '') + '>' + esc(t.sun) + '</td></tr>';
      }).join('');
    }
    var th = $('[data-today-hours]');
    if (th && C.timings[0]) th.textContent = 'Retail · ' + (isSunday ? C.timings[0].sun : C.timings[0].week);
  }

  /* Graceful image failure (and thumbnail fallback for WP gallery sizes) */
  function guardImages() {
    $$('img').forEach(function (el) {
      var tries = 0;
      var onErr = function () {
        var m = el.src.match(/(\/uploads\/2026\/02\/\d+)\.jpe?g$/);
        if (m && tries < 2) {
          el.src = el.src.replace(/\.jpe?g$/, tries === 0 ? '-300x300.jpeg' : '-300x202.jpeg').replace(/-300x300-300x202/, '-300x202');
          tries++;
          return;
        }
        el.classList.add('is-broken');
        // Replace a missing photo with a designed typographic plate
        var host = el.parentNode;
        if (!host || host.querySelector('.plate, .logo-text')) return;
        if (host.classList.contains('brand__logo') || el.hasAttribute('data-logo') || /logo/.test(el.className)) {
          var t = document.createElement('span');
          t.className = 'logo-text';
          t.textContent = (el.alt || 'Amanah Mall').replace(/ logo$/, '');
          host.appendChild(t);
          return;
        }
        var word = (el.alt || 'Amanah').split(/[\s—–-]+/).filter(function (w) { return w.length > 3; })[0] || 'Amanah';
        host.insertAdjacentHTML('beforeend', plate(word, el.alt || ''));
      };
      el.addEventListener('error', onErr);
      if (el.complete && el.naturalWidth === 0 && el.getAttribute('src')) onErr();
    });
  }

  /* ==================================================================
     2 · INTERACTIONS THAT WORK WITHOUT GSAP
     ================================================================== */
  function initMap() {
    var btn = $('[data-map-load]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=Amanah+Mall,+Link+Road,+Model+Town,+Lahore&output=embed';
      f.title = 'Map — Amanah Mall, Link Road, Model Town, Lahore';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      btn.replaceWith(f);
    });
  }

  var lenis = null;
  function scrollToTarget(target) {
    if (!target) return;
    if (lenis) { lenis.scrollTo(target, { duration: 1.6, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } }); return; }
    if (window.gsap && window.ScrollToPlugin) { gsap.to(window, { scrollTo: { y: target, autoKill: true }, duration: 1.4, ease: 'expo.inOut' }); return; }
    target.scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth' });
  }

  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      if (doc.classList.contains('menu-open')) closeMenu(function () { scrollToTarget(t); });
      else scrollToTarget(t);
    });
  }

  /* Menu */
  var menu, menuBtn, menuTl;
  function openMenu() {
    menu.hidden = false;
    doc.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    $('.nav__menu-label', menuBtn).textContent = 'Close';
    if (lenis) lenis.stop();
    if (window.gsap && !mqReduce.matches) {
      menuTl && menuTl.kill();
      menuTl = gsap.timeline()
        .fromTo($('.menu__bg', menu), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' })
        .fromTo($$('.menu__list a', menu), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: .05 }, '-=.35')
        .fromTo($('.menu__aside', menu), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.7');
    } else {
      $('.menu__bg', menu).style.clipPath = 'none';
    }
    var first = $('.menu__list a', menu); first && first.focus({ preventScroll: true });
  }
  function closeMenu(cb) {
    var done = function () {
      menu.hidden = true;
      doc.classList.remove('menu-open');
      if (lenis) lenis.start();
      cb && cb();
    };
    menuBtn.setAttribute('aria-expanded', 'false');
    $('.nav__menu-label', menuBtn).textContent = 'Menu';
    if (window.gsap && !mqReduce.matches) {
      menuTl && menuTl.kill();
      menuTl = gsap.timeline({ onComplete: done })
        .to($$('.menu__list a', menu), { yPercent: -110, duration: .5, ease: 'power3.in', stagger: .03 })
        .to($('.menu__aside', menu), { autoAlpha: 0, duration: .3 }, 0)
        .to($('.menu__bg', menu), { clipPath: 'inset(100% 0 0% 0)', duration: .7, ease: 'expo.inOut' }, '-=.25');
    } else done();
  }
  function initMenu() {
    menu = $('#menu'); menuBtn = $('[data-menu-toggle]');
    if (!menu || !menuBtn) return;
    menuBtn.addEventListener('click', function () {
      doc.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.classList.contains('menu-open')) { closeMenu(); menuBtn.focus(); }
    });
  }

  /* ==================================================================
     3 · MOTION SYSTEM (GSAP)
     ================================================================== */
  function noMotion() {
    doc.classList.add('is-ready', 'is-loaded', 'no-gsap');
    if (lenis) lenis.start();
    STATE.ready = true;
    window.dispatchEvent(new CustomEvent('amanah:ready'));
    // Lift readout via IntersectionObserver
    var num = $('[data-lift-num]'), name = $('[data-lift-name]'), nav = $('[data-nav]');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var s = en.target;
          num.textContent = s.dataset.chapter; name.textContent = s.dataset.chapterName;
          nav.dataset.navTheme = s.dataset.theme;
        });
      }, { rootMargin: '-45% 0px -54% 0px' });
      $$('[data-chapter]').forEach(function (s) { io.observe(s); });
    }
    window.addEventListener('scroll', function () { nav.classList.toggle('is-scrolled', window.scrollY > 40); }, { passive: true });
  }

  function initMotion() {
    var plugins = [ScrollTrigger];
    if (window.SplitText) plugins.push(SplitText);
    if (window.ScrollToPlugin) plugins.push(ScrollToPlugin);
    gsap.registerPlugin.apply(gsap, plugins);
    gsap.defaults({ ease: 'expo.out', duration: 1.2 });
    ScrollTrigger.config({ ignoreMobileResize: true });

    var reduce = mqReduce.matches;

    /* Smooth scroll — Lenis on desktop wheel only (native on touch) */
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }

    var nav = $('[data-nav]');

    /* ---------- Loader → hero entrance ---------- */
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var timeout = new Promise(function (r) { setTimeout(r, 2500); });

    var heroSplit = null;
    function heroEntrance() {
      var title = $('[data-hero-title]');
      var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      if (window.SplitText && title) {
        heroSplit = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line-inner' });
        tl.from(heroSplit.lines, { yPercent: 115, duration: 1.6, stagger: .09 }, 0);
      } else if (title) {
        tl.from(title, { autoAlpha: 0, y: 40, duration: 1.4 }, 0);
      }
      tl.from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.2, stagger: .1 }, .5)
        .from(nav, { yPercent: -100, autoAlpha: 0, duration: 1.2 }, .3);
      return tl;
    }

    function finishLoading() {
      doc.classList.add('is-ready');
      STATE.ready = true;
      window.dispatchEvent(new CustomEvent('amanah:ready'));
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    }

    if (reduce) {
      doc.classList.add('is-loaded');
      finishLoading();
    } else {
      var floors = ['B4', 'B3', 'B2', 'B1', 'G'];
      var numEl = $('[data-loader-num]');
      var bar = gsap.to('.loader__bar span', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' });
      floors.forEach(function (f, i) { gsap.delayedCall(i * .3, function () { numEl.textContent = f; }); });
      // Wait for webfonts (so SplitText measures real lines), then open the doors
      Promise.race([fontsReady, timeout]).then(function () {
        var lt = gsap.timeline({ delay: Math.max(0, bar.duration() - bar.time()), onComplete: function () { doc.classList.add('is-loaded'); } });
        lt.call(function () { numEl.textContent = 'G'; })
        .addLabel('open', '+=0.15')
        .to('.loader__inner', { autoAlpha: 0, y: -20, duration: .5, ease: 'power2.in' }, 'open')
        .to('.loader__panel--top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 'open+=.2')
        .to('.loader__panel--bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 'open+=.2')
        .call(finishLoading, null, 'open+=.55')
        .add(heroEntrance(), 'open+=.55');
      });
    }

    /* ---------- Nav: scrolled/hidden + lift readout + theme ---------- */
    var liftNum = $('[data-lift-num]'), liftName = $('[data-lift-name]'), lift = $('.nav__lift');
    var setLift = function (sec, dir) {
      if (liftNum.textContent === sec.dataset.chapter) return;
      lift.classList.toggle('is-down', dir < 0);
      gsap.timeline()
        .to([liftNum, liftName], { yPercent: dir > 0 ? -60 : 60, autoAlpha: 0, duration: .25, ease: 'power2.in' })
        .call(function () { liftNum.textContent = sec.dataset.chapter; liftName.textContent = sec.dataset.chapterName; })
        .fromTo([liftNum, liftName], { yPercent: dir > 0 ? 60 : -60 }, { yPercent: 0, autoAlpha: 1, duration: .5, ease: 'expo.out' });
    };
    $$('[data-chapter]').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 45%', end: 'bottom 45%',
        onToggle: function (self) {
          if (!self.isActive) return;
          setLift(sec, self.direction);
          nav.dataset.navTheme = sec.dataset.theme;
        }
      });
    });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        gsap.set('[data-lift-progress]', { scaleX: self.progress });
        var y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 40);
        var hideAfter = window.innerHeight * 1.2;
        nav.classList.toggle('is-hidden', self.direction > 0 && y > hideAfter && !doc.classList.contains('menu-open'));
      }
    });

    /* ---------- Responsive, context-managed animation sets ---------- */
    var mm = gsap.matchMedia();

    mm.add({
      desktop: '(min-width: 901px)',
      mobile: '(max-width: 900px)',
      reduce: '(prefers-reduced-motion: reduce)'
    }, function (ctx) {
      var c = ctx.conditions;
      STATE.mobile = c.mobile;

      /* CH01 — Arrival: sticky stage, scroll-scrubbed camera + exploded section */
      var arrival = $('.arrival');
      if (!c.reduce && c.desktop) {
        arrival.classList.add('is-pinnable');
        var htl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: arrival, start: 'top top', end: 'bottom bottom', scrub: 0.8,
            onUpdate: function (self) { STATE.heroProgress = self.progress; }
          }
        });
        htl.to('.arrival__content', { yPercent: -18, autoAlpha: 0, duration: .3 }, 0)
          .to('.scroll-cue', { autoAlpha: 0, duration: .1 }, 0)
          .set('.section-labels', { visibility: 'visible' }, .42)
          .fromTo('.section-labels li', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: .12, stagger: .07 }, .45)
          .to('.arrival__note', { autoAlpha: 1, duration: .1 }, .5)
          .to('.arrival__vignette', { opacity: .55, duration: .4 }, .3)
          .to({}, { duration: .2 }); // hold at the end
        ScrollTrigger.refresh();
      } else {
        arrival.classList.remove('is-pinnable');
        ScrollTrigger.create({
          trigger: arrival, start: 'top top', end: 'bottom top',
          onUpdate: function (self) { STATE.heroProgress = c.reduce ? 0 : self.progress * 0.35; }
        });
      }

      /* CH04 — Beyond: scroll-synchronised stage */
      if (c.desktop) {
        var frames = $$('[data-frame]'), items = $$('[data-facility]'), counter = $('[data-beyond-counter]');
        var current = 0, z = 1;
        var activate = function (i) {
          if (i === current) return;
          var dir = i > current ? 1 : -1;
          items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
          var f = frames[i], im = $('img, .plate', f);
          frames[current].classList.remove('is-current');
          f.classList.add('is-current');
          gsap.set(f, { zIndex: ++z });
          if (!c.reduce) gsap.fromTo(f, { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', overwrite: true });
          if (im && !c.reduce) gsap.fromTo(im, { scale: 1.25, yPercent: dir * 8 }, { scale: 1, yPercent: 0, duration: 1.5, ease: 'expo.out', overwrite: true });
          counter.textContent = pad(i + 1) + ' / ' + pad(items.length);
          current = i;
        };
        items.forEach(function (it, i) {
          ScrollTrigger.create({
            trigger: it, start: 'top 55%', end: 'bottom 55%',
            onToggle: function (self) { if (self.isActive) activate(i); }
          });
        });
      }

      if (c.reduce) return function () { arrival.classList.remove('is-pinnable'); };

      /* Split headings: masked line reveals */
      var splits = [];
      if (window.SplitText) {
        $$('[data-split]').forEach(function (el) {
          splits.push(SplitText.create(el, {
            type: 'lines', mask: 'lines', autoSplit: true,
            onSplit: function (self) {
              return gsap.from(self.lines, {
                yPercent: 110, duration: 1.4, stagger: .1, ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 82%', once: true }
              });
            }
          }));
        });
        $$('[data-split-lines]').forEach(function (el) {
          splits.push(SplitText.create(el, {
            type: 'lines', mask: 'lines', autoSplit: true,
            onSplit: function (self) {
              return gsap.from(self.lines, {
                yPercent: 100, duration: 1.2, stagger: .07,
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
              });
            }
          }));
        });
      }

      /* Soft rises */
      gsap.set('[data-fade]', { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch('[data-fade]', {
        start: 'top 88%', once: true,
        onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .08, overwrite: true }); }
      });

      /* Floor-plate rules draw in */
      $$('.chapter-head__rule').forEach(function (r) {
        gsap.from(r, { scaleX: 0, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 90%', once: true } });
      });

      /* Clip-path image reveals */
      $$('[data-reveal-img]').forEach(function (wrap) {
        var mask = wrap.classList.contains('img-mask') ? wrap : $('.img-mask', wrap);
        if (!mask) return;
        var im = $('img', mask);
        var tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } });
        tl.fromTo(mask, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' });
        if (im && !im.hasAttribute('data-parallax')) tl.fromTo(im, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out' }, .1);
      });

      /* Image parallax inside masks */
      $$('[data-parallax]').forEach(function (im) {
        var s = parseFloat(im.dataset.parallax) || .1;
        gsap.fromTo(im, { yPercent: -s * 50 }, {
          yPercent: s * 50, ease: 'none',
          scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      /* Stats count-up */
      $$('[data-count]').forEach(function (el) {
        var end = parseInt(el.dataset.count, 10), o = { v: 0 };
        gsap.to(o, {
          v: end, duration: end > 1000 ? 2.4 : 1.6, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-US'); }
        });
      });

      /* CH03 — Brands */
      var track = $('[data-brands-track]');
      var hTween = null;
      if (c.desktop && track) {
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
        hTween = gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: '.brands__pin', start: 'top top', end: function () { return '+=' + dist(); },
            pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
          }
        });
        $$('.brand').forEach(function (b) {
          gsap.from($('.brand__top', b), {
            yPercent: 60, rotate: -6, autoAlpha: 0, duration: 1,
            scrollTrigger: { containerAnimation: hTween, trigger: b, start: 'left 92%', toggleActions: 'play none none reverse' }
          });
          gsap.fromTo($('.brand__name', b), { xPercent: 12 }, {
            xPercent: -6, ease: 'none',
            scrollTrigger: { containerAnimation: hTween, trigger: b, start: 'left right', end: 'right left', scrub: true }
          });
        });
      }

      /* Directory marquee: speeds up with scroll velocity */
      var row = $('[data-marquee-row]');
      if (row) {
        var mq = gsap.to(row, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 });
        ScrollTrigger.create({
          trigger: '[data-marquee]', start: 'top bottom', end: 'bottom top',
          onToggle: function (self) { self.isActive ? mq.play() : mq.pause(); },
          onUpdate: function (self) {
            var v = Math.min(Math.abs(self.getVelocity()) / 300, 6);
            gsap.to(mq, { timeScale: 1 + v, duration: .3, overwrite: true, onComplete: function () { gsap.to(mq, { timeScale: 1, duration: 1.2 }); } });
          }
        });
      }

      /* CH05 — Moments: drifting collage */
      $$('[data-moment]').forEach(function (m, i) {
        var mask = $('.img-mask', m);
        gsap.fromTo(mask, { clipPath: 'inset(15% 15% 15% 15%)', autoAlpha: 0 }, {
          clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1, duration: 1.8, delay: i * .05,
          scrollTrigger: { trigger: m, start: 'top 90%', once: true }
        });
        if (c.desktop) {
          var sp = parseFloat(m.dataset.speed) || 0;
          gsap.fromTo(m, { y: function () { return -sp * window.innerHeight * .6; } }, {
            y: function () { return sp * window.innerHeight * .6; }, ease: 'none',
            scrollTrigger: { trigger: '.moments__collage', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
          });
        }
      });

      /* CH06 — Events rows */
      ScrollTrigger.batch('.event', {
        start: 'top 92%', once: true,
        onEnter: function (els) { gsap.from(els, { y: 40, autoAlpha: 0, duration: 1.1, stagger: .08 }); }
      });

      /* CH08 — Visit + footer */
      gsap.fromTo('.visit__glow', { scale: .7, yPercent: 20 }, {
        scale: 1.15, yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
      var word = $('[data-footer-word]');
      var wordSplit = null;
      if (word && window.SplitText) {
        wordSplit = SplitText.create(word, { type: 'chars', charsClass: 'char' });
        gsap.from(wordSplit.chars, {
          yPercent: 100, duration: 1.4, stagger: .06, ease: 'expo.out',
          scrollTrigger: { trigger: word, start: 'top 98%', once: true }
        });
      }

      ScrollTrigger.refresh();

      return function () {
        arrival.classList.remove('is-pinnable');
        splits.forEach(function (s) { s.revert(); });
        wordSplit && wordSplit.revert();
      };
    });

    /* ---------- Pointer layer: cursor, magnetic, hover preview ---------- */
    if (mqFine.matches && !reduce) initPointer();

    /* Keep ScrollTrigger honest after late layout changes */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function initPointer() {
    doc.classList.add('has-cursor');
    var cursor = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    var dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });

    var preview = $('.preview'), pin = $('.preview__inner');
    var px = gsap.quickTo(preview, 'x', { duration: .7, ease: 'power3' }), py = gsap.quickTo(preview, 'y', { duration: .7, ease: 'power3' });
    var pr = gsap.quickTo(preview, 'rotation', { duration: .8, ease: 'power3' });
    var lastX = 0;

    window.addEventListener('pointermove', function (e) {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      px(e.clientX); py(e.clientY);
      pr(Math.max(-8, Math.min(8, (e.clientX - lastX) * .6)));
      lastX = e.clientX;
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('a, button, [data-cursor]');
      if (!t) return;
      var l = t.getAttribute('data-cursor');
      cursor.classList.toggle('is-label', !!l);
      cursor.classList.toggle('is-hover', !l);
      label.textContent = l || '';
    });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest && e.target.closest('a, button, [data-cursor]');
      if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
      cursor.classList.remove('is-label', 'is-hover');
    });

    /* Event preview follows the cursor */
    $$('[data-preview]').forEach(function (a) {
      var ev = C.events[+a.dataset.preview];
      a.addEventListener('mouseenter', function () {
        pin.innerHTML = ev.image ? '<img src="' + esc(ev.image) + '" alt="">' : plate(ev.title.split(' ')[0], ev.category);
        gsap.to(preview, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'expo.out', overwrite: 'auto' });
        gsap.fromTo(pin, { scale: 1.3 }, { scale: 1, duration: 1, ease: 'expo.out' });
      });
      a.addEventListener('mouseleave', function () {
        gsap.to(preview, { clipPath: 'inset(50% 50% 50% 50%)', duration: .5, ease: 'expo.out', overwrite: 'auto' });
      });
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * .3);
        my((e.clientY - (r.top + r.height / 2)) * .35);
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' });
      });
    });
  }

  /* ==================================================================
     BOOT
     ================================================================== */
  render();
  guardImages();
  initMenu();
  initAnchors();
  initMap();

  if (window.gsap && window.ScrollTrigger) {
    try { initMotion(); }
    catch (err) { console.error('[Amanah] motion init failed, falling back:', err); noMotion(); }
  } else {
    noMotion();
  }
})();
