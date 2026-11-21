# Checklist de pruebas — Electroverse v14

Marca cada punto antes de publicar. **(A)** = lo comprobé automáticamente al cerrar la v13 · **(M)** = pruébalo tú a mano.

## Arranque y sin internet
- [x] (A) La página carga sin errores de consola con el servidor local.
- [x] (A) No pide nada a internet: Three.js r128/r160, Mermaid y fuentes salen de `libs/`.
- [x] (A) Las 7 fuentes cargan (Atkinson Hyperlegible, Chakra Petch, JetBrains Mono).
- [ ] (M) **Doble clic en `index.html`** (file://): abre, la Biblioteca muestra el 3D y la Protoboard 3D funciona.
- [ ] (M) Con el WiFi apagado: todas las secciones funcionan menos la IA del tutor.

## Secciones
- [x] (A) Inicio, Esquemas, Protoboard, Arduino, Biblioteca, Aprender, Tutor, Aulas, Estructura y Ajustes abren sin errores.
- [x] (A) Estructura dibuja los 2 diagramas y muestra "Acerca de esta versión" (v13.0.0).
- [x] (A) Inicio, Estructura y Ajustes muestran la versión 13.0.0.

## Esquemas
- [x] (A) Botón **Nuevo**: muestra el diálogo, vacía el lienzo y Ctrl+Z lo recupera (también con `confirm()` bloqueado, como en Claude).
- [ ] (M) Zoom con rueda, pellizco (celular), teclas + − 0 y "Ajustar".
- [ ] (M) Exportar PNG y SVG; imprimir en A4 horizontal.

## Protoboard
- [x] (A) Botón **Nuevo** con diálogo y deshacer.
- [x] (A) Los 55 módulos se colocan y alimentan sin errores.
- [x] (A) Carga: UNO + 37 módulos + 88 cables → 6,3 ms por cuadro; programa en marcha 3–18 ms.
- [x] (A) Brazo del servo y pantalla LCD/OLED siguen funcionando en 3D.
- [ ] (M) Arrastrar piezas y cables en una PC modesta y en el proyector.

## Biblioteca
- [x] (A) Las 63 fichas abren sin errores.
- [x] (A) 3D con Three.js r160 local y con r128 (modo `?r128`, el mismo que se usa con doble clic).
- [ ] (M) Girar, acercar, vista explosionada, pinout y calidad Alta/Media/Baja.

## Tutor
- [x] (A) 4 módulos × 4 pestañas (Chat, Ruta, Ejercicios, Diagramas) sin errores.
- [x] (A) 27 generadores de ejercicios × 30 intentos sin valores inválidos.
- [x] (A) Sin IA responde con la base propia; con clave inválida avisa y responde igual.
- [ ] (M) Con una clave de API válida: respuesta en streaming y diagrama mermaid dibujado en el chat.
- [ ] (M) Dentro de Claude: el tutor usa la IA de la cuenta.

## Celular
- [ ] (M) Navegación inferior, Biblioteca y Tutor legibles a 375 px de ancho.
- [ ] (M) Protoboard 3D con pellizco y dos dedos.

## Cuentas y aulas en línea (v14)
- [x] (M) Entrar con Google y con correo en el proyecto real (lo probó el docente).
- [x] (M) Docente crea un aula; estudiante (otra cuenta) se une y envía su avance; el docente lo ve al instante.
- [x] (A) Con Firebase simulado: solicitud de docente → aprobación del administrador → rol activado solo al volver a entrar.
- [x] (A) Sin configuración de Firebase la app funciona igual que la v13 y no carga Firebase.
- [ ] (M) En la página publicada: entrar con Google (el dominio github.io está autorizado).

## Servidor de IA (preparado, sin activar)
- [x] (A) `npm run prueba` en `servidor-ia/`: 27 de 27 (token, orígenes, límites, errores, respuesta en vivo).
- [x] (A) Tutor contra el servidor local simulado: respuesta en vivo, aviso de preguntas restantes y límite.
- [ ] (M) Instalar en Cloudflare y hacer una pregunta real (docs/SERVIDOR_IA.md).
