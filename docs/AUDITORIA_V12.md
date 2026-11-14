# Auditoría de Electroverse v12 (Fase 0)

Revisión sin modificar el código. Fuente: artefacto de Claude guardado como `index.html` (etiqueta `v12.0.0`).

## 1. Estructura y tecnologías
- Un solo `index.html` de ≈757 KB (CSS + JS puro, sin compilación). No tiene carpetas `data/`, `libs/` ni `docs/` (esta carpeta se creó ahora).
- Three.js r128 desde cdnjs (carga diferida). Google Fonts. Mermaid inyectado por Claude.
- Guardado en `localStorage`. Nube, tutor IA y MQTT de clase solo funcionan dentro de Claude (`window.claude`); fuera de Claude la app pasa a modo local sin romperse.

## 2. Secciones
Inicio · Esquemas · Protoboard · Arduino (con IoT y USB) · Aprender · Tutor IA · Aulas · Estructura · Ajustes. Detalle en `PROMPT_MAESTRO.md`.

## 3. Componentes existentes
- Esquemas: 53. Protoboard: 44. Arduino: 19 sensores + 18 módulos.
- Placas: solo **Arduino UNO** y **ESP32 DevKit**.
- **Faltan para la v13**: Nano, Mega 2560, ESP32 38 pines, ESP32-CAM, ESP32-S3. También faltan los sensores DHT22, MPU-6050, TCS3200, BMP280, pulso cardíaco, TCRT5000 y la mayoría de los módulos de la Fase 1.4, y los chips 74LS47 y la serie 74LS como tal (hoy hay 74HC equivalentes).

## 4. Esquemas: por qué no tiene zoom
- El SVG `#board` tiene un `viewBox` fijo y `width: 100%; min-width: 640px` dentro de `#lab-wrap` con `overflow: auto`.
- No hay manejo de rueda, pellizco ni arrastre de la vista, y el `viewBox` nunca cambia. Solo se puede desplazar con las barras.
- Punto a favor: la conversión de clic a coordenadas usa `getScreenCTM()`. Si en la v13 se cambia el `viewBox` para hacer zoom, la colocación de piezas y cables seguirá funcionando.

## 5. Problemas encontrados
1. **Datos dispersos**: la información de componentes está repartida en al menos 8 lugares (`CATALOG`, `PB_CAT`, `IC_DEFS`, `MOD_DEFS`, `DEVICES` del worker, `ANALOG_SENSORS`, `DIGITAL_SENSORS`, `BOARDS`/`BOARD_INFO`). Un mismo componente (por ejemplo el BC547 o el 74HC08) aparece por separado en Esquemas y en Protoboard.
2. **Código 3D duplicado**: hay dos motores 3D casi iguales (`View3D` para Esquemas y `Proto3D` para Protoboard), cada uno con su renderer, su órbita de cámara y su manejo de pellizco y rueda programados a mano.
3. **3D básico**: Three.js r128 (2021), sin `PMREMGenerator`/`RoomEnvironment`, sin tone mapping ACES ni sombras, sin OrbitControls. El selector de calidad solo tiene Automática/Alta (no Alta/Media/Baja).
4. **Depende de internet**: Three.js y las fuentes se descargan de CDN. Fuera de Claude, el bloque de Mermaid apunta a `/_runtime/...` y no carga (solo afecta al diagrama de Estructura).
5. **Restos del entorno de Claude**: la primera línea (esqueleto `<!doctype>` con estilos) y el bloque final de Mermaid los agregó Claude al publicar. Conviene limpiarlos en la versión local.
6. **Versión inconsistente**: la portada dice "versión 2027 (fase 2)" y en ningún lugar dice v12.
7. **Rendimiento**: archivo único muy grande (todo se descarga y analiza al inicio), 86 asignaciones de `innerHTML` que redibujan secciones completas, y 23 usos de `requestAnimationFrame`. Hay buenas prácticas ya presentes: 3D diferido, `dispose`, dibujo solo cuando hay cambios y efectos ligeros automáticos.
8. **Marcas**: las placas se rotulan "UNO" y "ESP32 DevKit" (correcto), pero los nombres de catálogo dicen "Arduino UNO"; revisar que no se rotule la marca sobre los modelos 3D.
