#!/usr/bin/env node
/* =========================================================================
   Comprueba la integridad de las traducciones.
   Uso: node scripts/check-i18n.js
   Sale con código 1 si encuentra algún problema (sirve para CI).
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

global.window = {};
require(path.join(ROOT, 'assets/js/i18n.js'));

const DICT = global.window.DEC_I18N;
const LANGS = Object.keys(DICT);
const MASTER = 'ca';

// Claves que usa main.js directamente y que por tanto no aparecen en el HTML
const USED_BY_JS = ['form.ok', 'form.err'];

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const used = new Set(USED_BY_JS);
for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
  m[1].split(',').forEach((pair) => {
    const key = pair.split(':')[1];
    if (key) used.add(key.trim());
  });
}

let problems = 0;
const fail = (msg) => { console.error(msg); problems++; };

// 1. Toda clave usada existe en los tres idiomas
for (const key of [...used].sort()) {
  const missing = LANGS.filter((l) => DICT[l][key] === undefined);
  if (missing.length) fail(`FALTA    ${key} → no está en: ${missing.join(', ')}`);
}

// 2. Los diccionarios están compensados entre sí
const masterKeys = new Set(Object.keys(DICT[MASTER]));
for (const lang of LANGS.filter((l) => l !== MASTER)) {
  for (const k of masterKeys) {
    if (DICT[lang][k] === undefined) fail(`PARIDAD  ${k} falta en "${lang}"`);
  }
  for (const k of Object.keys(DICT[lang])) {
    if (!masterKeys.has(k)) fail(`PARIDAD  ${k} sobra en "${lang}" (no está en "${MASTER}")`);
  }
}

// 3. Claves que ya no usa nadie (aviso, no error)
const orphans = [...masterKeys].filter((k) => !used.has(k));

console.log(`Claves usadas       : ${used.size}`);
console.log(`Claves definidas    : ${masterKeys.size} × ${LANGS.length} idiomas (${LANGS.join(', ')})`);
if (orphans.length) console.log(`Sin usar (revisar)  : ${orphans.join(', ')}`);

console.log(problems === 0 ? '\n✓ Traducciones correctas' : `\n✗ ${problems} problema(s)`);
process.exit(problems === 0 ? 0 : 1);
