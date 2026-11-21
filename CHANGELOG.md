# Registro de cambios

Todos los cambios importantes de Electroverse. Las versiones siguen el formato `mayor.menor.parche`.

## [14.0.0] — 2026-11-21

Cuentas en la nube, aulas en línea y servidor de IA para estudiantes (listo para activar).

### Nuevo
- **Cuentas con Firebase** (opcional): entrar con Google o con correo y contraseña, avance guardado en la nube (`data/firebase-config.js`, `libs/firebase/`). Sin configuración, la app sigue igual que antes.
- **Aulas en línea**: cada docente ve solo sus aulas y las entregas dirigidas a él; el estudiante envía su avance con un botón.
- **Docentes aprobados**: el usuario pide el rol de docente y el administrador lo aprueba en Ajustes → Docentes; al volver a entrar recibe el rol automáticamente.
- **Reglas de seguridad** de Firestore (`firestore.rules`) y guía paso a paso (`docs/FIREBASE.md`).
- Ajustes muestra el UID de la cuenta y cierra la sesión de verdad en computadoras compartidas.
- **Servidor de IA para estudiantes** (`servidor-ia/`, Cloudflare Workers): guarda la clave de Anthropic como secreto, solo responde a usuarios con sesión de Firebase y a la página de Electroverse, limita las preguntas por estudiante y por día (20 y 500 por defecto), usa Claude Haiku 5.5 y responde en vivo. Incluye 27 pruebas automáticas y guía (`docs/SERVIDOR_IA.md`).
- El tutor usa el servidor de la plataforma cuando el estudiante entra con su cuenta, muestra cuántas preguntas le quedan y, al llegar al límite, responde sin IA.

### Nota
- El servidor de IA está incluido y probado, pero **no está activado** en esta publicación (`iaUrl` vacío): el tutor responde con su base propia hasta que se instale en Cloudflare con una clave de Anthropic (ver `docs/SERVIDOR_IA.md`).

### Técnico
- Firebase compat 11.10.0 en `libs/firebase/` (se carga solo si hay configuración).
- Botones Nuevo con diálogo propio (`preguntar()`) también en la versión publicada.

## [13.0.0] — 2026-11-19

Biblioteca ampliada, 3D en alta resolución, zoom en esquemas y tutor de electrónica por niveles.

### Nuevo
- **Biblioteca** (`#biblioteca`): 63 componentes (7 placas, 17 sensores, 10 actuadores, 6 de comunicación, 7 de visualización, 1 de alimentación, 5 básicos y 10 circuitos integrados) con buscador, filtros, datos eléctricos, pinout, conexión con UNO y ESP32, código de ejemplo y errores comunes (`data/componentes.js`).
- **Visor 3D de la Biblioteca** con Three.js r160: materiales PBR, luz de entorno, sombras, etiquetas, vista explosionada, pinout en 3D, ficha al pasar el mouse y calidad Alta/Media/Baja (`js/visor3d.js`, `js/modelos3d.js`).
- **Esquemas**: zoom con rueda, pellizco y teclado, ajustar al circuito, minimapa, colores por red, "seguir una conexión", tabla de conexiones, exportar PNG/SVG e imprimir en A4.
- **Protoboard 3D**: placas y módulos con los modelos de la Biblioteca, pantallas LCD/OLED en vivo, brazo del servo que gira y modelos realistas de batería, portapilas, fuente, motor, display de 7 segmentos, DIP switch, pulsador, interruptor, zumbador, capacitores y chips DIP (`js/realistas3d.js`).
- **Protoboard**: placas Arduino Nano y ESP32 DevKit de 38 pines que ejecutan programas; 27 módulos nuevos (DHT22, MPU-6050, L298N, HC-05, GPS, DS3231, Mega, ESP32-CAM, ESP32-S3 y más); categoría Comunicación.
- **Botón Nuevo** en Esquemas y Protoboard (se puede deshacer con Ctrl+Z).
- **Tutor de electrónica** con 4 módulos (Básico, Intermedio, Avanzado, Industrial · IoT · Robótica): ruta de aprendizaje con 26 temas, 27 tipos de ejercicios con solución paso a paso, 7 diagramas para aprender a leer esquemas y chat (`data/tutor.js`).
- **Agente ELECTRO**: instrucciones profesionales para la IA, de cero a industrial (`docs/AGENTE_TUTOR.md`).
- **IA fuera de Claude**: el docente puede pegar una clave de API de Anthropic (se guarda solo en ese navegador) y elegir el modelo: Haiku 5.5 (económico), Sonnet 5.5 (equilibrado, predeterminado) u Opus 5.5 (máxima calidad), con su costo aproximado por pregunta. Sin IA, el tutor responde con su base propia.
- **Funciona sin internet**: Three.js r128 y r160, Mermaid y las fuentes están en `libs/`.
- Panel "Acerca de esta versión" en Estructura y número de versión en Inicio y Ajustes.

### Mejorado
- 3D más nítido al acercar (texturas con más píxeles por mm y redibujo a resolución completa al quedarse quieto).
- Protoboard 3D con muchos módulos: de 35,6 ms a 6,3 ms por cuadro (las piezas fijas se fusionan por material).
- Las referencias a placas usan el tipo de motor (`board`) en lugar del nombre.
- Los scripts llevan número de versión (`?v=`) para que el navegador no use copias viejas.

### Corregido
- El botón Nuevo no hacía nada dentro de Claude (`confirm()` está bloqueado): ahora usa un diálogo propio.
- Los diagramas de Estructura solo se dibujaban si la página se abría directamente en esa sección.
- Error 404 de `/_runtime/mermaid…` fuera de Claude.
- La pantalla LCD/OLED del modelo 3D no mostraba la imagen del programa.
- Etiquetas 3D duplicadas, planos de serigrafía de pie y cámara demasiado cerca en la Biblioteca.

### Técnico
- Cabecera HTML estándar (`lang="es"`) sin restos del entorno de artefactos.
- Si la página se abre con doble clic (`file://`), la Biblioteca usa Three.js r128 local (los navegadores bloquean los módulos ES en `file://`).

## [12.0.0]

Versión de partida: simulador de esquemas y protoboard 2D/3D, Arduino UNO y ESP32 con IoT, lecciones, tutor con IA dentro de Claude y aulas. Ver `docs/AUDITORIA_V12.md`.
