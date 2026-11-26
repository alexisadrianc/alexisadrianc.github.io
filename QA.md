# Comprobación del prototipo

## Ajuste visual según la referencia de flechas

Las etapas ahora forman una cinta de segmentos en flecha, con círculos claros superpuestos, iconos delineados y etiquetas debajo. Se usan tonos fríos contenidos y lila para la selección. Odoo muestra únicamente la primera O del SVG oficial: se encuadra mediante CSS, sin redibujar ni modificar el archivo fuente. Se conservan los estados, señales, controles y adaptación vertical existentes.

Se verificó el resultado en Chrome de escritorio: las cuatro flechas y la O aislada se mostraron correctamente. Pasaron las cuatro pruebas de las etapas. No se repitió la inspección móvil de la nueva geometría.

## Etapas de la demo de integración

Se sustituyeron C/R/O/E por teléfono, intercambio de datos, logo oficial SVG de Odoo y equipo. Los cuatro botones forman una banda continua, horizontal con espacio suficiente y vertical por debajo de 440 px de ancho disponible. Se indican los estados Actual, Completada y Pendiente además del color, con check para etapas anteriores y aria-current="step" en una sola seleccionada.

Se mantuvieron «Demostración ilustrativa» y la aclaración de simulación local. Los cuatro textos corresponden a los solicitados y están disponibles en ES/EN/FR. El cambio de contenido reutiliza createDemoTransition/WAAPI; los pulsos de los conectores se cancelan al cambiar otra vez de etapa. No hay reproducción automática ni un nuevo RAF.

Validación realizada:

- 32 pruebas pasaron. Las cuatro nuevas cubren recorridos directos y de regreso, estados de progreso, selección rápida con cancelación, último contenido solicitado, disposición vertical, teclado, movimiento reducido y limpieza.
- En Chrome de escritorio se revisó la banda, sus iconos, el estado Odoo y la navegación con End y flechas para volver a Integración. La explicación coincidió con la etapa seleccionada.
- En iPhone SE emulado (375 × 667) se comprobó la banda vertical, selección de Equipo y su texto. Home volvió a Telefonía; la captura mostró las señales durante el recorrido inverso, con las etapas posteriores pendientes.
- Se restauró escritorio y se cerró DevTools. Movimiento reducido se verificó mediante los tests del controlador; no se efectuó un nuevo perfil de rendimiento ni una revisión en dispositivo físico.

## Ajuste final de controles del header

Hay dos botones: idioma y tema de destino. En claro aparece una luna para activar oscuro; en oscuro aparece un sol para activar claro. Nombre accesible y tooltip describen la acción, sin un estado aria-pressed ambiguo. Verificado en Chrome en ambos sentidos y con las seis pruebas de header/preferencias. El selector de idioma conserva su comportamiento. Esta actualización reemplaza la distribución anterior de tres controles descrita en las comprobaciones históricas.

## Header: alineación, tema e idiomas

Se conservan el AC y el nombre a la izquierda. El menú usa Geist 500, 13.5 px (archivo local distinto de Geist Mono), centrado mediante columnas laterales simétricas. A la derecha hay botones circulares SVG para claro, oscuro e idioma. En móvil se pasa a dos filas y objetivos de 44 px. La estructura y las animaciones del hero no se cambiaron.

Para que los controles sean funcionales se incorporaron preferencias persistentes, tema antes del primer paint y traducciones completas ES/EN/FR de la copia actual. El catálogo incluye el caso, las demos, datos de meses, etiquetas de Chart.js, trayectoria, navegación y atributos accesibles. No se traduce el PDF original, que sigue identificado como francés.

Verificado en Chrome:

- Escritorio de 1920 px y 1008 px: menú centrado respecto al header, laterales sin solapamiento, sol/luna con estado visible y tema oscuro con logo legible.
- English y Français cambiaron el contenido real. Se recargó con francés y oscuro y se conservaron ambos. Se confirmó en el árbol accesible francés para la demo, el mes y la experiencia profesional.
- Vista móvil iPhone SE, 375 × 667: logo/nombre, tres controles y menú visibles sin superposición. El selector compacto permaneció dentro del viewport.
- Cierre por Escape, selección y clic exterior; navegación por teclado con Fin y Enter para volver a ES. Al terminar se restauraron español/claro y escritorio; DevTools quedó cerrado.
- Pasaron 28 pruebas en total. Las seis nuevas cubren precedencia de preferencias antes del paint y almacenamiento bloqueado, completitud del catálogo, plantillas de resultados, persistencia de tema frente al sistema y teclado/cierre del selector.

El cambio de tema se probó visualmente; no se realizó una auditoría exhaustiva de contraste de todas las combinaciones ni una revisión editorial externa de las traducciones. Las comprobaciones históricas inferiores corresponden a versiones anteriores.

## Rastro de tecnologías en el hero

Se incorporaron nueve recursos originales locales: Python, Odoo, PostgreSQL, JavaScript, Django, Docker, Git, HTML y CSS. Las URLs exactas constan en `assets/tech/sources.json`. Los SVG/PNG no se redibujaron ni recolorearon; JavaScript usa el símbolo comunitario original de JSConf. Todos respondieron HTTP 200 desde el servidor local.

El rastro emplea un pool de doce nodos, umbral de 84 px y animaciones WAAPI de 1100–1300 ms. Mantiene las imágenes ancladas a su posición de aparición, con rotación y escala sutiles, nitidez durante la permanencia y salida a blur de 10 px. Metadatos, controles y acento azul tienen zonas de protección. La capa es decorativa, se recorta al hero y carece de eventos de entrada o cursor personalizado.

Validación:

- Pasaron las 22 pruebas: las cinco nuevas verifican precarga, distancia, nodos limitados, alternancia, permanencia, salida/reentrada, movimiento reducido, dispositivo sin hover/puntero fino, arrastre, selección, protección del contenido y limpieza.
- En Chrome de escritorio, 1920 × 1032, se comprobaron emisiones sucesivas: Python y Odoo visibles simultáneamente en posiciones distintas; PostgreSQL tras salir y reentrar. Después se comprobó que los anteriores desaparecían.
- El botón del hero siguió navegando a la escena de conexión con Lenis; allí no apareció el rastro. Se volvió al hero al terminar.
- La herramienta nativa no expone movimiento libre del mouse: se generaron movimientos reales entre puntos mediante clics en espacios libres. No se realizó una medición de FPS ni una grabación continua del efecto. Las condiciones de accesibilidad se comprobaron en pruebas automatizadas; no se volvió a emular móvil/movimiento reducido en Chrome para este cambio.

No se recibió una captura específica del rastro en esta solicitud; el comportamiento implementado se basó en las especificaciones escritas, sin atribuir animaciones a una referencia no observada.

## Transiciones de las demostraciones

Se suavizó el selector «¿Dónde se rompe la conexión?»: salida breve del contenido anterior, aparición del siguiente y altura medida de la superficie oscura con WAAPI. El +/− se forma con trazos y transiciones CSS. Se reutiliza el controlador de Lenis para dimensiones; no se añade otro RAF. Las selecciones rápidas cancelan el cambio anterior y aplican solo el último; movimiento reducido y pestaña oculta completan el cambio inmediatamente.

En Chrome se comprobó la secuencia Reportes → Integraciones → Migraciones → Reportes mediante clic, Tab, Shift+Tab y Enter. La gráfica se reconstruyó al volver a Reportes. Las 17 pruebas pasaron; las tres nuevas verifican altura medida, selección rápida sin contenido obsoleto y activación de movimiento reducido durante la transición. La revisión de este cambio en móvil y el análisis de frames no se realizaron.

## Validación más reciente: acordeón de experiencia

Se reemplazaron los details de experiencia por botones y regiones asociadas. La altura se mide en píxeles sin max-height; al terminar de abrir se restaura auto. WAAPI anima altura, opacidad, desplazamiento de 8 px y el trazo vertical del icono, con una duración completa de 500 ms y curva cubic-bezier(.22,1,.36,1). Las inversiones cortas recorren solo la distancia restante. Se impide el foco en paneles cerrados mediante inert/hidden y se recupera en la cabecera si se cierra un panel que contiene el foco.

ResizeObserver sigue el cambio de altura y actualiza el objeto público Dimensions de la instancia existente de Lenis. Esto evita que Lenis.resize() reinicie la inercia. No se añadió otra instancia ni un segundo loop de animación.

Comprobaciones realizadas:

- Pasaron las 14 pruebas y comprobaciones de sintaxis. Las cinco pruebas nuevas del acordeón verifican altura real, valores visuales en clics rápidos, callbacks obsoletos, reflujo móvil, foco, teclado, movimiento reducido y limpieza. Una prueba adicional de Lenis verifica que 30 actualizaciones de dimensiones mantienen una sola instancia/un solo RAF y no alteran el objetivo de scroll.
- En Chrome real, ventana de 1008 × 759: apertura y cierre visibles; símbolos +/− construidos con trazos; se mantuvieron composición y espaciado. Se activó la misma cabecera con Enter, Espacio y Enter consecutivos y terminó abierta con foco visible.
- En la emulación iPhone SE de Chrome, 375 × 667: se verificaron filas abiertas y cerradas, contenido a ancho móvil y mantenimiento de varios paneles abiertos.
- Se emuló prefers-reduced-motion:reduce desde DevTools y se activó una fila mediante clic, Espacio y Enter. Se restauraron la preferencia original y la vista de escritorio y se cerró DevTools al finalizar.
- Las capturas verifican estados y composición; las inversiones subframe se comprobaron con dobles de WAAPI en pruebas, sin una medición de frames ni un perfil de rendimiento exhaustivo.

Esta validación sustituye los bloqueos históricos de acceso a Chrome **para el acordeón**. La revisión completa del resto del prototipo sigue pendiente.

## Fuentes

- Solicitud del usuario: archivo adjunto Pasted text.txt.
- CV PDF adjunto: se extrajo todo su texto mediante pypdf. No se reprodujo su diseño.
- Monograma: referencia de imagen proporcionada por el usuario; archivo original conservado.
- GitHub público: https://github.com/alexisadrianc — se consultó el perfil. Los hechos del caso se tomaron del CV.
- https://iamkingsleey.com/ devolvió 403 a la herramienta web.
- https://www.awwwards.com/sites/kingsley-mkpandiok y https://alexisadrianc.gitlab.io/resume/ no fueron accesibles mediante esa herramienta.
- El acceso a la ventana de Chrome agotó la autorización del controlador. El intento posterior mediante el runtime nativo se detuvo porque no pudo determinar la URL activa con confianza suficiente. No se observaron las animaciones de la referencia ni se inspeccionaron sus elementos destacados. No se recibieron capturas de esas referencias.

La dirección visual y las interacciones implementadas son propuestas propias basadas en el briefing, no observaciones de esas páginas.

## Comprobaciones automatizadas

`npm run check` pasó: sintaxis de app.js/content.js y cuatro pruebas de cálculos y conservación de registros. El comando ejecuta node:test directamente para evitar la restricción de creación de subprocesos del entorno.

Se arrancó el servidor local y se verificaron respuestas HTTP 200 para `/`, CSS, ambos módulos JavaScript, CV y monograma. Una ruta inexistente devolvió 404. El servidor se detuvo al finalizar; puede iniciarse con `npm run dev`. Estos controles no equivalen a pruebas de interfaz.

Una medición de la tipografía con Arial detectó que el tamaño mínimo inicial del titular podía desbordarse a 320 px. Se redujo el mínimo y se ajustó la escala móvil. También se ampliaron los textos secundarios y se añadió reserva para la barra de desplazamiento al abrir el diálogo. Estas correcciones siguen pendientes de inspección visual.

## Revisión manual pendiente

1. Escritorio: 1440 × 900 y 1024 × 768. Revisar cortes de titulares, solapamientos y continuidad del caso.
2. Móvil: 390 × 844 y 320 × 740. Comprobar desbordamientos, las tres demos y la composición de documentos.
3. Conectar y separar piezas repetidamente.
4. Cambiar los seis meses; enero debe mostrar 6000 / 6000 y junio 11000 / 48000 CAD.
5. Recorrer los cuatro estados de integración y reiniciar.
6. Adaptar registros: conservar tres contactos y el registro archivado; volver al origen.
7. Abrir el caso, desplazarse dentro, cerrarlo con botón y Escape. Verificar foco en “Explorar el caso” y restauración de lectura.
8. Recorrer con Tab, Shift+Tab, Enter y Espacio; comprobar contención del foco en el diálogo.
9. Activar movimiento reducido en el sistema y repetir conexión, cambio de demo y apertura/cierre.
10. Probar enlaces de correo, GitHub, LinkedIn y descarga del CV.

## Actualización: Lenis

Se integró Lenis 1.3.29 desde npm, con módulo, CSS y licencia MIT locales. Referencia técnica consultada: https://github.com/darkroomengineering/lenis.

Pasaron las comprobaciones de sintaxis y ocho pruebas en total: cuatro de datos y cuatro del controlador de scroll. Las del controlador usan un doble de Lenis y verifican movimiento reducido, pausa al abrir el caso/ocultar la pestaña, restauración inmediata de posición, anclas con hash y foco y eliminación de listeners. No verifican la sensación de movimiento de la biblioteca real.

Con el servidor activo en 4173, `smooth-scroll.js`, `assets/vendor/lenis.js` y `assets/vendor/lenis.css` respondieron HTTP 200 con tipos MIME correctos. No hace falta reiniciar el servidor: sirve los archivos actualizados sin caché. Sigue pendiente la prueba visual en navegador indicada arriba.

## Límites del prototipo

### Actualización de gráficas: Chart.js

Se sustituyeron las barras CSS de la demo de reportes por Chart.js 4.6.2, servido localmente. La gráfica se actualiza con el selector de mes, ofrece tooltips y usa Geist Mono. Conserva la escala entre estados y presenta una tabla HTML de los valores de ambas series para acceso por teclado y lectura asistida. Las animaciones respetan movimiento reducido; la instancia se destruye al cambiar de demo y se detiene cuando no es visible.

Pasaron la sintaxis y las ocho pruebas existentes. Además, se importó el bundle real en Node para verificar su exportación global y versión; se comprobaron las series de enero y junio y las respuestas HTTP 200 de módulo, CSS y bundle. Estos controles no comprueban el dibujo del canvas: la revisión visual y táctil en navegador sigue pendiente.

Referencias técnicas: https://www.chartjs.org/docs/latest/getting-started/integration.html y https://www.chartjs.org/docs/latest/general/accessibility.html.

### Actualización tipográfica

Se aplicaron Poppins 400/500 y Geist Mono 400/500 desde paquetes Fontsource fijados en el lockfile. Los WOFF2 y sus licencias se sirven localmente. `typography.css` contiene la jerarquía solicitada y ajustes de escala responsive, interletraje y altura de línea. Se retiró visualmente el acento serif mediante Poppins 500 sin cursiva.

Pasaron las ocho pruebas existentes. Se verificaron HTTP 200 de la página, CSS tipográfico y los cuatro archivos de fuente; WOFF2 se sirve como `font/woff2`. Se reinició el servidor local para incorporar ese tipo MIME. La composición tipográfica aún necesita inspección visual real en escritorio y móvil; no se afirma haberla realizado.

No hay integración real ni datos de clientes. Las demos son conceptuales y locales. La transición compartida depende del soporte de View Transitions del navegador; su continuidad visual no ha podido validarse. La carga principal y el diálogo usan dimensiones responsive, pero todavía necesitan la revisión visual manual anterior.

### Archivos de marca definitivos

Se incorporaron los PNG originales proporcionados: monograma negro transparente en el encabezado, favicon negro para la pestaña y avatar blanco sobre azul en trayectoria. Para tema oscuro se usa la variante blanca sobre azul en el favicon. La visualización del encabezado omite los márgenes transparentes mediante CSS; los píxeles originales no se modificaron. Se comprobaron la integridad de las copias y las respuestas HTTP de los tres PNG y `brand.css`. La inspección visual en navegador sigue pendiente.


### Paleta petr?leo, papel, verde, mostaza y coral

Se aplicaron los cinco tonos a las superficies claras y oscuras, controles del header, hero, conexiones, selecci?n de problemas, caso, contacto y banda de etapas. Chart.js usa verde para el resultado mensual y mostaza para el acumulado; la leyenda HTML refleja las mismas series. Los logos originales, la geometr?a, las fuentes y las animaciones se conservan. El color de la interfaz del navegador acompa?a el tema elegido.

Validaci?n: `npm run check` pas? con 32 pruebas. La relaci?n de contraste entre petr?leo y papel es 9.16:1; mostaza sobre petr?leo, 6.25:1. Verde y coral se reservan para gr?ficos, bordes e indicadores; los r?tulos peque?os conservan petr?leo/papel. La revisi?n visual de esta actualizaci?n queda pendiente: el acceso a la ventana anterior y al inventario global fue rechazado por revisi?n autom?tica porque pod?an mostrar Gmail ajeno a la tarea. No se accedi? a ese contenido.


### GitHub Pages: alexisadrianc/alexiscabrera

Se prepararon el build estático en dist/, la base /alexiscabrera/, el workflow de despliegue en main y DEPLOYMENT.md. No se modificó GitLab ni se publicó el repositorio. No hay funciones que requieran backend.

Validación completada: instalación limpia con npm ci --ignore-scripts (0 vulnerabilidades reportadas), 32 pruebas y sintaxis, build y verificador de producción tanto en / como en /alexiscabrera/. El resultado final conserva /alexiscabrera/. Se comprobaron por HTTP 57 archivos y 45 rutas de recursos/navegación, anclas, MIME, mayúsculas y minúsculas, CV, fuentes, logos, imports y redirección a la barra final. Se compararon los recursos con los originales. La búsqueda de patrones de credenciales no detectó coincidencias en 57 archivos de texto del proyecto antes de añadir la documentación final, ni en el artefacto publicado. No hay direcciones locales ni llamadas a backend en el artefacto.

Límites: la apertura de la vista de producción con CUA no estuvo disponible (browser access host unavailable); no se afirma una nueva verificación visual. El workflow no se ha ejecutado en GitHub ni se ha realizado un push; la publicación y verificación de la URL pública quedan para cuando se suba main y se configure Settings > Pages > GitHub Actions.


### Destino actualizado: sitio de usuario en la raíz

La configuración vigente es alexisadrianc/alexisadrianc.github.io, con basePath / y PAGES_BASE_PATH / en el workflow. Sustituye el destino anterior para futuras publicaciones. URL prevista: https://alexisadrianc.github.io/. Se actualizaron README.md y DEPLOYMENT.md, incluidos los pasos para crear el repositorio.

Validación: npm run build, npm run verify:production y npm run check completados correctamente. El build final tiene base /; se verificaron por HTTP 57 archivos y 45 rutas, y pasaron las 32 pruebas existentes y la sintaxis de las herramientas de publicación. No se cambiaron los archivos de interfaz, animaciones, idiomas, temas ni recursos. La API pública del repositorio devolvió 404: puede no existir o ser privado. No se creó ni modificó ningún repositorio remoto; tampoco se realizó un despliegue.
