# DEC idiomes — sitio web

Rediseño del sitio de [decidiomes.com](http://decidiomes.com/), escuela de idiomas en
Montornès del Vallès. Sitio estático: HTML, CSS y JavaScript sin dependencias, sin
build step y sin framework. Se despliega copiando la carpeta a cualquier hosting.

```
index.html
assets/
  css/tokens.css     ← paleta, tipografía y escalas (único punto de marca)
  css/styles.css     ← sistema de diseño y secciones
  js/i18n.js         ← todos los textos, en CA / ES / EN
  js/main.js         ← navegación, idioma, animaciones, formulario
  img/favicon.svg
```

---

## Cómo verlo en local

Hace falta un servidor (abrir el `index.html` con doble clic también funciona, pero
el selector de idioma se comporta mejor sirviéndolo):

```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

## Cambiar los colores de marca

**Todo el color del sitio sale de cinco variables.** No hay ni un solo valor
hexadecimal en `styles.css`: los hovers, bordes, fondos suaves y estados se
derivan solos con `color-mix()`.

Editar únicamente el bloque *Brand core* de `assets/css/tokens.css`:

```css
--brand-ink:      #14364f;  /* azul corporativo: titulares, textos, header */
--brand-ink-deep: #0b2335;  /* variante oscura: footer y secciones invertidas */
--brand-accent:   #c8362f;  /* acento: botones, subrayados, detalles */
--brand-warm:     #d8a02c;  /* secundario cálido: iconos, destacados */
--brand-paper:    #f6f3ed;  /* fondo de página */
```

> ⚠️ **Los valores actuales son provisionales.** No se pudo acceder a
> decidiomes.com desde el entorno donde se construyó esto (bloqueo de red), así
> que la paleta está pendiente de sustituir por la original.

Hay **dos sitios más** con el color escrito a mano, porque no pueden leer
variables CSS:

| Fichero | Qué cambiar |
|---|---|
| `assets/img/favicon.svg` | El `fill` del `<rect>` (acento) y el del `<text>` |
| `index.html` | `<meta name="theme-color">` en el `<head>` |

---

## Cambiar textos

Todo el contenido vive en `assets/js/i18n.js`, en tres diccionarios (`ca`, `es`, `en`)
con las mismas claves. El HTML lleva el catalán escrito como respaldo, de modo que
la página se lee entera aunque el JavaScript no cargue.

Para cambiar una frase, buscar su clave y editarla en los tres idiomas. El marcado
no se toca.

```js
"hero.title.a": "Parla'l",
"hero.title.b": "de veritat.",
```

El idioma se elige así, por orden: `?lang=es` en la URL → lo último que eligió la
persona (`localStorage`) → el idioma del navegador → catalán.

### Comprobar que no falta ninguna traducción

```bash
node scripts/check-i18n.js
```

Avisa de claves usadas en el HTML que falten en algún idioma, de claves
descompensadas entre diccionarios y de claves que ya no use nadie.

---

## Contenido pendiente de verificar

Esto se redactó a partir de fuentes públicas y **hay que confirmarlo con la escuela
antes de publicar**:

| Dónde | Qué | Estado |
|---|---|---|
| Contacto y footer | `info@decidiomes.com` | **Inventado.** Es la dirección más probable, pero no está confirmada |
| Contacto | «De dilluns a divendres, tardes» | Falta el horario exacto |
| Reseñas | Los tres testimonios | **Textos de muestra.** Sustituir por reseñas reales de Google |
| Footer | Enlaces de Instagram y Facebook | Apuntan a `#` |
| Footer | Aviso legal, privacidad y cookies | Páginas por redactar (obligatorio con el formulario activo) |
| Qui som | Retrato de dirección | Ahora hay una placa con las iniciales; sustituir por fotografía |
| Todo el sitio | Fotografías reales de aulas y actividades | El diseño funciona sin ellas, pero ganaría mucho |

Datos que **sí** están verificados con fuentes públicas: dirección, teléfono
(93 568 60 77), fundación en 1999, dirección de Cristina Sardanyés i Cayuela,
licenciatura en Filología Anglogermánica por la UAB en 1994, los siete nombres de
aula, la pertenencia al GEIC y la valoración de 5,0 sobre 21 reseñas.

---

## Conectar el formulario

Ahora mismo el formulario **valida en el navegador y muestra confirmación, pero no
envía nada**. Para que llegue el correo, la opción más simple es un servicio de
formularios (Formspree, Web3Forms, Basin) — basta con darle un `action`:

```html
<form class="form" id="contact-form" method="POST"
      action="https://formspree.io/f/TU_ID">
```

y quitar el `ev.preventDefault()` del bloque 7 de `assets/js/main.js`, o dejarlo y
hacer el envío con `fetch`. El bloque está comentado indicando exactamente dónde.

Antes de activarlo hace falta publicar la política de privacidad: el formulario
recoge datos personales y ya incluye la casilla de consentimiento.

---

## Decisiones de diseño

- **Tipografía.** Fraunces (serif variable, con ejes ópticos) para titulares y
  cifras; Inter para interfaz y texto corrido. El contraste serif/grotesca es lo
  que da el aire editorial en lugar de aire de plantilla.
- **Retícula.** Cabeceras de sección numeradas (`01 — Cursos`) con el titular a la
  izquierda y la entradilla a la derecha, repetido en las ocho secciones.
- **Color.** Se alternan fondo papel, fondo hundido y dos secciones invertidas
  (Exámenes y Contacto) para marcar ritmo sin recurrir a más colores.
- **Sin imágenes de stock.** Las zonas gráficas son composiciones CSS. Es
  preferible a fotos genéricas, y deja el hueco listo para las fotos reales.
- **Movimiento.** Entradas por `IntersectionObserver` y una marquesina. Todo se
  desactiva con `prefers-reduced-motion`.

## Accesibilidad y rendimiento

- HTML semántico, un solo `h1`, jerarquía de encabezados correcta.
- Enlace de salto al contenido, foco visible en todo elemento interactivo,
  `aria-pressed` en el selector de idioma y `aria-expanded` en el menú móvil.
- `lang` del documento cambia con el idioma; los metadatos también.
- Si el JavaScript no carga, la página se ve completa (el estado oculto de las
  animaciones depende de una clase `.js` que añade el propio script).
- Sin dependencias: sólo se piden las dos familias tipográficas a Google Fonts.
- Datos estructurados `LanguageSchool` en JSON-LD para el SEO local.
