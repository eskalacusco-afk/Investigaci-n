# ESKALA v4 — Identidad visual oficial + Control de tesis y servicios

Esta versión utiliza el logotipo proporcionado por el propietario, con azul marino `#042555`, turquesa `#00C8C2` y blanco. Incorpora una navegación renovada, portada de control de tesis y tarjetas de seguimiento mejoradas. **La lógica de gestión de la v3 se conserva**, incluidos servicios independientes, contratos, cuotas, entregables y rutas por universidad.

## Archivos para Apps Script

- `Code.gs`: servidor que guarda expedientes JSON privados en Drive y genera índices en Google Sheets.
- `Index.html`: estructura web con logotipo e isotipo incrustados (no necesitan alojamiento externo).
- `Styles.html`: estilos y paleta corporativa.
- `Client.html`: lógica de interfaz, edición de expedientes y pagos.
- `VISTA_PREVIA_LOCAL.html`: versión de prueba en tu navegador SIN conexión a Google; usa datos de prueba locales de ese navegador.
- `ESKALA_logo_horiz.png` y `ESKALA_simbolo.png`: copias recortadas del logo original.

## Activación desde cero

1. Ve a https://script.google.com/ e inicia sesión en tu cuenta Google personal.
2. Crea un proyecto llamado `ESKALA - Gestión de Tesis y Servicios`.
3. Sustituye `Code.gs` con el contenido del paquete. Crea tres archivos **HTML** llamados exactamente `Index`, `Styles`, `Client` e introduce el contenido correspondiente.
4. Guarda y ejecuta la función `setupEskala` desde el editor. Autoriza Google Drive y Google Sheets desde tu cuenta. No compartas contraseñas.
5. Selecciona **Implementar > Nueva implementación > Aplicación web**; ejecuta como **Yo** y restringe el acceso a **Solo yo** (si tu cuenta/interfaz admite esa opción). Nunca publiques con acceso libre a cualquiera.
6. Abre la URL de la aplicación web desplegada e ingresa tu primer trabajo.

## Actualización desde la versión 3

- Conserva el proyecto de Apps Script y **no borres los archivos de Drive ni la hoja de Google Sheets**.
- Sustituye solamente `Index.html`, `Styles.html` y `Client.html` si ya estabas utilizando el `Code.gs` de v3 (el backend de esta entrega mantiene el mismo formato).
- Guarda y **vuelve a implementar una nueva versión** para aplicar los cambios en la URL de producción.
- Las claves de almacenamiento local de v3 se mantienen para conservar los expedientes de prueba en el mismo navegador. La base real sigue en tu Drive.

## Reglas del negocio preservadas

- Un expediente puede tener varios servicios contratados, con importes, plazos, cuotas y pagos separados.
- La asesoría completa puede incluir estadística, diapositivas y preparación para sustentación como entregables de un solo contrato, sin cobrar dos veces.
- Los servicios puntuales no requieren la ruta universitaria de tesis completa.
- La ruta UAC pregrado conserva los nombres de sus 5 pasos. Para maestrías y otras universidades se utiliza una plantilla editable.
- No se mandan correos ni alertas fuera del sistema. El panel muestra solo metas/reuniones pactadas y otros plazos configurados.

## Advertencias de implementación

- La **vista previa local** no está conectada a Google; la sincronización privada debe probarse después de desplegar la app con permisos en tu propia cuenta.
- Los nombres, procedimientos y tasas universitarios deben verificarse con los reglamentos aplicables y pueden variar por universidad/programa.
- Los datos personales de tesistas son privados. No publiques tu hoja Sheets ni los archivos JSON de Drive ni compartas permisos de edición del proyecto de Apps Script.
- ESKALA v4 es una aplicación web de uso personal basada en Apps Script. Google impone cuotas de servicio y límites de ejecución.

## Cambios principales
- **Tesis y servicio contratado son entidades distintas.** Un mismo expediente puede tener asesoría completa, estadística, diapositivas, preparación para sustentación u otros contratos separados.
- **Asesoría completa** incluye por defecto el análisis estadístico, las diapositivas y la preparación para sustentación como entregables. No se factura dos veces el mismo entregable.
- Cada contrato tiene precio TOTAL, estado, notas, entregables, pagos recibidos y cuotas propias.
- Meta pactada = fecha escrita en el contrato, entregable o compromiso. Sin correos, recordatorios automáticos ni notificaciones externas.
- Los expedientes previos con acuerdos por tesista se conservan como **contratos anteriores**. No registres sus honorarios otra vez en un servicio.
- Las 5 etapas oficiales UAC pregrado siguen intactas, y las otras universidades siguen con plantilla genérica editable.
- Sheets agrega las pestañas **Servicios** y **Entregables**. Drive sigue guardando un JSON privado por expediente.

## Instalación nueva
1. Ingresa a https://script.google.com/ y crea el proyecto `ESKALA - Control de Tesis`.
2. Pega el archivo `Code.gs` en el editor y crea tres archivos HTML con nombres exactos `Index`, `Styles`, `Client` pegando sus respectivos contenidos. `Styles.html` contiene CSS sin `<style>`, mientras que `Client.html` incluye `<script>`.
3. Guarda y ejecuta `setupEskala`. Da permisos a Drive y Sheets en tu propia cuenta.
4. **Implementar > Nueva implementación > Aplicación web**: ejecutar como **Yo**, acceso **Solo yo**. Nunca elegir «cualquier persona».
5. Registra trabajos y consulta en Drive la carpeta `ESKALA - Control de Tesis`.

## Actualizar una instalación v2
1. Exporta un respaldo JSON de la aplicación anterior.
2. Sustituye los contenidos de los cuatro archivos del mismo proyecto Apps Script (NO crees otra carpeta de datos).
3. Guarda y ejecuta `setupEskala` nuevamente. Detecta instalación previa y añade las columnas y pestañas nuevas **sin borrar datos**.
4. Ejecuta `rebuildIndexes` para regenerar todos los índices desde los JSON de Drive.
5. Desde **Implementar > Gestionar implementaciones**, edita la implementación existente y publica la versión de código actualizada.
6. Confirma que aparece «Servicios contratados» y prueba creando un contrato pequeño sin datos sensibles, registrando un entregable y un abono. Verifica el guardado en Drive y el índice Sheets.

## Uso recomendado
1. **Nuevo trabajo** > título provisional o nombre identificador del encargo + universidad + tesista.
2. Escoge **primer servicio**: por ejemplo *Análisis estadístico*; ingresa monto total acordado (no por tesista).
3. Entra en el expediente > **Servicios y entregables**; cambia alcance, fechas pactadas y estados, agrega cuotas y abonos.
4. Puedes agregar otro contrato si la persona te contrata un trabajo adicional genuinamente independiente.
5. Cuando aplique a pregrado UAC, la pestaña **Ruta y tareas** continúa controlando los trámites, por separado.

## Finanzas y límites
- En **Servicios**, los importes son por contrato. Si un contrato beneficia a dos tesistas, no se multiplica automáticamente por dos.
- En **Tesistas y pagos anteriores**, los importes heredados se mantienen, pero evita registrarlos otra vez en Servicios.
- Las tasas académicas de universidades, por ejemplo S/ 1,850 para solicitar sustentación en UAC según lo indicado, no se suman a tus ingresos.
- Las cuotas se imputan por orden cronológico; no existe todavía asignación manual de un cobro a una cuota concreta.
- El archivo `VISTA_PREVIA_LOCAL.html` solo guarda datos de prueba en este navegador; **NO** conecta Google.
- Se ha comprobado sintaxis y lógica local; **no se ha probado todavía una ejecución real dentro de tu cuenta Google**.
- JSON en Drive es la fuente de verdad; Sheets es un índice regenerable. No edites índices manualmente.
- Evita guardar bases de datos personales sensibles innecesarias y no compartas carpetas o respaldos públicamente.
