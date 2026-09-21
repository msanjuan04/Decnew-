# DEC idiomes — sitio web

Landing de [decidiomes.com](http://decidiomes.com/), escuela de idiomas en Montornès
del Vallès. Sitio estático: HTML, CSS y JavaScript sin dependencias, sin build step
y sin framework. Se despliega copiando la carpeta a cualquier hosting.

```
index.html
assets/
  css/tokens.css     ← color, tipografía, retícula y radios (único punto de marca)
  css/styles.css     ← sistema de diseño y las 11 secciones
  js/i18n.js         ← todos los textos, en CA / ES / EN
  js/main.js         ← idioma, navegación, espiral, animaciones, formulario
  img/favicon.svg
scripts/check-i18n.js
```

## Cómo verlo en local

```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

## Estructura

Once secciones, siguiendo el brief de diseño facilitado por el cliente:

| | Sección | Notas |
|---|---|---|
| S1 | Header sticky | Logo, menú, selector CA/ES/EN, CTA, hamburguesa |
| S2 | Hero | Bloque turquesa con esquinas inferiores redondeadas, espiral, cifras y badge |
| S3 | Por qué nosotros | **4 tarjetas cóncavas en 2×2** con hueco en estrella y badge central |
| S4 | Cursos | 6 tarjetas en 3 columnas con la central escalonada |
| S5 | Cómo funciona | 4 pasos con semicírculo numerado en el borde superior |
| S6 | Prueba de nivel | Banner turquesa con espiral y la escalera de niveles A2→C2 |
| S7 | Modalidades | 3 tarjetas, la central elevada con cabecera turquesa |
| S8 | Contacto | Bloque turquesa, inputs de línea, dos espirales espejadas |
| S9 | Los espacios | 3 círculos: las siete aulas repartidas en tres espacios |
| S10 | Reseñas | 6 reseñas reales de Google, escalonadas, con avatar solapando el borde |
| S11 | Footer | Bloque turquesa con esquinas superiores redondeadas, 3 columnas |

### Las dos firmas visuales

**La espiral de tipografía cinética** aparece 4 veces (hero, banner de nivel y dos
espejadas en contacto). La genera `buildSpiral()` en `main.js`: seis anillos SVG con
`<textPath>` sobre circunferencias concéntricas, cuyo tamaño de fuente decrece hacia
el centro y que giran a velocidades distintas y en sentidos alternos — de ahí la
sensación de vórtice. El lema de cada una se pasa por el atributo `data-spiral`.

**Las 4 tarjetas cóncavas** usan una máscara radial en la esquina interior de cada
una (`.feat--tl`, `--tr`, `--bl`, `--br`): el cuarto de círculo transparente deja ver
el blanco del fondo y, entre las cuatro, el hueco dibuja la estrella de 4 puntas. En
móvil las máscaras se desactivan y quedan tarjetas normales apiladas.

---

## Color

```css
--brand:      #2bd5cc;  /* turquesa corporativo: bloques grandes, botones, badges */
--white:      #ffffff;  /* fondo de página */
--ink:        #0e1f1d;  /* casi negro: títulos y texto, también sobre el turquesa */
--tint-2:     #e6fbf9;  /* tinte muy claro: fondo de la mayoría de tarjetas */
--on-brand-2: #1c4a46;  /* texto secundario sobre turquesa */
--accent:     #c43a39;  /* rojo de acción, el de los botones de la web actual */
```

### Por qué el texto sobre el turquesa va en negro y no en blanco

El brief de referencia usa un brand **azul oscuro** (`#0142F0`) con texto **blanco**
encima: ahí funciona, da 6,91:1. El turquesa corporativo es claro, y blanco sobre él
da **1,83:1** — muy por debajo del 4,5:1 mínimo, o sea ilegible.

Por eso se invierte el rol: sobre los bloques turquesa el texto va en `--ink`
(**9,33:1**) y el secundario en `--on-brand-2` (**5,43:1**). El bloque de color
grande, que es lo que da carácter al diseño, se mantiene exactamente igual.

| Combinación | Contraste | |
|---|---|---|
| `--ink` sobre turquesa | 9,33:1 | ✓ |
| `--on-brand-2` sobre turquesa | 5,43:1 | ✓ |
| `--ink` sobre `--tint-2` | 15,85:1 | ✓ |
| Blanco sobre `--accent` | 5,24:1 | ✓ |
| ~~Blanco sobre turquesa~~ | 1,83:1 | ✗ no se usa |

**Si se cambia `--brand`, hay que recomprobar estos pares.** Un turquesa más oscuro
podría admitir texto blanco; uno más claro exigiría oscurecer `--on-brand-2`.

### Colores fuera de los tokens

Dos sitios llevan el valor escrito a mano, porque no pueden leer variables CSS:

| Fichero | Qué cambiar |
|---|---|
| `assets/img/favicon.svg` | El `fill` del `<rect>` y el `stroke` del globo |
| `index.html` | `<meta name="theme-color">` en el `<head>` |

---

## Textos e idiomas

Todo el contenido está en `assets/js/i18n.js`, en tres diccionarios (`ca`, `es`, `en`)
con las mismas claves. El HTML lleva el catalán escrito como respaldo, así que la
página se lee entera aunque el JavaScript no cargue.

El idioma se elige por orden: `?lang=es` en la URL → lo último que eligió la persona
(`localStorage`) → el idioma del navegador → catalán.

```bash
node scripts/check-i18n.js   # avisa de traducciones que falten o sobren
```

---

## Contenido pendiente de verificar

Redactado a partir de fuentes públicas. **Confirmar con la escuela antes de publicar:**

| Dónde | Qué | Estado |
|---|---|---|
| S7 Modalidades | Los tres formatos y sus contenidos | Inferidos. El "in-company" en particular hay que confirmarlo |
| S7 Modalidades | Precios | **No hay.** Dice "Consúltanos"; si se publican tarifas, el widget ya está montado |
| Contacto y footer | `info@decidiomes.com` | **Inventado.** Es la dirección más probable, pero no está confirmada |
| Todo el sitio | **Horario exacto** | Lo único que queda del encargo original. Ahora sólo se dice "de lunes a viernes, tarde" |
| Footer | Instagram y Facebook | Apuntan a `#` |
| Footer | Privacidad, aviso legal y cookies | Por redactar (obligatorio con el formulario activo) |
| S2, S4, S9 | Fotografías reales | Las zonas gráficas son composiciones CSS; el diseño las admite tal cual |
| Cabecera y pie | Logotipo | Reconstrucción en SVG. Sustituir si aparece el original vectorial |

### Sobre las reseñas

Las seis de S10 son **reales, publicadas en Google y transcritas literalmente**.
Van escritas en el idioma en que cada persona las dejó (castellano o catalán) y
**no se traducen al cambiar de idioma**: son palabras atribuidas a personas
concretas, así que traducirlas sería ponerles en la boca algo que no dijeron. Sólo
se localiza la línea de procedencia ("Reseña de Google · hace 4 años").

Se han usado únicamente las reseñas **completas**. Las que Google recorta con
"… Más" (Susana Moreno, Francisco Marquez, Sergio Fernández, jcanosoto93) quedan
fuera para no inventar el final; si se recupera el texto íntegro, entran sin más.

El agregado está verificado: **19 reseñas en Google + 2 en Facebook = 21, todas de
cinco estrellas**, que es justo la cifra del JSON-LD.

**Diferencia respecto al brief:** la sección de profesores (S9 en la referencia) se ha
resuelto como "Los espacios", porque no había nombres ni fotos de profesorado y no se
iban a inventar. El widget de 3 columnas circulares es el mismo: si llegan los datos
del equipo, se cambia el contenido y queda idéntico a la referencia.

Datos **sí verificados** con fuentes públicas: dirección, teléfono (93 568 60 77),
fundación en 1999, dirección de Cristina Sardanyés i Cayuela, los siete nombres de
aula repartidos en tres espacios, la pertenencia al GEIC y la valoración de 5,0 sobre
21 reseñas.

---

## Conectar el formulario

Ahora el formulario **valida en el navegador y confirma, pero no envía nada**. Para
que llegue el correo, lo más simple es un servicio de formularios (Formspree,
Web3Forms, Basin):

```html
<form class="form" id="contact-form" method="POST" action="https://formspree.io/f/TU_ID">
```

y quitar el `ev.preventDefault()` del bloque 7 de `assets/js/main.js`, que está
comentado indicando exactamente dónde. La escuela ya tiene un formulario propio en
`decidiomes.com/forms/informacio/`: si se sabe a dónde envía, se puede apuntar ahí.

Antes de activarlo hace falta publicar la política de privacidad: el formulario
recoge datos personales y ya incluye la casilla de consentimiento.

---

## Accesibilidad y rendimiento

- HTML semántico, un solo `h1`, jerarquía de encabezados correcta.
- Todas las combinaciones de color pasan AA (tabla arriba).
- Enlace de salto al contenido, foco visible, `aria-pressed` en el selector de idioma
  y `aria-expanded` en el menú móvil.
- El `lang` del documento y los metadatos cambian con el idioma.
- Si el JavaScript no carga, la página se ve completa: el estado oculto de las
  animaciones depende de una clase `.js` que añade el propio script.
- `prefers-reduced-motion` detiene la espiral y las animaciones de entrada.
- Sin dependencias: sólo se pide la familia Inter a Google Fonts.
- Datos estructurados `LanguageSchool` en JSON-LD para el SEO local.
