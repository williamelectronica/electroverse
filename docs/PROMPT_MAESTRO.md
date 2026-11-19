# ELECTROVERSE — Prompt maestro

> Descripción completa de la aplicación **tal como está en la v13** (etiqueta `v13.0.0`).
> Sirve para reconstruir o continuar la app en el futuro. La descripción de la v12 está en el historial de Git (`v12.0.0`) y en `docs/AUDITORIA_V12.md`.

---

## 1. Identidad

| Campo | Valor |
|---|---|
| Nombre | **ELECTROVERSE** (pestaña: "Electroverse v13 · Laboratorio de electrónica") |
| Subtítulo | Laboratorio de electrónica |
| Autor | Prof. William Dextre — I.E. Industrial "Japón", Llata, Huánuco, Perú |
| Versión | **13.0.0** (constante `EV_VERSION` en `index.html`; se muestra en Inicio, Estructura y Ajustes) |
| Público | Docentes y estudiantes de secundaria (13 a 17 años), institutos y universidades del Perú |
| Idioma | Todo en español, con lenguaje sencillo y analogías cotidianas |
| Objetivo | Aprender, simular y programar electrónica real sin componentes físicos: esquemas y protoboard (2D y 3D), Arduino y ESP32 con IoT, biblioteca de componentes con modelos 3D, lecciones, tutor de electrónica por niveles y aulas para el docente |

## 2. Tecnología

- **Página principal `index.html`** (≈870 KB, ≈10 400 líneas) con HTML, CSS y JavaScript puro, sin frameworks ni compilación. Desde la v13 tiene archivos de apoyo:

| Archivo | Contenido |
|---|---|
| `data/componentes.js` | `window.EV_DATA`: 63 componentes (7 placas, 17 sensores, 10 actuadores, 6 de comunicación, 7 de visualización, 1 de alimentación, 5 básicos, 10 circuitos integrados) con pinout, datos eléctricos, conexión con UNO/ESP32, código de ejemplo y errores comunes |
| `data/tutor.js` | `window.EV_TUTOR`: base de conocimiento del tutor (4 niveles, 26 temas, 27 generadores de ejercicios, 7 diagramas con preguntas, instrucciones del agente y buscador sin internet) |
| `js/visor3d.js` | `window.Visor3D`: visor 3D de la Biblioteca (Three.js r160) y fábrica de piezas compartida con la protoboard (`fabricaExterna`) |
| `js/modelos3d.js` | Modelos 3D de cada componente (recetas por id y por categoría) |
| `js/realistas3d.js` | `window.PB_REAL`: modelos realistas de piezas de protoboard (batería 9 V, portapilas, fuente, motor, display 7 segmentos, DIP switch, pulsador, interruptor, zumbador, capacitores, chips DIP) |
| `libs/` | Librerías copiadas para funcionar **sin internet** (ver abajo) |

- **Simulador de circuitos propio** (análisis nodal modificado, MNA): DC y transitorio, modelos con datos de hojas de datos, lógica digital mixta y tabla de verdad automática.
- **Intérprete de Arduino propio**: compila un subconjunto de C++ a JavaScript y lo ejecuta en un **Web Worker** (`<script id="ard-worker-src">`). Emula Servo, LiquidCrystal(_I2C), DHT, SSD1306, NeoPixel, MFRC522, BME280, HX711, OneWire/DallasTemperature, WiFi y PubSubClient.
- **3D**:
  - Esquemas y Protoboard: Three.js **r128** clásico (`libs/three-r128/three.min.js`, CDN como respaldo), carga diferida.
  - Biblioteca: Three.js **r160** como módulo ES mediante `importmap` (`libs/three-r160/`) con OrbitControls, RoomEnvironment y RoundedBoxGeometry. Si la página se abre con doble clic (`file://`) o los módulos fallan, usa r128 de `libs/` (también se fuerza con `?r128` en la dirección).
  - Materiales PBR, luz de entorno (PMREM), tone mapping ACES, texturas de texto con `CanvasTexture` (píxeles por mm: Alta 36, Media 26, Baja 12), pines con `InstancedMesh`, dibujo solo cuando algo cambia y redibujo nítido (hasta 2×) al quedarse quieto.
  - Protoboard: los modelos de alta calidad se guardan en caché y sus piezas fijas se **fusionan por material** (`Proto3D.fusionar`) para dibujar rápido.
- **Esquemas y protoboard 2D**: SVG generado por código. Esquemas con zoom por `viewBox` (`EsqZoom`).
- **Fuentes**: Atkinson Hyperlegible (texto), Chakra Petch (títulos), JetBrains Mono (código), copiadas en `libs/fonts/` (subconjunto latino, licencia SIL OFL).
- **Diagramas**: Mermaid 11.4.1 en `libs/mermaid/`, dibujado con `dibujarMermaid(cont)` (sección Estructura y respuestas del tutor).
- **Guardado**: `localStorage` con prefijo `ev1:` por perfil. Dentro de Claude también usa las capacidades del artefacto (`window.claude`) para cuenta, nube, tutor IA y broker MQTT de la clase.
- **IA del tutor**: dentro de Claude, `Store.sample`; fuera de Claude, SDK oficial `@anthropic-ai/sdk` 1.4.0 (jsDelivr, solo con internet) con la clave de API que pega el docente, modelo `claude-opus-5-5` y respaldo del servidor (`fallbacks: "default"`).

## 3. Estilo visual

- Concepto **"laboratorio holográfico"**: paneles de vidrio sobre una rejilla tipo protoboard en penumbra; el color aparece donde hay voltaje.
- Tema oscuro por defecto y tema claro. Colores en variables CSS (cian `#22e5ff`, violeta, magenta, lima, ámbar…).
- Iluminación del espacio Día / Taller / Noche; calidad 3D Alta / Media / Baja (baja sola en equipos lentos).
- Accesibilidad: letra ajustable, movimiento reducido, foco visible, etiquetas `aria`.
- Diálogos propios (`preguntar()`) en lugar de `confirm()`, que está bloqueado dentro de Claude.

## 4. Navegación (rutas con `#`)

| Ruta | Sección | Notas |
|---|---|---|
| `#inicio` | Inicio | Portada, avance y accesos rápidos |
| `#lab` | **Esquemas** | Esquemas 2D/3D con zoom, lectura de conexiones y exportación |
| `#proto` | **Protoboard** | 830 puntos, 4 placas programables, 101 piezas, vista 2D y 3D |
| `#arduino` | **Arduino** | Editor, simulación, monitor serie, plotter, módulos, IoT y USB |
| `#biblioteca` / `#biblioteca-<id>` | **Biblioteca** | Fichas de los 63 componentes con 3D, pinout, conexión y código |
| `#aprender` / `#leccion-lN` | Aprender | Lecciones con visualización, quiz y reto |
| `#tutor` | **Tutor IA** | Agente de electrónica: Chat, Ruta, Ejercicios y Leer diagramas |
| `#aulas` | Aulas | El docente crea aulas; los estudiantes envían su avance (código EV1) |
| `#estructura` | Estructura | Documento del proyecto y "Acerca de esta versión" |
| `#ajustes` | Ajustes | Perfil, tema, letra, efectos |

## 5. Secciones en detalle

### 5.1 Esquemas (`Lab`, `VIEWS.lab`, `EsqZoom`)
- Rejilla SVG con componentes, cables, multímetro y osciloscopio de 2 canales; simulación en vivo con colores de voltaje y animación de corriente.
- **Zoom profesional**: rueda, pellizco, arrastre, teclas (+, −, 0), ajustar al circuito y minimapa.
- **Lectura de conexiones**: redes calculadas (union-find), colores por red, "seguir una conexión" y tabla de conexiones copiable.
- **Exportar** PNG y SVG, e **imprimir** en A4 horizontal.
- Botón **Nuevo** (vacía el lienzo; Ctrl+Z lo recupera).

### 5.2 Protoboard (`Proto`, `VIEWS.proto`, `Proto3D`)
- Protoboard de 830 puntos, bandeja por categorías (incluye Comunicación), cables de colores, piezas arrastrables.
- **Placas programables**: Arduino UNO, Arduino Nano (motor del UNO), ESP32 DevKit y ESP32 DevKit de 38 pines (motor del ESP32). `MCU_DEFS[k].board` indica qué motor usa.
- **55 módulos** (`MOD_DEFS`): los de la v12 más 27 generados desde `EV_DATA` (`generarModulosBib`), entre ellos DHT22, MPU-6050, L298N, HC-05, GPS, DS3231, Mega, ESP32-CAM y ESP32-S3. Los nuevos se colocan, se cablean y consumen corriente; el programa todavía no los controla.
- **3D**: placas y módulos con los modelos de la Biblioteca (`modAlta`, `mcuAlta`), pantallas LCD/OLED en vivo, brazo del servo que gira, piezas realistas de `PB_REAL`, rótulos de pines nítidos.
- Botón **Nuevo** (vacía la mesa; Ctrl+Z lo recupera).

### 5.3 Arduino (`Ard`, `VIEWS.arduino`)
- UNO (5 V, ADC 10 bits) y ESP32 (3,3 V, ADC 12 bits, Wi-Fi); editor con errores en español; ejemplos; módulos visuales; IoT con MQTT simulado; placa real por Web Serial (versión instalable).

### 5.4 Biblioteca (`Biblio`, `VIEWS.biblioteca`)
- Buscador y filtros por categoría. Ficha con vista 3D (etiquetas, vista explosionada, pinout, calidad), datos eléctricos, pestañas de conexión (UNO / ESP32) y código.

### 5.5 Aprender (`LESSONS`, `Viz`)
- 5 lecciones con explicación, analogía, fórmula, visualización, quiz y reto; insignias.

### 5.6 Tutor de electrónica (`Tutor`, `VIEWS.tutor`, `EV_TUTOR`)
- **Módulos**: Básico, Intermedio, Avanzado, Industrial · IoT · Robótica.
- **Pestañas**: Chat (revisar circuito, código o pregunta libre), Ruta de aprendizaje (temas, fórmulas, preguntas frecuentes), Ejercicios (valores nuevos cada vez, comprobación con margen del 3 %, solución paso a paso) y Leer diagramas (esquemas SVG con preguntas).
- **IA**: dentro de Claude o con clave de API (panel "Configurar IA", guardada solo en ese navegador). Sin IA responde con su base propia. Instrucciones del agente en `docs/AGENTE_TUTOR.md`.
- Modo docente: sesión de aprendizaje (MINEDU), rúbrica y quiz (requieren IA).

### 5.7 Aulas (`Codes`)
- El docente crea aulas con código; los estudiantes generan un código **EV1** verificado con su avance.

## 6. Inventario de componentes (v13)

- **Biblioteca**: 63 componentes de `EV_DATA` (placas UNO R3, Nano, Mega 2560, ESP32 DevKit V1 30 y 38 pines, ESP32-CAM, ESP32-S3; sensores, actuadores, comunicación, visualización, alimentación, básicos y 10 CI).
- **Esquemas**: 53 componentes en 6 categorías (sin cambios desde la v12).
- **Protoboard**: 101 piezas en la bandeja, 4 placas programables y 55 módulos.

## 7. Arquitectura de `index.html` (líneas aproximadas)

| Líneas | Contenido |
|---|---|
| 1-854 | Cabecera (importmap, fuentes locales) y CSS |
| 860-1270 | Código del Web Worker de Arduino |
| 1275-1290 | Scripts de apoyo (`data/`, `js/`) y `EV_VERSION` |
| 1290-2900 | Motor: simulador MNA, compilador Arduino, `TEMPLATES`, `LESSONS`, `md()` |
| 2900-3225 | `Store`, `State`, avisos, `preguntar()`, navegación, puerta de entrada |
| 3225-4440 | `Lab`, `VIEWS.lab`, `EsqZoom` |
| 4440-4720 | `CATALOG` de Esquemas |
| 4720-5410 | `View3D` (3D de Esquemas, carga de r128) |
| 5410-5930 | `MOD_DEFS`, `generarModulosBib`, `MCU_DEFS` |
| 5930-8000 | Protoboard: `IC_DEFS`, `PB_CAT`, `Proto`, `VIEWS.proto`, `Proto3D` |
| 8000-9100 | `MCU_CODE`, `Ard`, `VIEWS.arduino` |
| 9100-9580 | `VIEWS.inicio`, Aprender, `Tutor` |
| 9580-9980 | `VIEWS.tutor`, `VIEWS.aulas`, `VIEWS.estructura` |
| 9980-10360 | `Biblio`, `VIEWS.biblioteca`, `VIEWS.ajustes`, arranque |
| 10360-fin | `dibujarMermaid` |

## 8. Limitaciones conocidas

- La IA del tutor necesita internet (y, fuera de Claude, una clave de API).
- Al abrir con doble clic (`file://`), la Biblioteca usa Three.js r128 (se ve casi igual).
- Los 27 módulos nuevos de la protoboard todavía no responden al programa.
- El broker MQTT es simulado y el intérprete de Arduino no emula el chip ciclo a ciclo.
- Inicio con Google no disponible dentro de Claude.

## 9. Reglas para continuar el proyecto

- Interfaz y comentarios en español, claros para estudiantes de 13 a 17 años.
- Trabajar por fases, con resumen y confirmación antes de la siguiente, y un commit de Git al cerrar cada fase.
- No romper funciones existentes. Subir el número `?v=` de un script cuando se modifica.
- Sin logotipos ni marcas registradas en modelos 3D ni imágenes (usar "UNO R3", "ESP32 DevKit").
- Funcionar sin internet (librerías en `libs/`), en PCs modestas, proyector y celular.
- Pinouts técnicamente correctos; los datos dudosos se marcan "por verificar".
- No usar `confirm()`/`alert()`: usar `preguntar()` y `toast()`.
