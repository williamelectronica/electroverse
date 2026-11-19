# Electroverse v13 — Laboratorio de electrónica

Plataforma educativa para aprender, simular y programar electrónica en el navegador, pensada para estudiantes de secundaria técnica (EPT), institutos y universidades del Perú.

**Autor:** Prof. William Dextre — I.E. Industrial "Japón", Llata, Huánuco, Perú.

## Qué incluye

- **Esquemas**: arma circuitos, mídelos con multímetro y osciloscopio, acerca con zoom, sigue las conexiones y exporta a PNG, SVG o papel.
- **Protoboard 2D y 3D**: 830 puntos, 4 placas programables (UNO, Nano, ESP32 30 y 38 pines) y 55 módulos con modelos 3D realistas.
- **Arduino y ESP32**: editor con errores en español, simulación, monitor serie, plotter e IoT con MQTT simulado.
- **Biblioteca**: 63 componentes con modelo 3D, pinout, conexión y código de ejemplo.
- **Tutor de electrónica**: módulos Básico, Intermedio, Avanzado e Industrial · IoT · Robótica, con ejercicios resueltos paso a paso y lectura de diagramas.
- **Lecciones** y **aulas** para el docente.

## Cómo abrirla

**Opción 1 — doble clic (sin instalar nada):** abre `index.html` con Google Chrome o Microsoft Edge. Funciona sin internet; la Biblioteca usa un motor 3D compatible (Three.js r128).

**Opción 2 — con un servidor local (recomendada para el aula):** en PowerShell, dentro de esta carpeta:

```powershell
python -m http.server 8000
```

Luego abre `http://localhost:8000` en el navegador. Si `python` no se reconoce, usa `py -m http.server 8000`.

**Opción 3 — en internet:** publicada con GitHub Pages (ver el enlace del repositorio).

## Tutor con IA

Sin configurar nada, el tutor responde con su propia base de conocimiento (sin internet). Para respuestas abiertas con IA:

- Ábrela dentro de Claude, o
- pega una clave de API de Anthropic en **Tutor → Configurar IA**. La clave se guarda solo en ese navegador; no la uses en computadoras públicas ni de estudiantes.

## Estructura de archivos

| Ruta | Contenido |
|---|---|
| `index.html` | La aplicación (HTML, CSS y JavaScript) |
| `data/componentes.js` | Datos de los 63 componentes de la Biblioteca |
| `data/tutor.js` | Base de conocimiento del tutor, ejercicios, diagramas e instrucciones del agente |
| `js/visor3d.js` | Visor 3D de la Biblioteca |
| `js/modelos3d.js` | Modelos 3D de los componentes |
| `js/realistas3d.js` | Modelos 3D realistas de la protoboard |
| `libs/` | Three.js r128 y r160, Mermaid y fuentes (para funcionar sin internet) |
| `docs/PROMPT_MAESTRO.md` | Descripción completa de la app para continuarla |
| `docs/AGENTE_TUTOR.md` | Instrucciones del agente tutor de electrónica |
| `docs/CHECKLIST_PRUEBAS.md` | Lista de pruebas antes de publicar |
| `docs/AUDITORIA_V12.md` | Auditoría de la versión 12 |
| `CHANGELOG.md` | Registro de cambios por versión |

## Requisitos

- Navegador moderno: Chrome, Edge o Firefox (escritorio o celular).
- PC modesta: la calidad 3D baja sola si el equipo es lento.

## Licencias de terceros

- [Three.js](https://threejs.org) — licencia MIT.
- [Mermaid](https://mermaid.js.org) — licencia MIT.
- Fuentes Atkinson Hyperlegible, Chakra Petch y JetBrains Mono — SIL Open Font License.
