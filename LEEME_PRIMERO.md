# ESKALA v7 · seguimiento simple en dos columnas

## Versión para GitHub Pages

1. Ingresa al repositorio `eskalacusco-afk/Investigaci-n`.
2. **Primero descarga tu respaldo JSON** desde la página ESKALA → Google y respaldo. No lo subas a GitHub.
3. Reemplaza solamente `index.html` por el archivo `index.html` de este ZIP. Conserva `conexion-google.js` (la misma copia del puente existente) en la raíz del repositorio; solo súbela si falta.
4. Confirma con Commit changes. Actualiza la página publicada con Ctrl+Shift+R.
5. Revisa que aparezca la conexión con Google; cambia una nota de prueba, espera «Guardado en Google ✓» y actualiza para comprobar persistencia.

**Google Apps Script no necesita cambios**: esta versión conserva la estructura actual de expedientes, tareas, pagos, cuotas y revisores; añade únicamente estados y presentación a los campos existentes.

## Vistas

- `VISTA_PREVIA_LOCAL.html` permite evaluar el diseño sin conexión a Google: guarda datos de prueba únicamente en el navegador.
- Los recuadros de Mis tesis utilizan un azul translúcido UAC, granate translúcido UNSAAC, rojo translúcido César Vallejo y arena suave con azul Continental. Otras universidades conservan el estilo neutro.
- Dos columnas: elaboración (turquesa) y administrativa (azul). En cada tarea «Trabajando» muestra borde naranja y «Concluido» borde verde; activar uno desactiva el otro. Solo Concluido cuenta en el porcentaje.
- Tres dictaminantes se agregan o editan desde el encabezado del expediente.
- El saldo pendiente se calcula exclusivamente sobre honorarios por servicios/contratos, no sobre tasas universitarias.

Para otras universidades la ruta administrativa es una plantilla general, no los pasos UAC. Revisa siempre reglamentos aplicables.
