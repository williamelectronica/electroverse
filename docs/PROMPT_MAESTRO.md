# ELECTROVERSE — Prompt maestro

> Descripción completa de la aplicación **tal como está en la v12** (etiqueta `v12.0.0`).
> Sirve para reconstruir o continuar la app en el futuro. Se actualizará al cerrar la v13.

---

## 1. Identidad

| Campo | Valor |
|---|---|
| Nombre | **ELECTROVERSE** (título de la pestaña: "Electroverse Lab") |
| Subtítulo | Laboratorio de electrónica |
| Autor | Prof. William Dextre — I.E. Industrial "Japón", Llata, Huánuco, Perú |
| Versión | v12 (la portada todavía dice "versión 2027 (fase 2)") |
| Público | Docentes y estudiantes de secundaria (13 a 17 años), institutos y universidades del Perú |
| Idioma | Todo en español, con lenguaje sencillo y analogías cotidianas |
| Objetivo | Aprender, simular y programar electrónica real sin necesitar componentes físicos: circuitos en esquema y en protoboard (2D y 3D), Arduino y ESP32 con IoT, lecciones, tutor con IA y aulas para el docente |

## 2. Tecnología

- **Un solo archivo `index.html`** (≈757 KB, ≈8 950 líneas) con HTML, CSS y JavaScript puro (sin frameworks ni compilación).
- **Simulador de circuitos propio** (análisis nodal modificado, MNA): régimen DC y transitorio, modelos de componentes con valores de hojas de datos, lógica digital mixta (compuertas que manejan LEDs y viceversa) y tabla de verdad automática.
- **Intérprete de Arduino propio**: compila un subconjunto de C++ a JavaScript y lo ejecuta en un **Web Worker** (código fuente en `<script id="ard-worker-src">`), con pausas en cada bucle para que la página nunca se congele. Emula las librerías más usadas: Servo, LiquidCrystal / LiquidCrystal_I2C, DHT, Adafruit_SSD1306, Adafruit_NeoPixel, MFRC522, Adafruit_BME280, HX711, OneWire / DallasTemperature, WiFi, WiFiClient(Secure) y PubSubClient.
- **3D**: Three.js **r128**, con carga diferida desde cdnjs (≈600 KB, solo al abrir la vista 3D). `WebGLRenderer`, `MeshStandardMaterial`, `HemisphereLight` + `DirectionalLight`, texturas de texto con `CanvasTexture`, órbita de cámara programada a mano (sin OrbitControls), pellizco y dos dedos en celular, liberación de memoria (`dispose`) al salir.
- **Esquemas y protoboard 2D**: SVG generado por código.
- **Fuentes**: Google Fonts (Atkinson Hyperlegible para el texto, Chakra Petch para títulos, JetBrains Mono para código y números).
- **Guardado**: `localStorage` con espacio de nombres `ev1:` por perfil. Dentro de Claude también usa las capacidades del artefacto (`window.claude.use('user' | 'db' | 'sample' | 'room')`) para la cuenta, la nube, el tutor IA y el broker MQTT de la clase. Fuera de Claude pasa solo a modo local.
- **Diagramas**: Mermaid (lo inyecta el entorno de Claude; se usa solo en la sección Estructura).

## 3. Estilo visual

- Concepto: **"laboratorio holográfico"**. Paneles de vidrio translúcido (`backdrop-filter: blur`) sobre una rejilla de puntos tipo protoboard en penumbra. El color aparece solo donde hay voltaje.
- Tema oscuro por defecto, con tema claro (sigue al sistema o se elige con un botón). Colores en variables CSS: cian `#22e5ff` (acento), violeta, magenta, lima (voltaje positivo), ámbar (corriente), verde OK, ámbar aviso, rojo error.
- Iconos SVG propios con trazos de electrónica.
- Estudio a pantalla completa en Esquemas y Protoboard: barra superior, categorías a la izquierda, instrumentos a la derecha y paneles flotantes. El banco de trabajo es oscuro, con cuadrícula de laboratorio.
- **Iluminación del espacio**: Día / Taller / Noche (los LED y pantallas brillan más en la oscuridad).
- **Calidad 3D**: Automática / Alta.
- **Rendimiento adaptable**: mide los FPS y, si bajan de 42, activa "efectos ligeros" (quita los desenfoques).
- **Accesibilidad**: tamaño de letra ajustable, movimiento reducido, foco visible y etiquetas `aria`.
- **Celular**: navegación inferior, botones de 36 px o más, 3D con pellizco.

## 4. Navegación (rutas con `#`)

| Ruta | Sección | Notas |
|---|---|---|
| `#inicio` | Inicio | Portada, estadísticas de avance y accesos rápidos |
| `#lab` | **Esquemas** | Laboratorio de esquemas (2D, 3D o ambas) |
| `#proto` | **Protoboard** | Protoboard de 830 puntos con placas de microcontrolador |
| `#arduino` | **Arduino** | Editor, simulación de placa, monitor serie, plotter, módulos, IoT y USB |
| `#aprender` / `#leccion-lN` | Aprender | Lecciones con visualizaciones, quiz y reto |
| `#tutor` | Tutor IA | Chat que recibe el contexto del circuito o del código |
| `#aulas` | Aulas | Solo escritorio. El docente crea aulas con código; los estudiantes envían su avance (código EV1) |
| `#estructura` | Estructura | Solo escritorio. Documento del proyecto: módulos, arquitectura objetivo, hoja de ruta y control de calidad |
| `#ajustes` | Ajustes | Solo escritorio. Perfil, tema, letra, efectos, cerrar sesión o cambiar de perfil |

**Puerta de entrada**: al abrir la app se pide sesión o perfil local, el rol (estudiante o docente) y el consentimiento de privacidad. Solo se guarda un id opaco y un alias (Ley N.º 29733).

## 5. Secciones en detalle

### 5.1 Esquemas (`VIEWS.lab`, objeto `Lab`)
- Rejilla SVG (`#board`, `viewBox` fijo `0 0 W_BOARD H_BOARD`) donde se colocan componentes y cables entre puntos.
- Herramientas: seleccionar, cable, componentes, punta roja/negra del multímetro, canales 1 y 2 del osciloscopio, girar (R), deshacer y rehacer (Ctrl+Z / Ctrl+Y) y guardar.
- Plantillas: LED con resistencia, divisor de voltaje, carga y descarga RC, filtro RC pasa bajos, rectificador de media onda, LEDs en paralelo, lienzo vacío, más plantillas de semiconductores, integrados y lógica digital. También "Mis circuitos" guardados.
- Simulación en vivo: colores según voltaje, animación del flujo de corriente, componentes quemados con humo y marca roja.
- Instrumentos: multímetro (V, A, Ω, W) y osciloscopio de 2 canales (tiempo/div y V/div). Paneles de Propiedades y Diagnóstico (avisos, tabla de verdad, botón "Tutor").
- Vistas: 2D, 3D, o 3D + 2D (el 3D lo maneja `View3D`).
- **No tiene zoom**: el SVG ocupa el 100 % del ancho (mínimo 640 px) dentro de un contenedor con barra de desplazamiento. No hay manejo de rueda ni de pellizco, y el `viewBox` nunca cambia.

### 5.2 Protoboard (`VIEWS.proto`, objeto `Proto`)
- Protoboard de 830 puntos (columnas de 5 huecos conectadas, rieles + y − a lo largo), una o varias placas.
- Bandeja de componentes por categorías, cables de colores, piezas arrastrables (pieza completa, una sola pata o un módulo).
- Placas de microcontrolador sobre la mesa (UNO y ESP32 DevKit dibujados con su pinout), con código propio que se puede pasar al laboratorio Arduino.
- Montajes de ejemplo, puntas de medición y conversión del montaje al circuito del simulador.
- Vista superior SVG con botones − / + (zoom simple de 1× a 3× cambiando el ancho) y vista 3D (`Proto3D`).

### 5.3 Arduino (`VIEWS.arduino`, objeto `Ard`)
- Placas: **Arduino UNO** (lógica de 5 V, ADC de 10 bits, PWM en 3, 5, 6, 9, 10 y 11, LED en 13) y **ESP32 DevKit** (3,3 V, ADC de 12 bits, Wi-Fi, LED en 2, aviso de ADC2).
- Editor con resaltado de sintaxis, números de línea y lista de errores en español.
- Ejemplos: Blink, Semáforo, Potenciómetro → brillo PWM, Pulsador enciende LED, Secuencia de luces, LDR con alarma, Termómetro LM35 + plotter, y Programa con errores para practicar.
- Simulación: LEDs por pin, pulsador, entradas analógicas y digitales configurables por placa, monitor serie, plotter, sonido del buzzer.
- Módulos visuales: LCD 16x2, OLED, NeoPixel, buzzer pasivo, servo, relé, ultrasónico, DHT, BME280, DS18B20, HX711, RFID, joystick, teclado, final de carrera, reed, ACS712 y sensor de voltaje.
- **IoT**: Wi-Fi simulado (solo ESP32), broker MQTT de la clase y panel IoT con tarjetas y minigráficas.
- **Placa real por USB** (Web Serial): monitor y plotter con Arduino o ESP32 reales. Solo en la versión instalable, con Chrome o Edge.

### 5.4 Aprender (`LESSONS`, `Viz`)
- Lecciones: Voltaje, corriente y resistencia · Ley de Ohm · El LED y su resistencia · El capacitor y la constante de tiempo · Arduino: salidas digitales.
- Cada lección trae explicación, analogía, fórmula, visualización interactiva, quiz y un **reto** que abre una plantilla en Esquemas o un ejemplo en Arduino. Hay insignias (`BADGES`) por avance.

### 5.5 Tutor IA (`Tutor`)
- Chat con Markdown mínimo. Recibe automáticamente el contexto: circuito, montaje de protoboard o código Arduino con sus errores. Necesita las capacidades de Claude; en la versión instalable solo da el diagnóstico automático.

### 5.6 Aulas (`Codes`)
- El docente crea aulas con código. Los estudiantes generan un código **EV1** verificado con su avance, y el docente lo registra.

## 6. Inventario de componentes (v12)

**Esquemas — 53 componentes** en 6 categorías (Básicos, Fuentes, Semiconductores, Integrados, Lógica digital, Sensores y cargas):
resistencia, capacitor, bobina, potenciómetro, interruptor, pulsador, fusible, batería/fuente DC, generador de funciones, tierra, reguladores 7805 / 7812 / AMS1117-3,3, LED, diodos 1N4007 / 1N4148 / 1N5819 / Zener, transistores 2N2222 / BC547 / TIP31C / 2N3906 / BC557, MOSFET 2N7000 / IRFZ44N / IRF9540, LM358, NE555, compuertas AND / OR / NOT / NAND / NOR / XOR / XNOR / buffer (74HC08, 32, 04, 00, 02, 86, 266, 125), flip-flops D / JK / T, latch SR, contador 74HC161, sumador completo, multiplexor 74HC157, decodificador 74HC139, display de 7 segmentos con decodificador, interruptor lógico, reloj, sonda lógica, LDR, NTC 10 kΩ, lámpara, motor DC y zumbador.

**Protoboard — 44 piezas**: Arduino UNO, ESP32 DevKit, batería de 9 V, portapilas 3×AA, fuente de laboratorio, resistencia, potenciómetro, capacitores cerámico y electrolítico, LDR, NTC, LED 5 mm, diodos, Zener 5,1 V, LM35, BJT, MOSFET, 7805, chips 74HC00 / 02 / 04 / 08 / 32 / 86 / 74 / 161 / 138 / 595, CD4511, CD4017, NE555, LM358, display de 7 segmentos, pulsador de 4 patas, interruptor deslizante, DIP switch, zumbador, motor DC y cable puente.

**Arduino — sensores (19 + módulos)**: potenciómetro, LDR, LM35, MQ-2, MQ-135, humedad de suelo, flama (analógico y digital), sonido KY-038, ACS712, sensor de voltaje, joystick, pulsador, PIR, IR de obstáculos, efecto Hall, inclinación, final de carrera e interruptor magnético. A esto se suman los módulos de la sección 5.3.

**Placas con pinout**: Arduino UNO y ESP32 DevKit (no hay Nano, Mega, ESP32-CAM ni ESP32-S3).

## 7. Arquitectura del código (mapa del archivo)

| Líneas (aprox.) | Contenido |
|---|---|
| 1-677 | CSS: tema, cáscara de la app, paneles, laboratorio, Arduino, lecciones, tutor, protoboard, estudio a pantalla completa |
| 681-1099 | Código del Web Worker de Arduino: `BOARDS`, `DEVICES` (librerías), Wi-Fi y API de Arduino |
| 1100-2616 | Motor: modelos de componentes, red, simulador MNA, lógica digital, tabla de verdad, formato SI, **compilador Arduino**, `TEMPLATES`, `ARD_EXAMPLES`, `LESSONS`, `BADGES` |
| 2617-3015 | Iconos, avisos, Markdown, `Store`, `State`, `Luz`, `Prefs`, `Perf`, navegación, puerta de entrada, `TOOLS` |
| 3016-3773 | `Lab` (Esquemas) y `VIEWS.lab` |
| 3774-4047 | `CATALOG` de Esquemas: símbolos 2D, propiedades e instrumentos |
| 4048-4692 | `View3D` (3D de Esquemas) |
| 4693-5140 | Módulos de Arduino (`MODX`, `MOD_DEFS`) y sensores |
| 5141-6976 | Protoboard: `IC_DEFS`, `PB_CAT`, dibujo realista, `Proto`, `VIEWS.proto`, `Proto3D` |
| 6977-7995 | `MCU_CODE`, `BOARD_INFO`, sensores, `Ard`, `MOD_VIEWS`, `Iot`, `RealSerial`, dibujo de placas |
| 7996-8873 | Vistas: Arduino, Inicio, Aprender, `Viz`, `Tutor`, Aulas, Estructura, Ajustes y arranque |
| 8875-fin | Bloque de Mermaid inyectado por el entorno de Claude (`/_runtime/...`) |

## 8. Limitaciones conocidas (registradas en la propia app)

- Inicio con Google no disponible dentro de Claude (se usa la cuenta de Claude); la versión instalable usa perfiles por computadora.
- El broker MQTT es simulado. El intérprete de Arduino no emula el chip ciclo a ciclo.
- Subir programas a placas reales necesitaría un compilador en un servidor.
- La propia app informa de 477 pruebas automáticas superadas (motor contra teoría, componentes, placas y compilador, protoboard).

## 9. Reglas para continuar el proyecto

- Interfaz y comentarios en español, claros para estudiantes de 13 a 17 años.
- Trabajar por fases, con resumen y confirmación antes de la siguiente, y un commit de Git al cerrar cada fase.
- No romper funciones existentes.
- Sin logotipos ni marcas registradas en modelos 3D ni imágenes (usar "UNO R3", "ESP32 DevKit").
- Funcionar sin internet (librerías en `libs/`), en PCs modestas, proyector y celular.
- Pinouts técnicamente correctos; los datos dudosos se marcan "por verificar".
