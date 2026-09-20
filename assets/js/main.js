/* =========================================================================
   DEC idiomes — Comportamiento
   Vanilla JS, sin dependencias, sin build step.
   ========================================================================= */
(function () {
  'use strict';

  var DICT = window.DEC_I18N || {};
  var LANGS = ['ca', 'es', 'en'];
  var DEFAULT_LANG = 'ca';
  var STORAGE_KEY = 'dec-lang';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // El CSS sólo oculta los bloques animados si esta clase está presente, así
  // que si este script no llega a cargarse la página se ve entera igualmente.
  document.documentElement.classList.add('js');

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* modo privado o cookies bloqueadas */ }
    return null;
  }

  /* =====================================================================
     1. Internacionalización
     ===================================================================== */
  function resolveInitialLang() {
    var q = new URLSearchParams(window.location.search).get('lang');
    if (q && LANGS.indexOf(q) !== -1) return q;

    var saved = store(STORAGE_KEY);
    if (saved && LANGS.indexOf(saved) !== -1) return saved;

    var nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (LANGS.indexOf(nav) !== -1) return nav;

    return DEFAULT_LANG;
  }

  function translate(lang) {
    var dict = DICT[lang];
    if (!dict) return;

    $$('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = v;
    });

    $$('[data-i18n-html]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-html')];
      if (v !== undefined) el.innerHTML = v;
    });

    // data-i18n-attr="placeholder:form.name.ph, aria-label:a11y.menu"
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        var attr = (bits[0] || '').trim();
        var key = (bits[1] || '').trim();
        if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });

    document.documentElement.lang = lang;
    if (dict['meta.title']) document.title = dict['meta.title'];

    var og = $('meta[property="og:locale"]');
    if (og) og.setAttribute('content', { ca: 'ca_ES', es: 'es_ES', en: 'en_GB' }[lang]);

    $$('.lang__btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    translate(lang);
    store(STORAGE_KEY, lang);
  }

  $$('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  $$('[data-lang-link]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      setLang(a.getAttribute('data-lang-link'));
    });
  });

  translate(resolveInitialLang());

  /* =====================================================================
     2. Espiral de tipografía cinética
     ---------------------------------------------------------------------
     Firma visual del diseño: un lema repetido en anillos concéntricos cuyo
     tamaño decrece hacia el centro. Cada anillo gira a una velocidad algo
     distinta, lo que produce la sensación de vórtice.
     Se construye en SVG con <textPath> sobre circunferencias.
     ===================================================================== */
  var SPIRAL_RINGS = [
    // radio, tamaño de fuente, segundos por vuelta
    { r: 188, size: 30, spin: 54 },
    { r: 146, size: 25, spin: 44 },
    { r: 110, size: 20, spin: 36 },
    { r: 80,  size: 16, spin: 29 },
    { r: 56,  size: 13, spin: 23 },
    { r: 36,  size: 10, spin: 18 }
  ];

  function circlePath(r) {
    // Circunferencia dibujada con dos arcos, centrada en 200,200
    return 'M 200,200 m ' + -r + ',0 a ' + r + ',' + r + ' 0 1,1 ' + (r * 2) +
           ',0 a ' + r + ',' + r + ' 0 1,1 ' + (-r * 2) + ',0';
  }

  function buildSpiral(host, phrase) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('aria-hidden', 'true');

    var defs = document.createElementNS(SVG_NS, 'defs');
    svg.appendChild(defs);

    // Identificador único por espiral: la página contiene varias
    var uid = 'sp' + Math.random().toString(36).slice(2, 9);

    SPIRAL_RINGS.forEach(function (ring, i) {
      var pathId = uid + '-' + i;

      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('id', pathId);
      path.setAttribute('d', circlePath(ring.r));
      path.setAttribute('fill', 'none');
      defs.appendChild(path);

      // Repetir la frase las veces necesarias para cerrar la circunferencia
      var circumference = 2 * Math.PI * ring.r;
      var charWidth = ring.size * 0.62;
      var repeats = Math.max(1, Math.ceil(circumference / (phrase.length * charWidth)));

      var g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'spiral__ring' + (i % 2 ? ' spiral__ring--rev' : ''));
      g.style.setProperty('--spin', ring.spin + 's');

      var text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('font-size', ring.size);

      var tp = document.createElementNS(SVG_NS, 'textPath');
      tp.setAttribute('href', '#' + pathId);
      tp.textContent = new Array(repeats + 1).join(' ' + phrase);

      text.appendChild(tp);
      g.appendChild(text);
      svg.appendChild(g);
    });

    host.appendChild(svg);
  }

  $$('[data-spiral]').forEach(function (el) {
    buildSpiral(el, el.getAttribute('data-spiral'));
  });

  /* =====================================================================
     3. Header
     ===================================================================== */
  var header = $('#header');
  function syncHeader() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 12);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* =====================================================================
     4. Menú móvil
     ===================================================================== */
  var burger = $('#burger');
  var drawer = $('#drawer');
  if (drawer) drawer.removeAttribute('hidden');

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      drawer.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) closeDrawer(); });
  }

  /* =====================================================================
     5. Animaciones de entrada
     ===================================================================== */
  var revealables = $$('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // threshold 0 + margen inferior negativo: se dispara en cuanto el borde
    // superior cruza la línea de activación, también en bloques más altos
    // que la ventana.
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    revealables.forEach(function (el) { obs.observe(el); });
  }

  /* =====================================================================
     6. Enlace activo en la navegación
     ===================================================================== */
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* =====================================================================
     7. Formulario de contacto
     ---------------------------------------------------------------------
     No hay backend: se valida en cliente y se muestra confirmación.
     Ver README → "Conectar el formulario".
     ===================================================================== */
  var form = $('#contact-form');
  var status = $('#form-status');

  function dict() { return DICT[document.documentElement.lang] || DICT[DEFAULT_LANG]; }

  function showStatus(state, key) {
    if (!status) return;
    status.textContent = dict()[key] || '';
    status.setAttribute('data-state', state);
    status.classList.add('is-visible');
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      // ▼ PARA ACTIVAR EL ENVÍO REAL: dar un `action` al <form> en index.html
      //   y borrar la línea siguiente (o sustituirla por un fetch al endpoint).
      ev.preventDefault();

      var email = $('#f-email').value.trim();
      var ok = $('#f-name').value.trim().length > 1 &&
               /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) &&
               $('#f-who').value !== '' &&
               $('#f-consent').checked;

      if (!ok) { showStatus('error', 'form.err'); return; }

      showStatus('ok', 'form.ok');
      form.reset();
    });
  }

  /* =====================================================================
     8. Año del pie
     ===================================================================== */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
