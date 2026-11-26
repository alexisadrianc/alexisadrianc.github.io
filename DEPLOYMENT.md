# GitHub Pages

Repositorio de destino: https://github.com/alexisadrianc/alexisadrianc.github.io

URL después de un despliegue correcto: https://alexisadrianc.github.io/

## Qué se publica

El proyecto usa HTML, CSS y módulos JavaScript nativos. No necesita un backend ni un proceso Node en producción. Node solo ejecuta las comprobaciones y prepara los archivos. Lenis, Chart.js, las fuentes y los logos se sirven localmente. Las demostraciones son ilustrativas; no llaman a Odoo, 3CX ni servicios privados. El contacto abre el cliente de correo mediante `mailto:`.

El build conserva los idiomas EN/FR/ES, las preferencias locales de tema e idioma, las animaciones, las interacciones y todos los recursos de `assets/`, incluido el CV descargable y las licencias. Las preferencias guardadas en GitLab no se transfieren al dominio de GitHub; cada origen tiene su propio almacenamiento del navegador. Sin una preferencia guardada se usa inglés y el tema del sistema.

`npm run build` genera `dist/` mediante una lista explícita de archivos públicos. No publica el servidor de desarrollo, las pruebas, los scripts de mantenimiento, `node_modules`, herramientas locales ni configuración privada. `dist/` no se versiona. No se modifica la configuración ni el sitio de GitLab.

## Configuración en GitHub

1. Sube estos archivos a la rama `main` del repositorio **alexisadrianc/alexisadrianc.github.io**. Si el repositorio aún no existe, sigue los pasos de creación indicados abajo. No reutilices un remoto de GitLab ni cambies otros repositorios.
2. En el repositorio, abre **Settings → Pages → Build and deployment → Source → GitHub Actions**. No selecciones una carpeta o una rama de archivos compilados.
3. Asegúrate de que GitHub Actions esté habilitado y que las políticas del repositorio permitan las acciones oficiales de `actions/` y el despliegue a Pages. El workflow declara sus permisos: lectura de código/configuración en el build; `pages: write` e `id-token: write` en el despliegue. No requiere un PAT ni secretos añadidos manualmente.
4. Después de seleccionar GitHub Actions como fuente, haz push a `main` o ejecuta **Actions → Deploy GitHub Pages → Run workflow → main**. El workflow usa el entorno `github-pages` y muestra la URL publicada al finalizar. Si ese entorno exige aprobación, el despliegue esperará la aprobación configurada en GitHub.
5. Deja **Custom domain** vacío para utilizar la URL indicada. Activa **Enforce HTTPS** cuando esté disponible.

El workflow `.github/workflows/pages.yml` instala las dependencias fijadas con `npm ci --ignore-scripts`, ejecuta las pruebas, genera el sitio, verifica el artefacto y despliega únicamente `dist/`. Se ejecuta con cada push a `main` y también manualmente. Un fallo de build, pruebas o verificación impide el despliegue.

## Crear el repositorio si no existe

La consulta pública a la API de GitHub devolvió 404 el 26 de noviembre de 2026. Esto significa que el repositorio no está disponible públicamente; también podría existir como privado. Compruébalo al iniciar sesión antes de crear uno.

1. Abre https://github.com/new con la cuenta `alexisadrianc`.
2. Selecciona como propietario **alexisadrianc** y escribe exactamente **alexisadrianc.github.io** como nombre.
3. Selecciona **Public**. Para subir este proyecto a un repositorio vacío, deja desmarcada la creación de README, `.gitignore` y licencia: el proyecto ya incluye README y `.gitignore`.
4. Pulsa **Create repository**. Sube el proyecto a `main`, incluyendo la carpeta `.github/`, los scripts, el lockfile y todos los recursos. No subas `node_modules/`, `dist/`, `.tools/` ni `tmp/`; están excluidos mediante `.gitignore`.
5. Configura **Settings → Pages → Source → GitHub Actions** y ejecuta el workflow en `main`.

El nombre exacto del repositorio hace que sea un sitio de usuario en **https://alexisadrianc.github.io/**, sin subdirectorio. No hace falta eliminar, renombrar ni modificar el repositorio anterior `alexiscabrera` ni el sitio de GitLab.

## Rutas y base URL

`pages.config.json` declara `alexisadrianc/alexisadrianc.github.io` y `basePath: "/"`. El build local y el workflow usan `/`; el workflow fija `PAGES_BASE_PATH: '/'`. `actions/configure-pages` obtiene la configuración de Pages antes del despliegue.

Solo el HTML generado recibe `<base href="/">`. Los imports, fuentes, logos, favicon, CV y enlaces internos mantienen sus rutas relativas. El HTML de desarrollo permanece intacto. No hay un router SPA ni rutas que necesiten un backend o una redirección global a `index.html`.

## Comprobación local

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run verify:production
npm run preview
```

La vista de producción se abre en http://127.0.0.1:4174/ y usa `dist/`; el servidor de desarrollo en 4173 sigue siendo independiente. El verificador sirve el build desde `/` y comprueba recursos, enlaces internos y respuestas 404 para archivos inexistentes. Si se prueba temporalmente un subdirectorio, también comprueba que las rutas no escapen a ese prefijo y que se añada la barra final.

`verify:production` comprueba nombres de archivo con distinción de mayúsculas, imports, recursos CSS, logos dinámicos, descargas, destinos de anclas, tipos MIME y respuestas HTTP desde la ruta de publicación. Comprueba que todos los recursos originales sigan presentes y que no se hayan alterado, salvo los comentarios de source maps ausentes de las bibliotecas. También busca patrones reconocibles de credenciales, direcciones locales y llamadas a backend en el código de la aplicación. Es una comprobación automática de archivos y rutas; no sustituye una revisión visual en navegador ni una auditoría exhaustiva de secretos.

Para probar otra base temporalmente en PowerShell:

```powershell
$env:PAGES_BASE_PATH = '/otra-ruta/'
npm run build
npm run verify:production
Remove-Item Env:PAGES_BASE_PATH
npm run build
```

Las direcciones localhost de este documento y de los servidores de prueba son solo para desarrollo y no se copian al sitio público.

## Referencias oficiales

- [Workflows personalizados de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configurar la fuente de publicación](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
