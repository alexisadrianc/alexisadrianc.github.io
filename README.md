# Alexis Cabrera — Todo empieza a conectar

Publicación preparada para GitHub Pages en `alexisadrianc/alexisadrianc.github.io`. Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para la configuración de Pages, el build de producción y la URL prevista. Genera `dist/` con `npm run build` y compruébalo con `npm run verify:production`.

Prototipo local de portfolio en español, inglés y francés. HTML semántico, CSS y JavaScript nativos, sin compilación. Lenis 1.3.29 aporta scroll suave y se sirve desde `assets/vendor/`. Requiere Node.js 20 o superior.

```sh
npm run dev
```

Abre http://127.0.0.1:4173. Para las comprobaciones:

```sh
npm run check
```

## Recorrido

Portada editorial → piezas de una operación → exploración por problemas → caso 3CX/Odoo → trayectoria y contacto.

El botón de conexión alinea pedido, inventario y factura y revela una visión compartida. Las tres situaciones cambian el área de demostración: reportes con mes y acumulado, evento externo con cuatro pasos y adaptación de reglas entre esquemas. Todos sus datos son ficticios y están rotulados como tales.

El caso corresponde a la experiencia de Maubius descrita en el CV. Los detalles de arquitectura no documentados se omiten. No se añadieron métricas, clientes ni testimonios. La trayectoria es una selección del CV; el PDF completo está disponible para descargar.

## Identidad y movimiento

Paleta: petr?leo `#29434F` y papel `#F2F0E9` como base, verde `#40998E` para conexiones, mostaza `#E5C572` para datos y coral `#DE7059` para acciones y selecci?n. `palette.css` centraliza los tonos y las superficies de ambos temas. Los textos peque?os usan petr?leo/papel; los acentos aparecen en bordes, indicadores y recorridos. Los logos oficiales conservan sus colores originales. Poppins 400 para titulares y párrafos, con acentos en 500. Geist Mono 400 para navegación, categorías y metadatos; 500 para botones destacados, cifras y valores de las demostraciones. Los cuatro archivos WOFF2 se sirven localmente con `font-display: swap`; los pesos 400 se precargan. Los subconjuntos latinos cubren el contenido actual en español. Las licencias se conservan en `assets/fonts/`. Para regenerar los archivos desde las dependencias fijadas: `npm ci --ignore-scripts` y `npm run sync:fonts`.

Los tres archivos de marca proporcionados se conservan sin alterar: `assets/monogram.png` para el encabezado, `assets/favicon.png` para la pestaña y `assets/avatar.png` para la trayectoria. `brand.css` ajusta la ventana visible del logo para omitir sus márgenes transparentes sin redibujar el trazo. En pestañas con tema oscuro, el favicon usa la variante blanca sobre azul para mantener el contraste. Esa misma variante se declara como icono táctil. La lámina inicial permanece en `assets/monogram-reference.png` como referencia.

Una curva `cubic-bezier(.22,1,.36,1)` coordina respuestas de 420–1000 ms. La línea explica la relación entre piezas y el caso usa View Transitions cuando están disponibles. En navegadores sin esa API la apertura es inmediata. No hay scroll secuestrado, audio, loaders ni recursos remotos.

La gráfica de reportes usa Chart.js 4.6.2, con barras agrupadas para resultado mensual y acumulado, tooltips en CAD y escala fija de 0 a 50 000 para facilitar la comparación entre meses. Los meses posteriores al seleccionado se omiten mediante valores `null`. Los datos también se ofrecen como tabla HTML accesible. Chart.js se carga localmente de forma diferida, la instancia se destruye al abandonar la demo y sus animaciones se detienen fuera de pantalla o al ocultar la pestaña. Movimiento reducido elimina la animación de la gráfica. Su bundle y licencia MIT están en `assets/vendor/`; para regenerarlos: `npm run sync:chartjs`.

Lenis suaviza la rueda con `lerp: 0.09`; el tacto mantiene su inercia nativa. Su único ciclo requestAnimationFrame se pausa al ocultar la pestaña y al abrir el caso. El diálogo tiene scroll nativo independiente mediante `data-lenis-prevent`. Al cerrar, se restaura la posición inmediatamente y se reactiva Lenis. Al activar movimiento reducido, la instancia se destruye; al desactivarlo, se recrea. Las anclas conservan hash y foco de teclado. Si falla la carga de Lenis, el contenido y el scroll nativo siguen disponibles.

El módulo, CSS y licencia MIT oficiales están versionados en `assets/vendor/`, por lo que `npm run dev` no necesita conexión a una CDN. Para regenerarlos desde la dependencia fijada en el lockfile: `npm ci --ignore-scripts` y `npm run sync:lenis`.

El caso utiliza un `dialog` nativo: foco inicial en cerrar, contención de teclado, Escape, recuperación del foco y posición de lectura. `prefers-reduced-motion` elimina las animaciones y el desplazamiento suave. Los controles funcionan con clic, tacto y teclado.

La experiencia profesional usa botones con `aria-expanded`/`aria-controls` y paneles `inert` al cerrarse. Web Animations anima la altura real, opacidad y desplazamiento de 8 px durante 500 ms, con la misma curva del sitio. Los dos trazos del icono se animan junto al panel; los clics rápidos retoman el estado visual actual. Los paneles abiertos vuelven a `height:auto` y un ResizeObserver adapta las medidas al reflujo. Otro aviso del mismo observer actualiza `Lenis.dimensions.resize()` sin reiniciar su objetivo de scroll ni añadir un RAF. Solo se corrige la posición si la cabecera seleccionada queda fuera del área visible. Enter/Espacio activan los botones; flechas, Inicio y Fin permiten navegar entre ellos.

El selector de problemas enlaza las demos con una salida de 120 ms y una entrada de 400 ms, acompañadas de una transición de altura medida de 480 ms. La superficie oscura permanece fija; solo se desplaza el contenido interior 8 px. Los iconos usan dos trazos con transición reversible en CSS. Las selecciones rápidas descartan las actualizaciones anteriores y las dimensiones se comparten con Lenis sin otro RAF. Movimiento reducido muestra el estado final inmediatamente.

La demo de integración presenta Telefonía, Integración, Odoo y Equipo como botones dentro de una banda conectada. Usa SVG para los iconos y el logo oficial local de Odoo. Una señal recorre los conectores al avanzar o retroceder; las etapas previas muestran una marca y su estado escrito. Flechas, Inicio/Fin, Tab y activación nativa permiten recorrer los pasos. El contenido explicativo usa la transición WAAPI existente, sin autoplay. La banda pasa a vertical cuando su ancho disponible es inferior a 440 px. Movimiento reducido omite las señales y las transiciones. El contenido se limita al ejemplo conceptual solicitado, sin conexiones reales.

El hero incorpora un rastro decorativo de nueve tecnologías con recursos originales locales. Se emite por distancia recorrida (84 px), con una separación temporal mínima de 65 ms para contener movimientos muy rápidos. Un pool fijo de 12 imágenes evita el crecimiento del DOM. Cada imagen permanece en su posición y usa WAAPI para aparecer, mantenerse y desvanecerse en 1100–1300 ms, con rotación de ±8°, escala uniforme y blur de salida de 10 px. La capa se recorta dentro del hero, queda detrás del contenido, usa `pointer-events:none` y `aria-hidden`, y no cambia el cursor.

Los recursos se precargan y decodifican al detectar mouse fino con hover. Movimiento reducido, puntero táctil, arrastre y selección de texto suspenden la emisión. Salir y reentrar reinicia la referencia de posición; ocultar la pestaña o desmontar cancela las animaciones. No se añade ningún RAF ni otra instancia de Lenis. Los originales y sus fuentes se documentan en `assets/tech/README.md` y `sources.json`; JavaScript utiliza la marca comunitaria original de JSConf, no una marca oficial de ECMAScript.

## Archivos y contenido

- `index.html`: contenido editorial y caso documentado.
- `style.css`: composición responsive y sistema de movimiento.
- `typography.css`: familias locales, pesos y ajustes de composición para Poppins y Geist Mono.
- `content.js`: contenido de demos y trayectoria, datos y funciones puras.
- `app.js`: estados y comportamiento. Listeners con AbortController; sin observers ni temporizadores permanentes.
- `smooth-scroll.js`: ciclo de vida de Lenis, anclas y coordinación con el diálogo y movimiento reducido.
- `report-chart.js` y `charts.css`: configuración y ciclo de vida de Chart.js, con tabla alternativa accesible.
- `experience-accordion.js` y `experience.css`: acordeón medido, animaciones reversibles y conexión con las dimensiones de Lenis.
- `demo-transition.js` y `demo-transition.css`: transición entre las tres situaciones de negocio.
- `integration-steps.js` y `integration-steps.css`: banda de etapas, recorrido de señales y contenido de la demo de integración.
- `hero-trail.js` y `hero-trail.css`: pool, precarga y animaciones del rastro exclusivo del hero.
- `assets/Alexis-Cabrera-CV.pdf`: copia del CV proporcionado.
- `tests/data.test.mjs`: coherencia del reporte y conservación de registros durante la demo de migración.
- `tests/scroll.test.mjs`: preferencias de movimiento, pausa del ciclo, recuperación de lectura, anclas y limpieza del controlador. Usa un doble de Lenis; no sustituye una prueba en navegador.
- `tests/accordion.test.mjs`: altura medida, cambios rápidos, reflujo, foco, teclado, movimiento reducido y limpieza, con dobles de DOM/WAAPI.
- `tests/hero-trail.test.mjs`: distancia, precarga, límite de nodos, alternancia, reentrada, preferencias, selección, clipping lógico y limpieza con dobles de DOM/WAAPI.

El header usa Geist 500 a 13.5 px para el menú, con columnas laterales de igual anchura para centrarlo respecto al conjunto. En móvil se distribuye en dos filas, con botones de 44 px. Hay exactamente dos controles: tema e idioma. El botón de tema muestra la opción de destino (luna en claro y sol en oscuro); su nombre accesible y tooltip se actualizan también al cambiar idioma. Las preferencias se conservan en `ac-theme` y `ac-language`. Sin tema guardado se sigue el sistema. `theme-init.js`, ejecutado antes de las hojas de estilo, aplica el tema antes del primer paint.

El idioma inicial es inglés cuando no existe una preferencia válida guardada. Una elección previa de ES, FR o EN se conserva.

`translations.js` contiene el catálogo ES/EN/FR para el contenido editorial, el caso, las demos y la trayectoria. `i18n.js` conserva las fuentes canónicas españolas de cada nodo y atributo accesible, actualizando solo sus textos al cambiar idioma; no sustituye la estructura del hero ni sus animaciones. Un MutationObserver traduce también el contenido creado por los controles. Los textos dibujados por Chart.js usan el mismo catálogo. `content.js` expone los tres idiomas. El CV descargable conserva el PDF original en francés, identificado como tal en los tres idiomas.

El selector se maneja con botones y `menuitemradio`, foco itinerante con flechas, Inicio/Fin y cierre al seleccionar, con Escape o clic exterior. Los colores de las superficies existentes tienen una variante oscura para que los controles de tema funcionen en todo el sitio; no se modifican su distribución ni las animaciones existentes.

## Validación y límites

Consulta `QA.md`. Se trata de un prototipo evaluable, sin publicación ni cambios en GitLab. El acordeón se comprobó en Chrome de escritorio y emulación móvil de 375 × 667, con teclado y movimiento reducido. La revisión visual completa del resto del sitio y de la transición del caso sigue pendiente. No se afirma un acabado equivalente al de la referencia premiada.
