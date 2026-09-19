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

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marca de "JS activo". El CSS sólo oculta los bloques animados cuando esta
  // clase está presente, así que si este script no llega a cargarse la página
  // se ve entera igualmente.
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* modo privado o cookies bloqueadas: se ignora */ }
    return null;
  }

  /* =====================================================================
     1. Internacionalización
     ===================================================================== */
  function resolveInitialLang() {
    var fromQuery = new URLSearchParams(window.location.search).get('lang');
    if (fromQuery && LANGS.indexOf(fromQuery) !== -1) return fromQuery;

    var saved = store(STORAGE_KEY);
    if (saved && LANGS.indexOf(saved) !== -1) return saved;

    var nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (LANGS.indexOf(nav) !== -1) return nav;

    return DEFAULT_LANG;
  }

  function translate(lang) {
    var dict = DICT[lang];
    if (!dict) return;

    // Texto plano
    $$('[data-i18n]').forEach(function (el) {
      var value = dict[el.getAttribute('data-i18n')];
      if (value !== undefined) el.textContent = value;
    });

    // Texto con marcado permitido (sólo cadenas del propio diccionario)
    $$('[data-i18n-html]').forEach(function (el) {
      var value = dict[el.getAttribute('data-i18n-html')];
      if (value !== undefined) el.innerHTML = value;
    });

    // Atributos: data-i18n-attr="placeholder:form.name.ph, aria-label:a11y.menu"
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        var attr = (bits[0] || '').trim();
        var key = (bits[1] || '').trim();
        if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });

    // Metadatos del documento
    document.documentElement.lang = lang;
    if (dict['meta.title']) document.title = dict['meta.title'];

    var ogLocale = $('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', { ca: 'ca_ES', es: 'es_ES', en: 'en_GB' }[lang]);

    // Estado de los botones del selector
    $$('.lang__btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    translate(lang);
    store(STORAGE_KEY, lang);
  }

  $$('.lang__btn').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
  });

  $$('[data-lang-link]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      ev.preventDefault();
      setLang(link.getAttribute('data-lang-link'));
    });
  });

  translate(resolveInitialLang());

  /* =====================================================================
     2. Header: estado al hacer scroll
     ===================================================================== */
  var header = $('#header');

  function syncHeader() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 12);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* =====================================================================
     3. Menú móvil
     ===================================================================== */
  var burger = $('#burger');
  var drawer = $('#drawer');

  if (drawer) drawer.removeAttribute('hidden'); // visible sólo vía CSS a partir de aquí

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var willOpen = burger.getAttribute('aria-expanded') !== 'true';
      drawer.classList.toggle('is-open', willOpen);
      burger.setAttribute('aria-expanded', String(willOpen));
      document.body.classList.toggle('is-locked', willOpen);
    });

    $$('.drawer__link, .drawer__foot a', drawer).forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeDrawer();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1000) closeDrawer();
    });
  }

  /* =====================================================================
     4. Animaciones de entrada
     ===================================================================== */
  var revealables = $$('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // threshold 0 + margen inferior negativo: se dispara en cuanto el borde
    // superior del elemento cruza la línea de activación. A diferencia de un
    // threshold por ratio, funciona también con bloques más altos que la
    // ventana (la escalera de niveles, la rejilla de cursos…).
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* =====================================================================
     5. Enlace activo en la navegación
     ===================================================================== */
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* =====================================================================
     6. Saludo rotatorio del hero
     ===================================================================== */
  var rotatorItems = $$('.rotator__item');

  if (rotatorItems.length > 1 && !reduceMotion) {
    var current = 0;
    setInterval(function () {
      rotatorItems[current].classList.remove('is-current');
      current = (current + 1) % rotatorItems.length;
      rotatorItems[current].classList.add('is-current');
    }, 2600);
  }

  /* =====================================================================
     7. Formulario de contacto
     ---------------------------------------------------------------------
     No hay backend: se valida en cliente y se muestra confirmación.
     Ver README → "Conectar el formulario" para enchufarlo a un servicio.
     ===================================================================== */
  var form = $('#contact-form');
  var status = $('#form-status');

  function currentDict() { return DICT[document.documentElement.lang] || DICT[DEFAULT_LANG]; }

  function showStatus(state, key) {
    if (!status) return;
    status.textContent = currentDict()[key] || '';
    status.setAttribute('data-state', state);
    status.classList.add('is-visible');
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      // ▼ PARA ACTIVAR EL ENVÍO REAL: dar un `action` al <form> en index.html y
      //   borrar la línea siguiente (o sustituirla por un fetch al endpoint).
      ev.preventDefault();

      var email = $('#f-email').value.trim();
      var valid =
        $('#f-name').value.trim().length > 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) &&
        $('#f-who').value !== '' &&
        $('#f-consent').checked;

      if (!valid) {
        showStatus('error', 'form.err');
        return;
      }

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
