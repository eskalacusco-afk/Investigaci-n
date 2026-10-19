# ESKALA — GitHub Pages + Google Apps Script + Google Drive / Sheets

Esta **es la arquitectura solicitada**: la página visible vive en GitHub Pages; Apps Script solo sirve como puente de ejecución; los datos privados permanecen en tu cuenta Google (Drive como almacenamiento por expediente y Sheets como índices consultables).

**Contenido del ZIP**

```
github-pages/
  index.html            página completa ESKALA con marca corporativa
  conexion-google.js    conexión del navegador con Apps Script
apps-script/
  Code.gs               backend Drive / Sheets, controlado por clave privada
  Puente.html           puente de mensajería entre GitHub y Apps Script
```

## A. Publicar la página en GitHub

1. Descomprime el ZIP en tu PC.
2. Entra al **repositorio de GitHub que usas para ESKALA**.
3. Sube **los dos archivos dentro de `github-pages`** directamente a la raíz del repositorio (`index.html` y `conexion-google.js`). **No subas la carpeta `github-pages` como carpeta contenedora ni el ZIP sin extraer.**
4. Haz **Commit changes**.
5. En **Settings > Pages**, selecciona **Deploy from a branch > main > /(root)**. Espera a que termine el despliegue.
6. Tu enlace normalmente será `https://TU_USUARIO.github.io/TU_REPOSITORIO/` (o `https://TU_USUARIO.github.io/` si ese es el nombre del repositorio).
7. Anota **solo el origen del sitio, sin ruta**. Ejemplo: si tu página es `https://maria.github.io/eskala/`, el origen es `https://maria.github.io`.

## B. Configurar almacenamiento en Google Apps Script

1. Entra en <https://script.google.com/> desde tu cuenta Google.
2. Crea un proyecto llamado `ESKALA - Datos` (o abre el proyecto anterior **si quieres conservar sus expedientes**).
3. En el archivo de código `Código.gs`, pega **todo** el contenido de `apps-script/Code.gs`. El nombre `Código.gs` o `Code.gs` es indiferente.
4. Con **+ > HTML**, crea un archivo **Puente** y pega el contenido de `apps-script/Puente.html`. **No debes pegar el HTML en Código.gs.**
5. Guarda.
6. Arriba, selecciona la función `setupEskala` y pulsa **Ejecutar**. Autoriza Drive y Sheets. Esto prepara las carpetas, índices y una clave privada de conexión. Si ya había un proyecto configurado, la función conserva los mismos IDs de Drive/Sheets y agrega las pestañas necesarias, sin borrar expedientes.
7. Abre **Configuración del proyecto > Propiedades de secuencia de comandos (Script properties)**:
    - Confirma que exista `ESKALA_ACCESS_KEY`. **Copia su VALOR para introducirlo después únicamente en la página ESKALA.** **NO lo copies en GitHub, capturas, chats o repositorios**. Tiene más de 100 caracteres aleatorios.
    - Agrega `ESKALA_ALLOWED_ORIGIN` con el origen de tu GitHub (por ejemplo: `https://maria.github.io`). Es importante escribir exactamente el dominio HTTPS **sin barra final ni el nombre del repositorio**.
8. Presiona **Implementar > Nueva implementación > Aplicación web**.
9. Escoge **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier usuario (Anyone)**. La página puente se puede cargar desde GitHub, pero toda operación de lectura/escritura verifica la clave privada del servidor. Este punto es necesario para el puente embebido con la solución suministrada. No uses este despliegue para otros proyectos.
10. Pulsa **Implementar**, autoriza lo necesario y copia la URL de la aplicación web que termina en `/exec`. Usa **esa URL**, no la dirección del editor ni una `/dev`.

## C. Conectar ESKALA

1. Abre la página publicada en GitHub.
2. Verás una ventana **ESKALA — Conecta con Google**.
3. Introduce la URL de Apps Script que acaba en `/exec`.
4. Introduce la clave privada **ESKALA_ACCESS_KEY** que copiaste de Script Properties.
5. Presiona **Conectar con Google**. Si funciona, aparecerá el panel y `Conectado a Google`.
6. Crea un expediente **de prueba**, agrega un servicio, un abono y una meta. Espera a ver `Guardado en Google ✓`, cierra y reabre la página para verificar la persistencia.
7. Luego elimina el expediente ficticio y comienza con tus datos reales.

La URL se recuerda en el navegador; la clave solo se conserva en `sessionStorage` (pestaña/sesión actual). Tendrás que volver a introducirla cuando abras una nueva sesión. Eso evita incrustarla en la página pública.

## D. Seguridad y privacidad

- El HTML y JS de GitHub Pages son públicos. **No subas contratos, documentos, expedientes, cifras individuales, claves, hojas ni contraseñas a GitHub**.
- Google Apps Script se ejecuta como propietario: todos sus permisos son los de tu cuenta. El backend incluye un **único método público autorizado con clave** para leer/escribir; los métodos de datos con sufijo `_` no se pueden invocar directamente desde `google.script.run`.
- La clave aleatoria de `ESKALA_ACCESS_KEY` debe permanecer secreta y no almacenarse de modo público. Si crees que fue expuesta, cámbiala desde Script Properties: las conexiones anteriores dejarán de funcionar.
- `ESKALA_ALLOWED_ORIGIN` restringe el intercambio de mensajes al dominio configurado. La aplicación añade además un identificador aleatorio de sesión a los mensajes.
- Este acceso mediante clave es una solución práctica para un **solo administrador** en un sitio GitHub público, pero **no reemplaza** la autenticación Google OAuth o una capa de backend de identidad empresarial. Antes de usarlo con información muy sensible, conviene hacer una revisión de seguridad adicional.
- No hay correos ni mensajes programados. Las metas y reuniones se muestran dentro de la página.

## E. Si aparece un error

- **GitHub 404:** comprueba que `index.html` está en la raíz; rama `main`, carpeta `/(root)`, enlace y mayúsculas correctos.
- **Se queda en “Conectando”:** revisa que hayas publicado **aplicación web**, acceso **Cualquier usuario**, URL `/exec` y `ESKALA_ALLOWED_ORIGIN` configurado (origen exacto). Algunos bloqueos de contenido o de marcos de terceros del navegador pueden impedir el puente. Prueba en Chrome, sin extensiones de bloqueo, o revisa la consola.
- **Clave incorrecta:** asegúrate de pegar `ESKALA_ACCESS_KEY` completo desde Script Properties; no es el ID de implementación.
- **Permisos:** ejecuta `setupEskala` y acepta los permisos de Google desde el editor.
- **Hiciste cambios en Code.gs:** ve a **Implementar > Gestionar implementaciones > Editar > Nueva versión > Implementar**. Un simple Guardar no cambia la versión `/exec` publicada.
- **Se muestran datos de prueba local:** verifica que hayas reemplazado el `index.html` anterior y subido también `conexion-google.js`.

**Nota de verificación**: se comprobó la sintaxis del JavaScript y del código Apps Script, pero la conexión real depende de tu despliegue y autorizaciones. Haz la prueba con un expediente ficticio antes de registrar información de tesistas.
