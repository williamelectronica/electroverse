/* =====================================================================
   ELECTROVERSE v13 · Modelos 3D de la Biblioteca
   ---------------------------------------------------------------------
   Cada componente se arma con las piezas de la fábrica (js/visor3d.js).
   Medidas en milímetros, aproximadas a las piezas reales.
   Sin logotipos ni marcas: solo nombres genéricos ("UNO R3", "ESP32 DevKit").

   Hay tres tipos de constructores:
   1) Placas y piezas especiales: una función propia (abajo).
   2) Módulos: una "receta" (ESPECS) que dice tamaño de la PCB, pines y piezas.
   3) Circuitos integrados: se dibujan solos a partir de sus pines.
   ===================================================================== */
(function () {
  'use strict';
  const V3 = window.Visor3D;
  if (!V3) return;
  const M = V3.modelos;

  /* ---------- Colores de PCB ---------- */
  const AZUL = '#1f4fb4', ROJO = '#a8202b', NEGRO = '#1c1e23', VERDE = '#1b6a3c', MORADO = '#552a86', TEAL = '#08546b';

  /* Etiquetas del pinout en la serigrafía (texto blanco pequeño) */
  function rotulos(F, ctx, W, D, puntos, opciones = {}) {
    const dx = opciones.dx || 0, dz = opciones.dz || 0, rot = opciones.rot || 0, alto = opciones.alto || 1.05, alinear = opciones.alinear || 'center';
    puntos.forEach(p => {
      const txt = String(p.info && p.info.nombre || '').replace(/^D(?=\d)/, '').replace(/^GPIO\s*/, '');
      F.texto(ctx, txt, p.x + W / 2 + dx, p.z + D / 2 + dz, alto, '#f2f4f8', { rot, alinear, peso: 700 });
    });
  }
  // Lámina de serigrafía (queda pegada a la PCB y no "vuela" en la vista explosionada)
  function serigrafia(F, W, D, dibujar, y = 1.62) {
    const s = F.pon(F.calco(W, D, dibujar, { rugosidad: .6 }), 0, y, 0);
    s.userData.esPCB = true;
    return s;
  }
  const en = (F, obj, x, z, ry = 0, y = 1.6) => F.pon(obj, x, y, z, ry);

  /* =====================================================================
     PLACAS
     ===================================================================== */

  // Pines del ATmega328P (DIP-28) para la ficha al pasar el mouse
  const PINES_328P = ['RESET', 'D0 (RX)', 'D1 (TX)', 'D2', 'D3 ~', 'D4', 'VCC', 'GND', 'XTAL1 (cristal)', 'XTAL2 (cristal)', 'D5 ~', 'D6 ~', 'D7', 'D8', 'D9 ~', 'D10 ~', 'D11 ~', 'D12', 'D13', 'AVCC', 'AREF', 'GND', 'A0', 'A1', 'A2', 'A3', 'A4 (SDA)', 'A5 (SCL)']
    .map((n, i) => ({ nombre: 'Pin ' + (i + 1) + ' · ' + n, tipo: /GND/.test(n) ? 'GND' : /VCC/.test(n) ? 'alimentación' : /^A\d/.test(n) ? 'analógico' : /~/.test(n) ? 'PWM' : /RX|TX/.test(n) ? 'UART' : /^D/.test(n) ? 'digital' : 'otro', funcion: 'Pata del microcontrolador conectada a ' + n }));

  function icsp(F, V, x0, z0, nombre) {
    const nombres = [{ n: 'MISO', t: 'SPI' }, { n: '5V', t: 'alimentación' }, { n: 'SCK', t: 'SPI' }, { n: 'MOSI', t: 'SPI' }, { n: 'RESET', t: 'otro' }, { n: 'GND', t: 'GND' }];
    const pts = nombres.map((e, i) => ({ x: x0 + (i % 2) * 2.54, z: z0 - Math.floor(i / 2) * 2.54, info: Object.assign(V.infoPin(e), { funcion: 'Conector ICSP: programa el chip directamente' }) }));
    return F.info(F.cabecera(pts, { modo: 'arriba' }), nombre || 'Conector ICSP', 'Permite programar el microcontrolador con un programador externo');
  }

  M['uno-r3'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), W = 68.6, D = 53.4, U = (x, y) => [x - W / 2, D / 2 - y];
    g.add(F.info(F.pcb(W, D, TEAL, { agujeros: [U(14, 2.5), U(15.3, 50.7), U(66.1, 7.6), U(66.1, 35.5)].map(p => p.concat(1.6)) }), 'Placa de circuito (PCB)', 'Une todos los componentes con pistas de cobre', { menor: true }));
    const enc = c.encabezados, arriba = enc['Lado de pines digitales'], abajo = enc['Lado de alimentación y analógicos'];
    const pA = arriba.map((n, i) => { const [x, z] = U(i < 10 ? 17.9 + i * 2.54 : 44.45 + (i - 10) * 2.54, 50.8); return { x, z, info: V.infoPin(n) }; });
    const pB = abajo.map((n, i) => { const [x, z] = U(i < 8 ? 27.9 + i * 2.54 : 50.8 + (i - 8) * 2.54, 2.54); return { x, z, info: V.infoPin(n) }; });
    g.add(F.info(F.cabecera(pA, { modo: 'hembra' }), 'Pines digitales', 'Entradas y salidas digitales D0–D13; las marcadas con ~ tienen PWM'));
    g.add(F.info(F.cabecera(pB, { modo: 'hembra' }), 'Pines de alimentación y analógicos', 'Salidas de 5 V y 3,3 V, tierras, VIN y entradas analógicas A0–A5'));
    g.add(en(F, F.usb('B'), ...U(3.5, 38.1)));
    g.add(en(F, F.jackDC(), ...U(4.5, 7.6)));
    g.add(en(F, F.info(F.dip(28, 'ATmega328P', { sub: 'MICROCONTROLADOR', pines: PINES_328P }), 'Microcontrolador ATmega328P', 'El cerebro: guarda tu programa y lo ejecuta 16 millones de pasos por segundo'), ...U(47.6, 14.6)));
    g.add(en(F, F.info(F.qfn(5, '16U2'), 'Chip USB (ATmega16U2)', 'Traduce entre el USB de la computadora y el microcontrolador'), ...U(21.5, 36.5), Math.PI / 4));
    g.add(en(F, F.cristal('hc49', '16.000'), ...U(30.5, 29.5)));
    g.add(en(F, F.boton(6, '#b8bcc4'), ...U(7.8, 48.3)));
    g.add(icsp(F, V, ...U(63.5, 29.54)));
    g.add(icsp(F, V, ...U(30.7, 46), 'Conector ICSP del chip USB'));
    g.add(en(F, F.electrolitico(6.3, 5.8), ...U(14.5, 21.5)));
    g.add(en(F, F.electrolitico(6.3, 5.8), ...U(20.5, 21.5)));
    g.add(en(F, F.sot223('REG 5V'), ...U(8.5, 22), Math.PI / 2));
    [['#ffb020', 24.5, 45.2, 'LED "L" (pin 13)'], ['#ffb020', 24.5, 42.2, 'LED TX'], ['#ffb020', 24.5, 40.2, 'LED RX']].forEach(([col, x, y, n]) => g.add(en(F, F.info(F.ledSMD(col), n, 'Parpadea cuando hay actividad', { menor: true }), ...U(x, y))));
    g.add(en(F, F.info(F.ledSMD('#3dff6a', true), 'LED ON', 'Encendido: la placa tiene energía', { menor: true }), ...U(61.5, 33)));
    [[38, 26], [40, 26], [56, 28], [12, 30], [26, 34]].forEach(([x, y], i) => g.add(en(F, F.smd(i % 2 ? 'c' : 'r'), ...U(x, y))));
    g.add(serigrafia(F, W, D, (ctx) => {
      F.texto(ctx, 'UNO R3', 40, D - 31, 4.2, '#f2f4f8', { peso: 800 });
      F.texto(ctx, 'DIGITAL (PWM ~)', 36, D - 44.5, 1.6, '#f2f4f8');
      F.texto(ctx, 'POWER', 37, D - 9.2, 1.6, '#f2f4f8'); F.texto(ctx, 'ANALOG IN', 57, D - 9.2, 1.6, '#f2f4f8');
      F.texto(ctx, 'RESET', 7.8, D - 44, 1.2, '#f2f4f8'); F.texto(ctx, 'ICSP', 64.8, D - 32.6, 1.2, '#f2f4f8', { rot: -Math.PI / 2 });
      F.texto(ctx, 'L', 27, D - 45.2, 1.1, '#f2f4f8'); F.texto(ctx, 'TX', 27.4, D - 42.2, 1.1, '#f2f4f8'); F.texto(ctx, 'RX', 27.4, D - 40.2, 1.1, '#f2f4f8'); F.texto(ctx, 'ON', 64.2, D - 33, 1.1, '#f2f4f8');
      rotulos(F, ctx, W, D, pA, { dz: 4.3, rot: -Math.PI / 2, alinear: 'right', alto: 1.1 });
      rotulos(F, ctx, W, D, pB, { dz: -4.3, rot: -Math.PI / 2, alinear: 'left', alto: 1.1 });
    }));
    return g;
  };

  M['nano'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), W = 17.8, D = 43.2, enc = c.encabezados;
    g.add(F.info(F.pcb(W, D, TEAL), 'Placa de circuito (PCB)', 'Une los componentes con pistas de cobre', { menor: true }));
    const izq = F.fila(-7.62, -17.78, 0, 2.54, enc['Izquierda (USB arriba)']), der = F.fila(7.62, -17.78, 0, 2.54, enc['Derecha (USB arriba)']);
    g.add(F.info(F.cabecera(izq, { modo: 'abajo' }), 'Pines del lado izquierdo', 'Se insertan en la protoboard'));
    g.add(F.info(F.cabecera(der, { modo: 'abajo' }), 'Pines del lado derecho', 'Se insertan en la protoboard'));
    g.add(en(F, F.usb('mini'), 0, -D / 2 + 3.4, -Math.PI / 2));
    g.add(en(F, F.info(F.qfp(7, 8, '328P'), 'Microcontrolador ATmega328P', 'El cerebro: el mismo chip que el UNO, en versión diminuta'), 0, 3, Math.PI / 4));
    g.add(en(F, F.boton(4.2, '#b8bcc4'), 0, -8));
    g.add(en(F, F.cristal('smd'), -3.6, 10.5, Math.PI / 2));
    g.add(en(F, F.sot223('REG'), 0, 15.5));
    [['#3dff6a', -3.2, -13, true, 'LED de encendido'], ['#ffb020', 3.2, -13, false, 'LED "L" (pin 13)']].forEach(([col, x, z, on, n]) => g.add(en(F, F.info(F.ledSMD(col, on), n, on ? 'Indica que hay energía' : 'Parpadea con el pin 13', { menor: true }), x, z)));
    g.add(serigrafia(F, W, D, ctx => {
      rotulos(F, ctx, W, D, izq, { dx: 2, alinear: 'left', alto: 1 });
      rotulos(F, ctx, W, D, der, { dx: -2, alinear: 'right', alto: 1 });
      F.texto(ctx, 'NANO', W / 2, D - 2.6, 1.8, '#f2f4f8', { peso: 800 });
    }));
    g.userData.direccion = [.9, 1.2, .7];
    return g;
  };

  M['mega-2560'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), W = 101.6, D = 53.3, U = (x, y) => [x - W / 2, D / 2 - y];
    const tipoMega = s => {
      if (/GND/.test(s)) return 'GND'; if (/^(5V|3\.3V|VIN|IOREF)/.test(s)) return 'alimentación';
      if (/SDA|SCL/.test(s)) return 'I2C'; if (/TX|RX/.test(s)) return 'UART'; if (/^A\d/.test(s)) return 'analógico';
      if (/AREF|RESET|NC/.test(s)) return 'otro';
      const n = parseInt(s.replace(/^D/, ''), 10);
      if (n <= 1) return 'UART'; if ((n >= 2 && n <= 13) || (n >= 44 && n <= 46)) return 'PWM'; if (n >= 50 && n <= 53) return 'SPI';
      return 'digital';
    };
    const info = s => V.infoPin({ n: s, t: tipoMega(s) });
    g.add(F.info(F.pcb(W, D, TEAL, { agujeros: [U(14, 2.5), U(15.3, 50.7), U(66.1, 7.6), U(66.1, 35.5), U(90.2, 50.7), U(96.5, 2.5)].map(p => p.concat(1.6)) }), 'Placa de circuito (PCB)', 'Une todos los componentes con pistas de cobre', { menor: true }));
    const sup = ['SCL', 'SDA', 'AREF', 'GND', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1 TX0', 'D0 RX0', 'D14 TX3', 'D15 RX3', 'D16 TX2', 'D17 RX2', 'D18 TX1', 'D19 RX1', 'D20 SDA', 'D21 SCL'];
    const pS = sup.map((n, i) => { const x = i < 10 ? 17.9 + i * 2.54 : i < 18 ? 44.45 + (i - 10) * 2.54 : 66.04 + (i - 18) * 2.54; const [X, Z] = U(x, 50.8); return { x: X, z: Z, info: info(n) }; });
    const inf = ['NC', 'IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN'].concat(Array.from({ length: 16 }, (_, i) => 'A' + i));
    const pI = inf.map((n, i) => { const x = i < 8 ? 27.9 + i * 2.54 : i < 16 ? 50.8 + (i - 8) * 2.54 : 73.66 + (i - 16) * 2.54; const [X, Z] = U(x, 2.54); return { x: X, z: Z, info: info(n) }; });
    const pD = [];
    for (let f = 0; f < 18; f++) for (let k = 0; k < 2; k++) {
      const n = f === 0 ? '5V' : f === 17 ? 'GND' : 'D' + (22 + (f - 1) * 2 + k);
      const [X, Z] = U(90.17 + k * 2.54, 49.53 - f * 2.54); pD.push({ x: X, z: Z, info: info(n) });
    }
    g.add(F.info(F.cabecera(pS, { modo: 'hembra' }), 'Pines digitales y de comunicación', 'D0–D21: incluye los puertos serie Serial1–3 y el bus I2C (20 y 21)'));
    g.add(F.info(F.cabecera(pI, { modo: 'hembra' }), 'Alimentación y entradas analógicas', 'Salidas de 5 V y 3,3 V, tierras y entradas analógicas A0–A15'));
    g.add(F.info(F.cabecera(pD, { modo: 'hembra' }), 'Conector doble D22–D53', 'Pines digitales extra; D50–D53 forman el bus SPI'));
    g.add(en(F, F.usb('B'), ...U(3.5, 38.1)));
    g.add(en(F, F.jackDC(), ...U(4.5, 7.6)));
    g.add(en(F, F.info(F.qfp(14, 25, 'ATmega2560', { alto: 1.4 }), 'Microcontrolador ATmega2560', 'El cerebro: 256 KB para tu programa y 54 pines digitales'), ...U(56, 26), Math.PI / 4));
    g.add(en(F, F.info(F.qfn(5, '16U2'), 'Chip USB (ATmega16U2)', 'Traduce entre el USB de la computadora y el microcontrolador'), ...U(21.5, 36.5), Math.PI / 4));
    g.add(en(F, F.cristal('hc49', '16.000'), ...U(31, 29.5)));
    g.add(en(F, F.boton(6, '#b8bcc4'), ...U(7.8, 48.3)));
    g.add(icsp(F, V, ...U(79, 29.54)));
    g.add(en(F, F.electrolitico(6.3, 5.8), ...U(14.5, 21.5)));
    g.add(en(F, F.electrolitico(6.3, 5.8), ...U(20.5, 21.5)));
    g.add(en(F, F.sot223('REG 5V'), ...U(8.5, 22), Math.PI / 2));
    g.add(en(F, F.info(F.ledSMD('#3dff6a', true), 'LED ON', 'La placa tiene energía', { menor: true }), ...U(73, 40)));
    g.add(serigrafia(F, W, D, ctx => {
      F.texto(ctx, 'MEGA 2560', 56, D - 40, 4, '#f2f4f8', { peso: 800 });
      rotulos(F, ctx, W, D, pS, { dz: 4.3, rot: -Math.PI / 2, alinear: 'right', alto: 1 });
      rotulos(F, ctx, W, D, pI, { dz: -4.3, rot: -Math.PI / 2, alinear: 'left', alto: 1 });
    }));
    return g;
  };

  /* ----- ESP32 DevKit (30 y 38 pines): mismo diseño, distinto largo ----- */
  function esp32DevKit(F, c, V, n) {
    const T = V.T, g = new T.Group(), W = 28.3, D = n === 15 ? 51.5 : 55.4, enc = c.encabezados, lados = Object.values(enc);
    const z0 = -(n - 1) * 2.54 / 2 + 1.5;
    g.add(F.info(F.pcb(W, D, NEGRO), 'Placa de circuito (PCB)', 'Une los componentes con pistas de cobre', { menor: true }));
    const izq = F.fila(-12.7, z0, 0, 2.54, lados[0]), der = F.fila(12.7, z0, 0, 2.54, lados[1]);
    g.add(F.info(F.cabecera(izq, { modo: 'abajo' }), 'Pines del lado izquierdo', 'GPIO, entradas analógicas y alimentación'));
    g.add(F.info(F.cabecera(der, { modo: 'abajo' }), 'Pines del lado derecho', 'GPIO, buses I2C/SPI/UART y alimentación'));
    g.add(en(F, F.moduloWifi(18, 25.5, 'ESP32-WROOM-32'), 0, -D / 2 + 12.75 - 2.5));
    g.add(en(F, F.usb(n === 15 ? 'micro' : 'micro'), 0, D / 2 - 2.2, Math.PI / 2));
    g.add(en(F, F.info(F.boton(4.2, '#2a2a2a'), 'Botón EN', 'Reinicia el ESP32'), -7.8, D / 2 - 5.2));
    g.add(en(F, F.info(F.boton(4.2, '#2a2a2a'), 'Botón BOOT (GPIO 0)', 'Mantenlo presionado si la carga del programa no empieza'), 7.8, D / 2 - 5.2));
    g.add(en(F, F.sot223('AMS1117 3.3'), -3.5, 4.5, Math.PI / 2));
    g.add(en(F, F.info(F.qfn(4.5, 'USB-UART'), 'Chip USB a serie', 'Convierte el USB de la computadora en el puerto serie del ESP32'), 4, 5));
    g.add(en(F, F.info(F.ledSMD('#ff3b30', true), 'LED de encendido', 'Indica que la placa tiene energía', { menor: true }), -3, D / 2 - 9.5));
    g.add(en(F, F.info(F.ledSMD('#2f7bff'), 'LED azul (GPIO 2)', 'Se controla desde el programa con el pin 2', { menor: true }), 3, D / 2 - 9.5));
    [[-4, -.5], [4, -.5], [-6, 9], [6, 10]].forEach(([x, z], i) => g.add(en(F, F.smd(i % 2 ? 'c' : 'r'), x, z)));
    g.add(serigrafia(F, W, D, ctx => {
      rotulos(F, ctx, W, D, izq, { dx: 1.9, alinear: 'left', alto: .95 });
      rotulos(F, ctx, W, D, der, { dx: -1.9, alinear: 'right', alto: .95 });
      F.texto(ctx, n === 15 ? 'ESP32 DevKit V1' : 'ESP32 DevKit', W / 2, D / 2 + 11, 1.5, '#f2f4f8', { peso: 800 });
      F.texto(ctx, 'EN', W / 2 - 7.8, D - 1.6, 1, '#f2f4f8'); F.texto(ctx, 'BOOT', W / 2 + 7.8, D - 1.6, 1, '#f2f4f8');
    }));
    g.userData.direccion = [.9, 1.25, .75];
    return g;
  }
  M['esp32-devkit-30'] = (F, c, V) => esp32DevKit(F, c, V, 15);
  M['esp32-devkit-38'] = (F, c, V) => esp32DevKit(F, c, V, 19);

  M['esp32-cam'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), W = 27, D = 40.5, lados = Object.values(c.encabezados);
    g.add(F.info(F.pcb(W, D, NEGRO), 'Placa de circuito (PCB)', 'Une los componentes con pistas de cobre', { menor: true }));
    const izq = F.fila(-11.43, 16.5, 0, -2.54, lados[0]), der = F.fila(11.43, 16.5, 0, -2.54, lados[1]);
    g.add(F.info(F.cabecera(izq, { modo: 'abajo' }), 'Pines del lado izquierdo', '5V, GND y GPIO (varios los usa la microSD)'));
    g.add(F.info(F.cabecera(der, { modo: 'abajo' }), 'Pines del lado derecho', '3V3, GPIO 0, VCC y el puerto serie U0R/U0T'));
    g.add(en(F, F.moduloWifi(18, 21, 'ESP32-S', { antena: 5.5, sub: '4 MB PSRAM' }), 0, -D / 2 + 10.5 - .5));
    g.add(en(F, F.info(F.caja(14.5, 1.9, 15, F.M.aluminio(), .3), 'Ranura para microSD', 'Guarda fotos y videos en una tarjeta de memoria'), 0, 9.5, 0, 1.6 + .95));
    const cam = F.grupo(F.pon(F.caja(8.5, 4.5, 8.5, F.M.negro(), .4), 0, 2.25, 0), F.pon(F.cil(3.4, 3.4, 3, F.M.negro()), 0, 6, 0), F.pon(F.cil(2.4, 2.4, .2, F.M.vidrio('#3a4a8a', .9)), 0, 7.6, 0));
    g.add(en(F, F.info(cam, 'Cámara OV2640 (2 MP)', 'Captura las imágenes que el ESP32 envía por Wi-Fi'), 0, 10, 0, 1.6 + 1.9));
    g.add(en(F, F.info(F.caja(8, .2, 7, F.M.plastico('#9a6a24', .5)), 'Cable plano de la cámara', 'Une la cámara con su conector', { menor: true }), 0, 2.5, 0, 1.75));
    g.add(en(F, F.info(F.grupo(F.pon(F.caja(3, .9, 3, F.M.blanco()), 0, .45, 0), F.pon(F.caja(2.2, .3, 2.2, F.M.vidrio('#fff8d0', .9)), 0, 1, 0)), 'LED flash (GPIO 4)', 'Luz muy brillante para iluminar la foto'), -6.5, 2.5));
    g.add(F.pon(F.info(F.boton(4, '#2a2a2a'), 'Botón RESET (por detrás)', 'Reinicia la placa'), 7, 0, 14, 0, Math.PI));
    g.add(serigrafia(F, W, D, ctx => { F.texto(ctx, 'ESP32-CAM', W / 2, D - 2.2, 1.4, '#f2f4f8', { peso: 800 }); }));
    g.userData.direccion = [.8, 1.2, .9];
    return g;
  };

  M['esp32-s3-devkit'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), W = 25.4, D = 62.7;
    const J1 = ['3V3', '3V3', 'RST', '4', '5', '6', '7', '15', '16', '17', '18', '8', '3', '46', '9', '10', '11', '12', '13', '14', '5V', 'GND'];
    const J3 = ['GND', 'TX 43', 'RX 44', '1', '2', '42', '41', '40', '39', '38', '37', '36', '35', '0', '45', '48', '47', '21', '20', '19', 'GND', 'GND'];
    const infoS3 = s => {
      if (/GND/.test(s)) return { n: s, t: 'GND', f: 'Tierra' };
      if (/3V3|5V/.test(s)) return { n: s, t: 'alimentación', f: s === '5V' ? 'Entrada/salida de 5 V' : 'Salida de 3,3 V' };
      if (s === 'RST') return { n: s, t: 'otro', f: 'Reinicio' };
      if (/TX|RX/.test(s)) return { n: s, t: 'UART', f: 'Puerto serie del conector UART' };
      const k = +s;
      if (k >= 1 && k <= 10) return { n: 'GPIO ' + k, t: 'analógico', f: 'E/S · ADC1 · táctil' };
      if (k >= 11 && k <= 18) return { n: 'GPIO ' + k, t: 'analógico', f: 'E/S · ADC2 (no usar con Wi-Fi)' };
      if (k === 19 || k === 20) return { n: 'GPIO ' + k, t: 'otro', f: 'USB nativo (' + (k === 19 ? 'D−' : 'D+') + ')' };
      if (k >= 35 && k <= 37) return { n: 'GPIO ' + k, t: 'otro', f: 'Lo usa la PSRAM en algunos módulos: evítalo' };
      if (k === 0) return { n: 'GPIO 0', t: 'digital', f: 'Botón BOOT · pin de arranque' };
      if (k === 3 || k === 45 || k === 46) return { n: 'GPIO ' + k, t: 'digital', f: 'Pin de arranque: úsalo con cuidado' };
      if (k === 48) return { n: 'GPIO 48', t: 'digital', f: 'LED RGB (según la revisión de la placa)' };
      return { n: 'GPIO ' + k, t: 'digital', f: 'Entrada/salida de uso general' };
    };
    const z0 = -26.67 + 1;
    const izq = J1.map((s, i) => ({ x: -11.43, z: z0 + i * 2.54, info: V.infoPin(infoS3(s)) }));
    const der = J3.map((s, i) => ({ x: 11.43, z: z0 + i * 2.54, info: V.infoPin(infoS3(s)) }));
    g.add(F.info(F.pcb(W, D, NEGRO), 'Placa de circuito (PCB)', 'Une los componentes con pistas de cobre', { menor: true }));
    g.add(F.info(F.cabecera(izq, { modo: 'abajo' }), 'Conector J1 (izquierda)', 'GPIO, alimentación y reinicio'));
    g.add(F.info(F.cabecera(der, { modo: 'abajo' }), 'Conector J3 (derecha)', 'GPIO, puerto serie y tierras'));
    g.add(en(F, F.moduloWifi(18, 25.5, 'ESP32-S3-WROOM-1', { sub: 'Wi-Fi + Bluetooth LE' }), 0, -D / 2 + 12.75 - 3));
    g.add(en(F, F.info(F.usb('C'), 'Conector USB-C "UART"', 'Para cargar programas y ver el monitor serie'), -5.5, D / 2 - 2.6, Math.PI / 2));
    g.add(en(F, F.info(F.usb('C'), 'Conector USB-C "USB" nativo', 'El ESP32-S3 puede actuar como teclado, ratón o memoria USB'), 5.5, D / 2 - 2.6, Math.PI / 2));
    g.add(en(F, F.info(F.boton(3.6, '#2a2a2a'), 'Botón BOOT', 'Modo de carga del programa'), -7.5, D / 2 - 9));
    g.add(en(F, F.info(F.boton(3.6, '#2a2a2a'), 'Botón RST', 'Reinicia la placa'), 7.5, D / 2 - 9));
    g.add(en(F, F.info(F.grupo(F.pon(F.caja(5, 1.4, 5, F.M.blanco(), .3), 0, .7, 0), F.pon(F.caja(3.4, .3, 3.4, F.M.luz('#9b5cff', 1.6)), 0, 1.5, 0)), 'LED RGB direccionable', 'Puede mostrar cualquier color desde el programa'), 0, 12));
    g.add(en(F, F.sot223('REG 3.3V'), -3.5, 4, Math.PI / 2));
    g.add(en(F, F.info(F.qfn(4, 'USB-UART'), 'Chip USB a serie', 'Atiende el conector "UART"'), 4, 4));
    g.add(serigrafia(F, W, D, ctx => { F.texto(ctx, 'ESP32-S3 DevKit', W / 2, D / 2 + 21, 1.5, '#f2f4f8', { peso: 800 }); rotulos(F, ctx, W, D, izq, { dx: 1.8, alinear: 'left', alto: .9 }); rotulos(F, ctx, W, D, der, { dx: -1.8, alinear: 'right', alto: .9 }); }));
    g.userData.direccion = [.9, 1.3, .6];
    return g;
  };

  /* =====================================================================
     CIRCUITOS INTEGRADOS (se arman solos con los datos de sus pines)
     ===================================================================== */
  M['*ci'] = (F, c, V) => {
    const T = V.T, g = new T.Group();
    const nombre = c.id.toUpperCase().replace(/^74LS/, '74LS').replace(/^74HC/, '74HC');
    const pines = c.pines.map(p => ({ nombre: p.nombre, tipo: p.tipo, funcion: p.funcion }));
    const chip = F.dip(c.pines.length, nombre, { pines });
    chip.userData.ensamble = true;          // en la vista explosionada se separan cuerpo, texto y patas
    g.add(F.info(chip, 'Circuito integrado ' + nombre, c.descripcion));
    chip.children.forEach(h => { if (!h.userData.info && !h.userData.pines) F.info(h, 'Circuito integrado ' + nombre, c.descripcion, { etiqueta: false }); });
    g.userData.yPcb = 1.6;
    g.userData.direccion = [.35, 1, .9];
    g.userData.distancia = 2.4;
    return g;
  };

  /* =====================================================================
     COMPONENTES BÁSICOS Y PIEZAS ESPECIALES
     ===================================================================== */
  // Patas que se pueden señalar con el mouse: puntos [x, yArriba, z, largo]
  function patas(F, V, puntos, infos, opciones = {}) {
    const T = V.T, g = new T.Group(), m4 = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3();
    const im = new T.InstancedMesh(new T.BoxGeometry(opciones.grosor || .5, 1, opciones.grosor || .5), F.M.estano(), puntos.length);
    puntos.forEach(([x, y, z, l], i) => { s.set(1, l, 1); m4.compose(new T.Vector3(x, y - l / 2, z), q, s); im.setMatrixAt(i, m4); });
    im.instanceMatrix.needsUpdate = true;
    im.userData.pines = puntos.map(([x, y, z, l], i) => Object.assign({ punta: new T.Vector3(x, y - l + .5, z) }, infos[i] || {}));
    g.add(im);
    g.userData.puntas = puntos.map(([x, y, z, l], i) => ({ v: new T.Vector3(x, y - l, z), info: infos[i] || {} }));
    g.userData.cabecera = true;
    return g;
  }
  const infosDe = c => c.pines.map(p => ({ nombre: p.nombre, tipo: p.tipo, funcion: p.funcion }));

  function led5(F, color, opciones = {}) {
    const g = F.grupo(), op = opciones.opacidad ?? .82, mat = opciones.lechoso ? F.mat({ color: '#f2f2f2', roughness: .35, transparent: true, opacity: .9 }) : F.M.vidrio(color, op);
    const r = opciones.r || 2.5, h = opciones.h || 5.2;
    g.add(F.pon(F.cil(r + .4, r + .4, 1, mat), 0, .5, 0), F.pon(F.cil(r, r, h, mat), 0, 1 + h / 2, 0), F.pon(F.esfera(r, mat), 0, 1 + h, 0));
    if (opciones.chip !== false) g.add(F.pon(F.caja(.7, .7, .7, opciones.encendido ? F.M.luz(color, 1.6) : F.M.plastico('#555', .5)), 0, 1 + h * .7, 0));
    return g;
  }

  M['led'] = (F, c, V) => {
    const g = new V.T.Group();
    g.add(F.info(led5(F, '#ff2a1a', { encendido: true }), 'Cápsula de epoxi', 'Protege el chip semiconductor y funciona como lente que concentra la luz'));
    g.add(patas(F, V, [[1.27, .2, 0, 26], [-1.27, .2, 0, 24]], infosDe(c)));
    g.userData.yPcb = 0; g.userData.direccion = [.7, .55, 1.2]; g.userData.distancia = 2.2;
    return g;
  };

  M['resistencia'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), cuerpo = F.grupo();
    const base = F.M.plastico('#d8c39a', .5);
    cuerpo.add(F.pon(F.cil(1.15, 1.15, 4.6, base), 0, 0, 0, 0, 0, Math.PI / 2));
    [-2.6, 2.6].forEach(x => cuerpo.add(F.pon(F.esfera(1.35, base, 2), x, 0, 0)));
    [['#d32f2f', -1.9], ['#d32f2f', -1.0], ['#6d4c41', -.1], ['#d4a640', 2.1]].forEach(([col, x]) => cuerpo.add(F.pon(F.cil(1.2, 1.2, .55, F.mat({ color: col, roughness: .4, metalness: col === '#d4a640' ? .8 : 0 })), x, 0, 0, 0, 0, Math.PI / 2)));
    g.add(F.pon(F.info(cuerpo, 'Resistencia de 220 Ω', 'Bandas rojo-rojo-marrón = 22 × 10 = 220 Ω · dorado = ± 5 %'), 0, 6, 0));
    [-1, 1].forEach(s => g.add(F.pon(F.caja(3.2, .5, .5, F.M.estano()), s * 5.2, 6, 0)));
    g.add(patas(F, V, [[-6.6, 6.2, 0, 14], [6.6, 6.2, 0, 14]], infosDe(c)));
    g.userData.yPcb = 0; g.userData.direccion = [.3, .7, 1.2]; g.userData.distancia = 2;
    return g;
  };

  M['pulsador'] = (F, c, V) => {
    const g = new V.T.Group(), [pa, pb] = infosDe(c);
    g.add(F.pon(F.boton(6, '#1a1a1a'), 0, 0, 0));
    g.add(patas(F, V, [[-3.25, .3, -2.25, 4], [-3.25, .3, 2.25, 4], [3.25, .3, -2.25, 4], [3.25, .3, 2.25, 4]], [pa, pa, pb, pb]));
    g.userData.yPcb = 0; g.userData.distancia = 2.4;
    return g;
  };

  M['potenciometro'] = (F, c, V) => {
    const g = new V.T.Group();
    const cuerpo = F.grupo(F.pon(F.cil(8, 8, 6, F.M.aluminio()), 0, 3, 0), F.pon(F.caja(12, 1.2, 4, F.M.plastico('#203a7a')), 0, .6, 6));
    g.add(F.info(cuerpo, 'Cuerpo del potenciómetro', 'Dentro hay una pista de carbón y un cursor que se desliza sobre ella'));
    const eje = F.grupo(F.pon(F.cil(3.5, 3.5, 3, F.M.aluminio()), 0, 7.5, 0), F.pon(F.cil(3, 3, 9, F.mat({ color: '#8d939c', metalness: .9, roughness: .5 })), 0, 13.5, 0));
    g.add(F.info(eje, 'Eje', 'Al girarlo mueves el cursor y cambias el voltaje de salida'));
    g.add(patas(F, V, [[-5, .2, 7, 6], [0, .2, 7, 6], [5, .2, 7, 6]], infosDe(c), { grosor: .8 }));
    g.userData.yPcb = 0;
    return g;
  };

  M['ldr'] = (F, c, V) => {
    const g = new V.T.Group();
    const disco = F.grupo(F.pon(F.cil(2.6, 2.6, 1.8, F.M.plastico('#d07a3c', .4)), 0, .9, 0));
    disco.add(F.pon(F.calco(4.4, 4.4, (ctx, w, d) => { ctx.strokeStyle = '#6b3a12'; ctx.lineWidth = .28; ctx.beginPath(); for (let i = 0; i < 6; i++) { const y = .8 + i * .55; ctx.moveTo(i % 2 ? .9 : 1.3, y); ctx.lineTo(i % 2 ? 3.1 : 3.5, y); } ctx.stroke(); }), 0, 1.82, 0));
    g.add(F.pon(F.info(disco, 'Fotorresistencia', 'La pista en zigzag es de sulfuro de cadmio: con luz conduce mejor'), 0, 4, 0));
    g.add(patas(F, V, [[-1.6, 4.1, 0, 22], [1.6, 4.1, 0, 22]], infosDe(c)));
    g.userData.yPcb = 0; g.userData.direccion = [.4, 1, 1.1]; g.userData.distancia = 2.2;
    return g;
  };

  M['ds18b20'] = (F, c, V) => {
    const T = V.T, g = new T.Group();
    const s = new T.Shape(); s.moveTo(-2.4, 0); s.lineTo(2.4, 0); s.absarc(0, 0, 2.4, 0, Math.PI, false);
    const geo = new T.ExtrudeGeometry(s, { depth: 4.8, bevelEnabled: false, curveSegments: 16 }); geo.rotateX(-Math.PI / 2);
    const cuerpo = new T.Mesh(geo, F.M.epoxi());
    const texto = F.calco(4, 3, (ctx, w, d) => { F.texto(ctx, 'DS18B20', w / 2, d * .38, .75, '#cfd4dc'); F.texto(ctx, 'cara plana', w / 2, d * .7, .5, '#8a9099', { peso: 600 }); });
    texto.rotation.set(Math.PI / 2, 0, 0); texto.position.set(0, 2.5, .02);   // de pie, mirando hacia el frente (+Z)
    g.add(F.pon(F.info(F.grupo(cuerpo, texto), 'Encapsulado TO-92', 'Dentro está el termómetro digital; la cara plana sirve para orientar las patas'), 0, 3, 0));
    g.add(patas(F, V, [[-1.27, 3.1, -1, 16], [0, 3.1, -1, 16], [1.27, 3.1, -1, 16]], infosDe(c)));
    g.userData.yPcb = 0; g.userData.direccion = [.25, .6, 1.2]; g.userData.distancia = 2;
    return g;
  };

  function display7(F, c, V, digitos) {
    const T = V.T, g = new T.Group(), w = digitos === 1 ? 12.6 : 50.4, d = 19, n = c.pines.length, mitad = n / 2;
    const seg = { a: [[.25, .1], [.75, .1]], b: [[.78, .14], [.74, .46]], c: [[.74, .54], [.7, .86]], d: [[.25, .9], [.7, .9]], e: [[.26, .54], [.22, .86]], f: [[.3, .14], [.26, .46]], g: [[.27, .5], [.73, .5]] };
    const NUM = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 6: 'afgedc', 8: 'abcdefg', 9: 'abcfgd' };
    const valores = digitos === 1 ? ['8'] : ['2', '0', '2', '6'];
    const cuerpo = F.grupo(F.pon(F.caja(w, 7.6, d, F.M.plastico('#e9e9e9', .6), .3), 0, 3.8, 0));
    cuerpo.add(F.pon(F.calco(w - .6, d - .6, (ctx, W, D) => {
      ctx.fillStyle = '#1b1c1f'; ctx.fillRect(0, 0, W, D);
      const dw = W / digitos;
      valores.forEach((v, k) => {
        const x0 = k * dw + dw * .12, ancho = dw * .7, alto = D * .82, y0 = D * .09;
        Object.entries(seg).forEach(([s, [[x1, y1], [x2, y2]]]) => { ctx.strokeStyle = NUM[v].includes(s) ? '#ff3b2f' : '#3a2020'; ctx.lineWidth = ancho * .14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 + x1 * ancho, y0 + y1 * alto); ctx.lineTo(x0 + x2 * ancho, y0 + y2 * alto); ctx.stroke(); });
        ctx.fillStyle = k === 1 || digitos === 1 ? '#ff3b2f' : '#3a2020'; ctx.beginPath(); ctx.arc(x0 + ancho * .95, y0 + alto * .93, ancho * .07, 0, 7); ctx.fill();
      });
    }, { brillo: 1.3, rugosidad: .3, pxmm: 14 }), 0, 7.62, 0));
    g.add(F.info(cuerpo, digitos === 1 ? 'Display de 7 segmentos' : 'Display de 4 dígitos', 'Cada segmento es un LED; encendiendo algunos se forman los números'));
    const paso = 2.54, filas = 15.24 / 2, pts = [];
    for (let i = 0; i < n; i++) { const abajo = i < mitad, k = abajo ? i : n - 1 - i; pts.push([(k - (mitad - 1) / 2) * paso, .2, abajo ? filas : -filas, 6]); }
    g.add(patas(F, V, pts, infosDe(c)));
    g.userData.yPcb = 0; g.userData.direccion = [.2, 1, .9]; g.userData.distancia = 2.3;
    return g;
  }
  M['display-7seg-1'] = (F, c, V) => display7(F, c, V, 1);
  M['display-7seg-4'] = (F, c, V) => display7(F, c, V, 4);

  M['buzzer'] = (F, c, V) => {
    const g = new V.T.Group(), [mas, menos] = infosDe(c);
    const activo = F.grupo(F.pon(F.cil(6, 6, 9.5, F.M.negro()), 0, 4.75, 0), F.pon(F.cil(.9, .9, .1, F.mat({ color: '#000', roughness: 1 }), 12), 0, 9.52, 0));
    activo.add(F.pon(F.calco(9, 9, (ctx, w, d) => { F.texto(ctx, '+', w * .25, d * .3, 2, '#d0d4dc'); F.texto(ctx, 'ACTIVO', w / 2, d * .75, 1.2, '#9aa0aa', { peso: 600 }); }), 0, 9.52, 0));
    const pasivo = F.grupo(F.pon(F.cil(6, 6, 8.5, F.M.negro()), 0, 5.25, 0), F.pon(F.cil(5.8, 5.8, 1, F.M.pcb(VERDE)), 0, .5, 0));
    pasivo.add(F.pon(F.calco(9, 9, (ctx, w, d) => { F.texto(ctx, '+', w * .25, d * .3, 2, '#d0d4dc'); F.texto(ctx, 'PASIVO', w / 2, d * .75, 1.2, '#9aa0aa', { peso: 600 }); }), 0, 9.52, 0));
    g.add(F.pon(F.info(activo, 'Buzzer ACTIVO', 'Trae su propio oscilador: suena con solo darle voltaje'), -9, 3, 0));
    g.add(F.pon(F.info(pasivo, 'Buzzer PASIVO', 'Se ve la placa verde abajo; necesita tone() para sonar'), 9, 3, 0));
    const p = (x, l) => [x, 3.1, 0, l];
    g.add(patas(F, V, [p(-12.25 + 1.5, 16), p(-5.75 - 1.5, 14), p(5.75 + 1.5, 16), p(12.25 - 1.5, 14)],
      [Object.assign({}, mas, { nombre: '+ (activo)' }), Object.assign({}, menos, { nombre: '− (activo)' }), Object.assign({}, mas, { nombre: '+ (pasivo)' }), Object.assign({}, menos, { nombre: '− (pasivo)' })]));
    g.userData.yPcb = 0; g.userData.direccion = [.3, .9, 1.2];
    return g;
  };

  M['servo-sg90'] = (F, c, V) => {
    const T = V.T, g = new T.Group(), azul = F.mat({ color: '#2b66d0', roughness: .35, transparent: true, opacity: .93 });
    const caja = F.grupo(F.pon(F.caja(22.8, 22.5, 12.2, azul, .6), 0, 11.25, 0), F.pon(F.caja(32.2, 2.5, 12.2, azul, .4), 0, 16.5, 0), F.pon(F.cil(5.9, 5.9, 4, azul), 5.5, 24.5, 0));
    caja.add(F.pon(F.calco(18, 9, (ctx, w, d) => { F.texto(ctx, 'SG90', w / 2, d * .4, 3, '#e8eefc'); F.texto(ctx, '9 g · 180°', w / 2, d * .78, 1.6, '#cfd9f2', { peso: 600 }); }), 0, 11, 6.12, 0, Math.PI / 2));
    g.add(F.info(caja, 'Carcasa del servo', 'Dentro hay un motor, engranajes y un potenciómetro que mide el ángulo'));
    const brazo = F.grupo(F.pon(F.cil(2.4, 2.4, 3, F.M.blanco()), 5.5, 28, 0), F.pon(F.caja(18, 1.6, 4.5, F.M.blanco(), .8), 11, 29, 0));
    g.add(F.info(brazo, 'Brazo (horn)', 'Pieza que gira al ángulo que pide el programa'));
    const colores = ['#6d4c41', '#d32f2f', '#f57c00'];
    colores.forEach((col, i) => g.add(F.info(F.cable([[-11.4, 4, (i - 1) * 1.1], [-20, 3, (i - 1) * 1.1], [-30, 1.4, (i - 1) * 2.54]], col, .55), ['Cable marrón', 'Cable rojo', 'Cable naranja'][i], ['Tierra (GND)', 'Alimentación de 5 V', 'Señal PWM'][i], { menor: true })));
    const pts = infosDe(c).map((inf, i) => ({ x: -32, z: (i - 1) * 2.54, info: inf }));
    g.add(F.info(F.cabecera(pts, { modo: 'hembra', y: 0 }), 'Conector hembra', 'Se conecta a los pines macho o a cables puente'));
    g.userData.yPcb = 0; g.userData.direccion = [.8, .8, 1.1];
    return g;
  };

  M['mini-bomba'] = (F, c, V) => {
    const g = new V.T.Group(), blanco = F.M.plastico('#f0f0ee', .45);
    const cuerpo = F.grupo(F.pon(F.cil(12, 12, 26, blanco), 0, 13, 0), F.pon(F.cil(12.4, 12.4, 3, F.M.plastico('#d8d8d6', .5)), 0, 1.5, 0));
    g.add(F.info(cuerpo, 'Cuerpo de la bomba', 'Dentro, un motor hace girar un impulsor que empuja el agua'));
    g.add(F.info(F.pon(F.cil(3.4, 3.4, 12, blanco), 15, 20, 0, 0, 0, Math.PI / 2), 'Salida de agua', 'Aquí se conecta la manguera'));
    g.add(F.info(F.grupo(F.pon(F.calco(14, 14, (ctx, w, d) => { ctx.fillStyle = '#9a9a98'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(w / 2 + Math.cos(i * .8) * 4, d / 2 + Math.sin(i * .8) * 4, .9, 0, 7); ctx.fill(); } }), 0, 26.05, 0)), 'Entrada de agua', 'Por estos agujeros entra el agua (la bomba va sumergida)', { menor: true }));
    g.add(F.cable([[-3, 26, 0], [-4, 34, 0], [-14, 38, 0], [-26, 34, 0]], '#d32f2f', .7));
    g.add(F.cable([[3, 26, 0], [3, 35, 2], [-12, 40, 3], [-26, 36, 3]], '#1a1a1a', .7));
    const [mas, menos] = infosDe(c);
    g.add(patas(F, V, [[-27, 34.5, 0, 3], [-27, 36.5, 3, 3]], [mas, menos], { grosor: .9 }));
    g.userData.yPcb = 0; g.userData.direccion = [.6, .7, 1.2];
    return g;
  };

  M['teclado-4x4'] = (F, c, V) => {
    const g = new V.T.Group(), W = 69, D = 76;
    g.add(F.info(F.pon(F.caja(W, .9, D, F.M.plastico('#202124', .6), 1), 0, .45, 0), 'Membrana del teclado', 'Cada tecla une una fila con una columna al presionarla'));
    const teclas = ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'];
    teclas.forEach((t, i) => {
      const f = Math.floor(i / 4), k = i % 4, letra = /[A-D]/.test(t), sim = /[*#]/.test(t);
      const col = letra ? '#d33a3a' : sim ? '#2f6bd8' : '#e8e8e8';
      const tecla = F.grupo(F.pon(F.caja(13.5, .8, 13.5, F.M.plastico(col, .45), .8), 0, .4, 0));
      tecla.add(F.pon(F.calco(10, 10, (ctx, w, d) => F.texto(ctx, t, w / 2, d / 2, 6, letra || sim ? '#fff' : '#222')), 0, .82, 0));
      g.add(F.pon(F.info(tecla, 'Tecla ' + t, 'Fila ' + (f + 1) + ', columna ' + (k + 1), { menor: true }), (k - 1.5) * 16.5, .9, (f - 1.5) * 16.5 - 4));
    });
    g.add(F.info(F.pon(F.caja(20.3, .25, 26, F.M.plastico('#d6d6d6', .4)), 0, .2, D / 2 + 13), 'Cable plano de 8 hilos', '4 filas y 4 columnas', { menor: true }));
    const nombres = ['R1', 'R2', 'R3', 'R4', 'C1', 'C2', 'C3', 'C4'].map((n, i) => ({ n, t: 'digital', f: (i < 4 ? 'Fila ' : 'Columna ') + (i % 4 + 1) }));
    g.add(F.info(F.cabecera(F.fila(-8.89, D / 2 + 27, 2.54, 0, nombres), { modo: 'hembra', y: 0 }), 'Conector de 8 pines', 'Se conecta a 8 pines digitales de la placa'));
    g.userData.yPcb = 0; g.userData.direccion = [.2, 1.3, .9];
    return g;
  };

  /* ----- Motor paso a paso 28BYJ-48 (se usa junto al driver ULN2003) ----- */
  function motorPaso(F) {
    const g = F.grupo();
    g.add(F.pon(F.cil(14, 14, 19, F.M.aluminio()), 0, 9.5, 0));
    g.add(F.pon(F.caja(42, .8, 7, F.M.aluminio(), .4), 0, 19.2, 0));
    g.add(F.pon(F.cil(4.6, 4.6, 1.5, F.M.aluminio()), 0, 20.3, -8));
    g.add(F.pon(F.cil(2.5, 2.5, 9, F.mat({ color: '#c9a64a', metalness: .9, roughness: .35 })), 0, 25, -8));
    g.add(F.pon(F.caja(16, 17, 6, F.M.plastico('#2a63d4', .45), .5), 0, 8.5, 15.5));
    return F.info(g, 'Motor paso a paso 28BYJ-48', 'Gira en 2048 pasitos por vuelta gracias a su caja de engranajes');
  }

  /* =====================================================================
     MÓDULOS: recetas con PCB, pines y piezas
     Cada pieza: [tipo, x, z, opciones]. Opciones comunes: ry (giro), y (altura
     extra), abajo (debajo de la PCB), n y f (nombre y función de la ficha).
     ===================================================================== */
  function pieza(F, V, p) {
    const [tipo, x, z, o = {}] = p;
    let obj;
    switch (tipo) {
      case 'caja': {
        obj = F.grupo(F.pon(F.caja(o.w, o.h, o.d, o.metal ? F.M.aluminio() : F.M.plastico(o.color || '#151515', o.rug ?? .55), o.radio ?? .3), 0, o.h / 2, 0));
        if (o.rejilla) obj.add(F.pon(F.calco(o.w * .86, o.d * .8, (ctx, w, d) => { ctx.fillStyle = 'rgba(0,0,0,.45)'; for (let yy = .8; yy < d - .4; yy += 1.4) for (let xx = .8; xx < w - .4; xx += 1.4) ctx.fillRect(xx, yy, .8, .8); }), 0, o.h + .02, 0));
        if (o.texto) obj.add(F.pon(F.calco(o.w * .9, o.d * .6, (ctx, w, d) => F.texto(ctx, o.texto, w / 2, d / 2, Math.min(d * .4, w / o.texto.length * 1.5), o.colorTexto || '#d8dde6')), 0, o.h + .02, 0));
        if (o.luz) obj.children[0].material = F.M.luz(o.luz, 1.2);
        break;
      }
      case 'cil': {
        obj = F.grupo(F.pon(F.cil(o.r, o.r, o.h, o.metal ? F.M.aluminio() : F.M.plastico(o.color || '#151515', o.rug ?? .5)), 0, o.h / 2, 0));
        if (o.malla) obj.add(F.pon(F.calco(o.r * 1.8, o.r * 1.8, (ctx, w, d) => { ctx.strokeStyle = '#5c6068'; ctx.lineWidth = .18; for (let k = 0; k < w; k += .7) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, d); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(w, k); ctx.stroke(); } }, { rugosidad: .8 }), 0, o.h + .02, 0));
        if (o.horizontal) obj.rotation.z = Math.PI / 2;
        break;
      }
      case 'soic': obj = F.soic(o.pines || 8, o.texto || '', { ancho: o.ancho }); break;
      case 'qfn': obj = F.qfn(o.lado || 4, o.texto || ''); break;
      case 'dip': obj = F.dip(o.pines || 8, o.texto || '', { ancho: o.ancho }); break;
      case 'cristal': obj = F.cristal(o.tipo || 'hc49', o.texto); break;
      case 'elec': obj = F.electrolitico(o.dia || 5, o.alto || 7, o.color); break;
      case 'led': obj = F.ledSMD(o.color || '#ff3b30', o.on); break;
      case 'led5': obj = led5(F, o.color || '#ff2a1a', o); if (o.horizontal) obj.rotation.z = -Math.PI / 2; break;
      case 'smd': obj = F.smd(o.tipo || 'r'); break;
      case 'sot23': obj = F.sot23(); break;
      case 'sot223': obj = F.sot223(o.texto); break;
      case 'trimmer': obj = F.trimmer(o.tipo); break;
      case 'boton': obj = F.boton(o.lado || 6, o.color); break;
      case 'bornera': obj = F.bornera(o.cant || 2, o.color); break;
      case 'rele': obj = F.rele(o.texto); break;
      case 'transductor': obj = F.transductor(); break;
      case 'pila': obj = F.pila(); break;
      case 'domo': obj = F.domo(o.r); break;
      case 'pantalla': obj = F.pantalla(o.w, o.d, o.h, o.tipo, o); break;
      case 'wifi': obj = F.moduloWifi(o.w, o.d, o.texto, o); break;
      case 'disipador': {
        obj = F.grupo(F.pon(F.caja(o.w, 3, o.d, F.mat({ color: '#25272b', metalness: .6, roughness: .45 })), 0, 1.5, 0));
        const aletas = Math.floor(o.w / 2.6);
        for (let i = 0; i < aletas; i++) obj.add(F.pon(F.caja(1, o.h - 3, o.d, F.mat({ color: '#25272b', metalness: .6, roughness: .45 })), -o.w / 2 + .5 + i * (o.w - 1) / (aletas - 1), 3 + (o.h - 3) / 2, 0));
        break;
      }
      case 'microfono': obj = F.grupo(F.pon(F.cil(4.9, 4.9, 6, F.M.negro()), 0, 3, 0), F.pon(F.calco(8.5, 8.5, (ctx, w, d) => { ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.arc(w / 2, d / 2, 3.6, 0, 7); ctx.fill(); }), 0, 6.02, 0)); break;
      case 'laser': obj = F.grupo(F.pon(F.cil(3, 3, 8, F.mat({ color: '#c09a45', metalness: .9, roughness: .35 })), 0, 0, 0, 0, Math.PI / 2), F.pon(F.cil(2, 2, .3, F.M.vidrio('#ff5050', .9)), 0, 0, -4.1, 0, Math.PI / 2)); obj.position.y = 3; break;
      case 'antena': obj = F.grupo(F.pon(F.calco(o.w, o.d, (ctx, w, d) => { ctx.strokeStyle = '#d9ab45'; ctx.lineWidth = .9; for (let k = 0; k < 4; k++) { const m = 1.2 + k * 2.4; ctx.strokeRect(m, m, w - 2 * m, d - 2 * m); } }, { rugosidad: .35 }), 0, .03, 0)); break;
      case 'cab': obj = F.cabecera(F.fila(o.x0, o.z0, o.dx || 0, o.dz || 0, o.etiquetas), { modo: o.modo || 'arriba', dir: o.dir, y: o.yCab }); break;
      default: obj = F.grupo();
    }
    const yBase = o.abajo ? 0 : 1.6;
    if (tipo !== 'cab') {
      const envoltura = F.grupo(obj);
      F.pon(envoltura, x, yBase + (o.y || 0), z, o.ry || 0, o.abajo ? Math.PI : 0);
      obj = envoltura;
    }
    if (o.n) F.info(obj, o.n, o.f || '', { menor: o.menor });
    else if (obj.children[0] && obj.children[0].userData.info) obj.userData.info = obj.children[0].userData.info;
    return obj;
  }

  function modulo(F, c, V, s) {
    const T = V.T, g = new T.Group(), w = s.w, d = s.d;
    g.add(F.info(F.pcb(w, d, s.color || AZUL, { circulo: s.circulo, agujeros: s.agujeros }), 'Placa de circuito (PCB)', 'Soporta los componentes y los une con pistas de cobre', { menor: true }));
    const filas = [];
    const colocar = (etiquetas, lado, desplaz = 0) => {
      const n = etiquetas.length, off = (i) => (i - (n - 1) / 2) * 2.54 + desplaz;
      const L = {
        sur: [i => off(i), () => d / 2 - 1.6, [0, 1]], norte: [i => off(i), () => -d / 2 + 1.6, [0, -1]],
        oeste: [() => -w / 2 + 1.6, i => off(i), [-1, 0]], este: [() => w / 2 - 1.6, i => off(i), [1, 0]]
      }[lado];
      const pts = etiquetas.map((e, i) => ({ x: L[0](i), z: L[1](i), info: V.infoPin(e) }));
      const cab = F.info(F.cabecera(pts, { modo: s.modo || 'angulo', dir: L[2] }), 'Pines de conexión', 'Aquí se conectan los cables puente hacia la placa');
      g.add(cab); filas.push({ pts, lado });
    };
    if (s.pines) colocar(s.pines, s.lado || 'sur', s.desplaz || 0);
    if (s.pines2) colocar(s.pines2, s.lado2 || 'norte', s.desplaz2 || 0);
    (s.piezas || []).forEach(p => g.add(pieza(F, V, p)));
    if (s.serigrafia !== false) {
      g.add(serigrafia(F, w, d, ctx => {
        filas.forEach(({ pts, lado }) => {
          const vertical = lado === 'sur' || lado === 'norte';
          const dz = lado === 'sur' ? -3.4 : lado === 'norte' ? 3.4 : 0, dx = lado === 'oeste' ? 3.4 : lado === 'este' ? -3.4 : 0;
          rotulos(F, ctx, w, d, pts, { dx, dz, rot: vertical ? -Math.PI / 2 : 0, alinear: lado === 'sur' ? 'left' : lado === 'norte' ? 'right' : lado === 'oeste' ? 'left' : 'right', alto: .95 });
        });
        if (s.titulo) F.texto(ctx, s.titulo, w / 2 + (s.tituloPos ? s.tituloPos[0] : 0), d / 2 + (s.tituloPos ? s.tituloPos[1] : 0), s.tituloAlto || 1.6, '#f2f4f8', { peso: 800 });
      }));
    }
    if (s.extra) s.extra(F, V, g);
    g.userData.direccion = s.direccion || [.55, 1.1, 1.05];
    return g;
  }

  const MAS = { n: '+', t: 'alimentación', f: 'Alimentación' }, MENOS = { n: '−', t: 'GND', f: 'Tierra' };
  const ESPECS = {
    'dht11': { w: 20, d: 30, titulo: 'DHT11', tituloPos: [0, 6.5], pines: ['DATA', 'VCC', 'GND'], piezas: [['caja', 0, -4, { w: 15.5, h: 5.5, d: 12, color: '#3f8fe8', rejilla: true, n: 'Sensor DHT11', f: 'Dentro están el termistor y el sensor de humedad' }], ['led', -6, 9.5, { color: '#ff3b30', on: true }], ['smd', 6, 9.5]] },
    'dht22': { w: 25, d: 40, titulo: 'DHT22', tituloPos: [0, 11], pines: ['DATA', 'VCC', 'GND'], piezas: [['caja', 0, -5, { w: 15.1, h: 7.7, d: 25, color: '#f0f0ee', rejilla: true, n: 'Sensor DHT22 (AM2302)', f: 'Termistor y sensor capacitivo de humedad de mayor precisión' }], ['smd', 6, 13.5]] },
    'hc-sr04': { w: 45, d: 20.5, titulo: 'HC-SR04', tituloPos: [0, 4.8], pines: ['VCC', 'Trig', 'Echo', 'GND'], piezas: [
      ['transductor', -13, -1.5, { n: 'Emisor (T)', f: 'Emite el ultrasonido de 40 kHz' }], ['transductor', 13, -1.5, { n: 'Receptor (R)', f: 'Escucha el eco que rebota' }],
      ['cristal', 0, -6.5, { texto: '4.000' }], ['soic', -9, 3, { pines: 8, texto: 'MCU', abajo: true, n: 'Microcontrolador del sensor', f: 'Genera el pulso y mide el eco' }], ['soic', 9, 3, { pines: 14, texto: 'LM324', abajo: true, n: 'Amplificador', f: 'Amplifica el eco débil' }]] },
    'pir-hc-sr501': { w: 32.5, d: 24.5, color: VERDE, pines: ['VCC', 'OUT', 'GND'], piezas: [
      ['caja', 0, -.5, { w: 23, h: 2.5, d: 23, color: '#f4f4f0', n: 'Base de la lente', f: 'Sostiene la lente sobre el sensor infrarrojo', menor: true }], ['domo', 0, -.5, { r: 11.5, y: 2.5 }],
      ['trimmer', -9, -7, { abajo: true, n: 'Potenciómetro Sx (distancia)', f: 'Ajusta el alcance de 3 a 7 m' }], ['trimmer', 9, -7, { abajo: true, n: 'Potenciómetro Tx (tiempo)', f: 'Ajusta cuánto tiempo queda activa la salida' }],
      ['cab', 0, 0, { x0: 11, z0: 2, dx: 0, dz: 2.54, modo: 'abajo', etiquetas: [{ n: 'H', t: 'otro', f: 'Puente H: se reactiva con cada movimiento' }, { n: 'común', t: 'otro', f: 'Pin común del puente' }, { n: 'L', t: 'otro', f: 'Puente L: una sola activación' }], yCab: 0 }]] },
    'mpu-6050': { w: 21, d: 16, titulo: 'GY-521', tituloPos: [0, -6], pines: ['VCC', 'GND', 'SCL', 'SDA', 'XDA', 'XCL', 'AD0', 'INT'], piezas: [['qfn', 0, -1, { lado: 4, texto: 'MPU', n: 'Chip MPU-6050', f: 'Acelerómetro y giroscopio microscópicos (MEMS)' }], ['sot23', -6, -3, { n: 'Regulador de 3,3 V', f: 'Permite alimentar el módulo con 5 V' }], ['led', 6.5, -3.5, { color: '#3dff6a', on: true }], ['smd', 5, 1.5], ['smd', -5, 1.5, { tipo: 'c' }]] },
    'mq-2': { w: 34, d: 26, titulo: 'MQ-2', tituloPos: [10, -9], pines: ['VCC', 'GND', 'DO', 'AO'], piezas: [
      ['cil', -6, -2.5, { r: 9.8, h: 2.2, color: '#2a2622', n: 'Base del sensor', f: 'Base de baquelita con 6 patas', menor: true }], ['cil', -6, -2.5, { r: 8.6, h: 9, metal: true, malla: true, y: 2.2, n: 'Sensor de gas MQ-2', f: 'Su capa de óxido de estaño cambia de resistencia cuando hay gas' }],
      ['trimmer', 10, -3, {}], ['soic', 10, 5.5, { texto: 'LM393', n: 'Comparador LM393', f: 'Compara la señal con el umbral y activa la salida DO' }], ['led', -13, 9, { color: '#ff3b30', on: true, n: 'LED de encendido', f: 'Indica que hay energía', menor: true }], ['led', -9, 9, { color: '#3dff6a', n: 'LED de alarma', f: 'Se enciende cuando DO se activa', menor: true }]] },
    'mq-135': { w: 34, d: 26, titulo: 'MQ-135', tituloPos: [10, -9], pines: ['VCC', 'GND', 'DO', 'AO'], piezas: [
      ['cil', -6, -2.5, { r: 9.8, h: 2.2, color: '#2a2622', menor: true, n: 'Base del sensor', f: 'Base de baquelita' }], ['cil', -6, -2.5, { r: 8.6, h: 9, metal: true, malla: true, y: 2.2, n: 'Sensor MQ-135', f: 'Capa sensible a los contaminantes del aire' }],
      ['trimmer', 10, -3, {}], ['soic', 10, 5.5, { texto: 'LM393', n: 'Comparador LM393', f: 'Activa la salida DO al pasar el umbral' }], ['led', -13, 9, { color: '#ff3b30', on: true, menor: true, n: 'LED de encendido', f: 'Hay energía' }]] },
    'ky-038': { w: 36, d: 15, color: NEGRO, titulo: 'KY-038', tituloPos: [2, 5.5], lado: 'oeste', pines: ['AO', 'GND', '+', 'DO'].map(n => n === '+' ? { n: '+', t: 'alimentación', f: 'Alimentación (3,3 a 5 V)' } : n), piezas: [['microfono', 13, 0, { n: 'Micrófono electret', f: 'Convierte el sonido en una pequeña señal eléctrica' }], ['trimmer', 2, -1, { tipo: 'multivuelta', ry: Math.PI / 2, n: 'Potenciómetro multivuelta', f: 'Ajusta el umbral de sonido (gira varias vueltas)' }], ['soic', -8, 3, { texto: 'LM393', n: 'Comparador LM393', f: 'Decide si el sonido supera el umbral' }], ['led', -8, -4, { color: '#ff3b30', on: true, menor: true, n: 'LED de encendido', f: 'Hay energía' }]] },
    'tcrt5000': { w: 32, d: 14, titulo: 'TCRT5000', tituloPos: [-3, -5], lado: 'oeste', pines: ['VCC', 'GND', 'DO', 'AO'], piezas: [
      ['caja', 11, 0, { w: 10.2, h: 7, d: 5.8, color: '#121212', n: 'Sensor TCRT5000', f: 'LED infrarrojo (azul) y fototransistor (negro) mirando hacia abajo' }], ['cil', 8.6, 0, { r: 1.6, h: .6, color: '#2f6bd8', y: 7, menor: true, n: 'Emisor infrarrojo', f: 'Ilumina la superficie' }], ['cil', 13.4, 0, { r: 1.6, h: .6, color: '#0a0a0a', y: 7, menor: true, n: 'Receptor', f: 'Mide la luz que rebota' }],
      ['trimmer', -1, 0, {}], ['soic', -9, 2.5, { texto: 'LM393', n: 'Comparador LM393', f: 'Convierte la lectura en 0 o 1' }], ['led', -9, -4, { color: '#3dff6a', menor: true, n: 'LED indicador', f: 'Se enciende al detectar' }]] },
    'ir-obstaculos': { w: 31, d: 14.5, titulo: 'FC-51', tituloPos: [-3, -5.5], lado: 'oeste', pines: ['VCC', 'GND', 'OUT'], piezas: [
      ['led5', 12, -3, { color: '#e8f0ff', opacidad: .55, horizontal: true, r: 2.5, h: 4, y: 2.5, n: 'LED infrarrojo (emisor)', f: 'Emite luz infrarroja invisible' }], ['led5', 12, 3, { color: '#14161a', opacidad: .95, horizontal: true, r: 2.5, h: 4, y: 2.5, chip: false, n: 'Receptor infrarrojo', f: 'Detecta la luz que rebota en el obstáculo' }],
      ['trimmer', 1, 0, {}], ['soic', -8, 2.5, { texto: 'LM393', n: 'Comparador LM393', f: 'Activa la salida OUT' }], ['led', -8, -4, { color: '#3dff6a', menor: true, n: 'LED de obstáculo', f: 'Se enciende al detectar' }]] },
    'tcs3200': { w: 28.5, d: 28.5, titulo: 'TCS3200', tituloPos: [0, -9], pines: ['S0', 'S1', 'OE', 'GND'], pines2: ['VCC', 'OUT', 'S2', 'S3'], piezas: [
      ['qfn', 0, 0, { lado: 5, texto: 'TCS', n: 'Sensor de color TCS3200', f: '64 fotodiodos con filtros rojo, verde, azul y sin filtro' }],
      ...[[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5]].map(([x, z]) => ['caja', x, z, { w: 3.5, h: 1.4, d: 3.5, color: '#ffffff', luz: '#fffbe6', n: 'LED blanco', f: 'Ilumina el objeto para medir su color', menor: true }])] },
    'pulso-cardiaco': { w: 16, d: 16, circulo: true, color: VERDE, titulo: '♥', tituloPos: [0, -4.5], tituloAlto: 3, pines: [{ n: 'S', t: 'analógico', f: 'Señal del pulso' }, { n: '+', t: 'alimentación', f: 'Alimentación (3 a 5 V)' }, { n: '−', t: 'GND', f: 'Tierra' }], piezas: [['caja', 0, 0, { w: 2.2, h: .9, d: 2.2, color: '#ffffff', luz: '#3dff6a', n: 'LED verde', f: 'Ilumina la piel' }], ['qfn', 0, 3.2, { lado: 2, texto: '', n: 'Sensor de luz', f: 'Mide cuánta luz verde rebota en la piel' }]] },
    'bmp280': { w: 16, d: 12, color: MORADO, titulo: 'BMP280', tituloPos: [3.5, -2.5], tituloAlto: 1.1, pines: ['VCC', 'GND', 'SCL', 'SDA', 'CSB', 'SDO'], piezas: [['caja', -3.5, -2.2, { w: 2.5, h: .95, d: 2, metal: true, n: 'Sensor BMP280', f: 'Su membrana microscópica se dobla con la presión del aire' }], ['smd', 5, -3.5, { tipo: 'c' }]] },
    'joystick-ky-023': { w: 34, d: 26.5, color: NEGRO, lado: 'oeste', pines: ['GND', '+5V', 'VRx', 'VRy', 'SW'], piezas: [
      ['caja', 3, 0, { w: 16, h: 11, d: 16, color: '#151515', n: 'Mecanismo de la palanca', f: 'Dentro hay dos potenciómetros (ejes X e Y) y un botón' }],
      ['cil', 3, 0, { r: 2.3, h: 10, color: '#202020', y: 11, n: 'Palanca', f: 'Al moverla giran los potenciómetros' }], ['cil', 3, 0, { r: 9, h: 5, color: '#1a1a1a', y: 19, n: 'Capuchón', f: 'Se mueve con el pulgar y se presiona para el botón SW' }],
      ['caja', 3, -10.5, { w: 9, h: 5, d: 3, color: '#2a2a2a', menor: true, n: 'Potenciómetro del eje Y', f: 'Mide la posición vertical' }], ['caja', 13.5, 0, { w: 3, h: 5, d: 9, color: '#2a2a2a', menor: true, n: 'Potenciómetro del eje X', f: 'Mide la posición horizontal' }]] },

    'rele-1': { w: 50, d: 26, titulo: 'RELÉ 1 CANAL', tituloPos: [-12, -10], lado: 'oeste', pines: ['VCC', 'GND', 'IN'], piezas: [
      ['rele', 2, 0, {}], ['bornera', 20.5, 0, { cant: 3, ry: Math.PI / 2, n: 'Bornera COM / NO / NC', f: 'Aquí se conecta la carga: COM (común), NO (normalmente abierto), NC (normalmente cerrado)' }], ['sot23', -13, 6, { n: 'Transistor', f: 'Activa la bobina del relé' }], ['smd', -13, -6], ['led', -19, 8, { color: '#ff3b30', on: true, menor: true, n: 'LED de encendido', f: 'Hay energía' }], ['led', -19, -8, { color: '#3dff6a', menor: true, n: 'LED de relé activo', f: 'Se enciende cuando el relé está activado' }]] },
    'rele-2': { w: 50, d: 39, titulo: 'RELÉ 2 CANALES', tituloPos: [-11, -16], lado: 'oeste', pines: ['GND', 'IN1', 'IN2', 'VCC'], piezas: [
      ['rele', 2, -9.5, { n: 'Relé 1', f: 'Interruptor con electroimán del canal 1' }], ['rele', 2, 9.5, { n: 'Relé 2', f: 'Interruptor con electroimán del canal 2' }],
      ['bornera', 20.5, -9.5, { cant: 3, ry: Math.PI / 2, n: 'Bornera del relé 1', f: 'COM, NO y NC del canal 1' }], ['bornera', 20.5, 9.5, { cant: 3, ry: Math.PI / 2, n: 'Bornera del relé 2', f: 'COM, NO y NC del canal 2' }],
      ['dip', -11, -9.5, { pines: 4, texto: 'PC817', n: 'Optoacoplador', f: 'Une la placa con el relé usando luz: los aísla eléctricamente' }], ['dip', -11, 9.5, { pines: 4, texto: 'PC817', n: 'Optoacoplador', f: 'Aísla el canal 2' }],
      ['cab', 0, 0, { x0: -20, z0: -16, dx: 2.54, dz: 0, modo: 'arriba', etiquetas: [{ n: 'GND', t: 'GND', f: 'Tierra de las bobinas' }, { n: 'VCC', t: 'alimentación', f: 'Alimentación lógica' }, { n: 'JD-VCC', t: 'alimentación', f: 'Alimentación de las bobinas (con puente = VCC)' }] }],
      ['caja', -15.66, -16, { w: 5, h: 6, d: 2.5, color: '#f2c94c', y: 2.4, n: 'Puente (jumper)', f: 'Une VCC con JD-VCC; quítalo para aislar las bobinas' }]] },
    'l298n': { w: 43, d: 43, color: ROJO, titulo: 'L298N', tituloPos: [0, 3], pines: ['ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB'], desplaz: 5, modo: 'arriba', piezas: [
      ['disipador', 0, -10, { w: 23, d: 16, h: 25, n: 'Disipador de calor', f: 'Saca el calor del chip L298 para que no se queme' }],
      ['caja', 0, -1, { w: 20, h: 10, d: 4.5, color: '#141414', texto: 'L298N', n: 'Chip L298N (doble puente H)', f: 'Cuatro interruptores electrónicos por motor que invierten el sentido de giro' }],
      ['bornera', -17.5, -8, { cant: 2, ry: -Math.PI / 2, n: 'Salida motor A (OUT1, OUT2)', f: 'Aquí van los dos cables del motor A' }], ['bornera', 17.5, -8, { cant: 2, ry: Math.PI / 2, n: 'Salida motor B (OUT3, OUT4)', f: 'Aquí van los dos cables del motor B' }],
      ['bornera', -10, 16.5, { cant: 3, n: 'Bornera de alimentación (12V · GND · 5V)', f: 'Batería de los motores, tierra común y 5 V' }], ['elec', -15, 6, { dia: 8, alto: 11 }], ['elec', 15, 6, { dia: 8, alto: 11 }],
      ['caja', -2, 8.5, { w: 6.5, h: 2.3, d: 6, color: '#151515', texto: '78M05', n: 'Regulador de 5 V', f: 'Entrega 5 V para la lógica si el puente 5V-EN está puesto' }], ['led', 7, 8.5, { color: '#ff3b30', on: true, menor: true, n: 'LED de encendido', f: 'Hay energía' }]] },
    'drv8833': { w: 18.5, d: 17, color: '#2b3fa8', titulo: 'DRV8833', tituloPos: [0, -2.6], tituloAlto: 1.1, pines: ['EEP', 'AIN1', 'AIN2', 'GND', 'BIN1', 'BIN2'], pines2: ['ULT', 'AOUT1', 'AOUT2', 'VM', 'BOUT2', 'BOUT1'], modo: 'abajo', piezas: [['soic', 0, 1, { pines: 16, texto: 'DRV8833', n: 'Chip DRV8833', f: 'Dos puentes H con transistores MOSFET muy eficientes' }], ['smd', -6, 1, { tipo: 'c' }], ['smd', 6, 1, { tipo: 'c' }]] },
    'hc-05': { w: 37, d: 16, titulo: 'HC-05', tituloPos: [-11, -5.5], lado: 'oeste', pines: ['STATE', 'RXD', 'TXD', 'GND', 'VCC', 'EN'], piezas: [
      ['caja', 4, 0, { w: 27, h: .8, d: 13, color: '#1e6a3a', n: 'Módulo Bluetooth', f: 'Placa con el chip de radio Bluetooth y su antena' }], ['qfn', 1, 0, { lado: 6, texto: 'BT', y: .8, n: 'Chip Bluetooth', f: 'Convierte los datos serie en ondas de radio' }],
      ['antena', 14, 0, { w: 6, d: 11, y: .8, n: 'Antena impresa', f: 'Pista de cobre que emite y recibe la señal' }], ['boton', -12, 4.5, { lado: 4 }], ['led', -12, -4, { color: '#ff3b30', on: true, n: 'LED de estado', f: 'Parpadea rápido: esperando · lento: modo AT', menor: true }]] },
    'rfid-rc522': { w: 60, d: 39.5, titulo: 'RC522', tituloPos: [18, -14], lado: 'este', pines: ['SDA', 'SCK', 'MOSI', 'MISO', 'IRQ', 'GND', 'RST', '3.3V'], piezas: [
      ['antena', -9, 0, { w: 38, d: 36, n: 'Antena de la tarjeta', f: 'Bobina impresa: crea el campo magnético que alimenta a la tarjeta' }],
      ['qfn', 17, -3, { lado: 5, texto: 'RC522', n: 'Chip lector RC522', f: 'Habla con la tarjeta por radio de 13,56 MHz' }], ['cristal', 17, 7, { tipo: 'smd', n: 'Cristal de 27,12 MHz', f: 'Marca el ritmo del chip lector' }], ['smd', 12, 3], ['smd', 22, 3, { tipo: 'c' }]] },
    'lcd-16x2-i2c': { w: 80, d: 36, color: VERDE, lado: 'oeste', pines: ['GND', 'VCC', 'SDA', 'SCL'], agujeros: [[-37.5, -15.5, 1.5], [37.5, -15.5, 1.5], [-37.5, 15.5, 1.5], [37.5, 15.5, 1.5]], piezas: [
      ['pantalla', 2, 0, { w: 71.2, d: 24.2, h: 7, tipo: 'lcd', aw: 64.5, ad: 15.5, funcion: 'Cada carácter es una cuadrícula de 5 × 8 puntos de cristal líquido' }],
      ['caja', 20, 0, { w: 42, h: 1.6, d: 19, color: '#1d1f24', abajo: true, n: 'Adaptador I2C (PCF8574)', f: 'Convierte las órdenes I2C en señales para la pantalla: de 16 cables a 4' }],
      ['trimmer', 30, 4, { abajo: true, y: 1.6, n: 'Potenciómetro de contraste', f: 'Gíralo si se enciende la luz pero no ves letras' }]] },
    'oled-ssd1306': { w: 27.3, d: 27.8, lado: 'norte', pines: ['GND', 'VCC', 'SCL', 'SDA'], piezas: [['pantalla', 0, 2.2, { w: 26, d: 19, h: 1.4, tipo: 'oled', aw: 22, ad: 11, oz: -1, funcion: 'Cada píxel es un LED orgánico que brilla por sí solo' }]] },
    'tft-24': { w: 77, d: 42.5, color: ROJO, lado: 'oeste', pines: ['VCC', 'GND', 'CS', 'RESET', 'DC', 'SDI', 'SCK', 'LED', 'SDO', 'T_CLK', 'T_CS', 'T_DIN', 'T_DO', 'T_IRQ'], piezas: [
      ['pantalla', 5, 0, { w: 60, d: 43, h: 3, tipo: 'tft', aw: 49, ad: 37, funcion: 'Pantalla a color de 240 × 320 píxeles con panel táctil' }],
      ['caja', 18, 0, { w: 15, h: 1.8, d: 15, metal: true, abajo: true, n: 'Ranura microSD (por detrás)', f: 'Para mostrar imágenes guardadas' }]] },
    'matriz-max7219': { w: 50, d: 32.5, lado: 'oeste', pines: ['VCC', 'GND', 'DIN', 'CS', 'CLK'], lado2: 'este', pines2: ['VCC', 'GND', { n: 'DOUT', t: 'SPI', f: 'Salida hacia el siguiente módulo' }, 'CS', 'CLK'], piezas: [
      ['dip', 0, 0, { pines: 24, texto: 'MAX7219', ancho: true, n: 'Chip MAX7219', f: 'Enciende las filas una por una muy rápido (multiplexado)' }],
      ['pantalla', 0, 0, { w: 32.2, d: 32.2, h: 8, tipo: 'matriz', aw: 31.5, ad: 31.5, y: 6, funcion: '64 LEDs rojos en 8 filas y 8 columnas' }]] },
    'led-rgb-ky016': { w: 18.5, d: 15, color: NEGRO, titulo: 'KY-016', tituloPos: [5, -4.5], tituloAlto: 1.2, pines: ['R', 'G', 'B', { n: '−', t: 'GND', f: 'Cátodo común' }], piezas: [['led5', -3, -2, { lechoso: true, r: 2.5, h: 5.5, chip: false, n: 'LED RGB', f: 'Tres LEDs (rojo, verde y azul) en una sola cápsula' }], ['smd', 5, 1], ['smd', 5, -1.5]] },
    'mp3-tf-16p': { w: 21, d: 21, titulo: 'MP3-TF-16P', tituloPos: [0, 7.5], tituloAlto: 1.2, modo: 'abajo', lado: 'oeste', pines: ['VCC', 'RX', 'TX', 'DAC_R', 'DAC_L', 'SPK_1', 'GND', 'SPK_2'], lado2: 'este', pines2: ['BUSY', { n: 'USB-', t: 'otro', f: 'USB (lector de memoria)' }, { n: 'USB+', t: 'otro', f: 'USB (lector de memoria)' }, 'ADKEY2', 'ADKEY1', 'IO2', 'GND', 'IO1'], piezas: [
      ['caja', 0, -1.5, { w: 14.5, h: 1.8, d: 15, metal: true, n: 'Ranura microSD', f: 'Aquí va la tarjeta con los archivos MP3' }], ['soic', 0, 4, { pines: 16, texto: 'MP3', abajo: true, n: 'Decodificador MP3', f: 'Lee la microSD y convierte el MP3 en sonido' }], ['soic', 0, -5, { pines: 8, texto: 'AMP', abajo: true, n: 'Amplificador de 3 W', f: 'Da potencia para mover un parlante pequeño' }]] },
    'rtc-ds1302': { w: 44, d: 23.5, titulo: 'DS1302', tituloPos: [-9, -9.5], lado: 'oeste', pines: ['VCC', 'GND', 'CLK', 'DAT', 'RST'], piezas: [['dip', -11.5, 2, { pines: 8, texto: 'DS1302', n: 'Chip de reloj DS1302', f: 'Cuenta segundos, minutos, horas y fecha' }], ['cristal', -11, -6.5, { tipo: 'reloj', n: 'Cristal de 32 768 Hz', f: 'Vibra 32 768 veces por segundo: así cuenta el tiempo' }], ['pila', 10, 0, {}]] },
    'rtc-ds3231': { w: 38, d: 22, titulo: 'DS3231', tituloPos: [0, 8.5], lado: 'oeste', pines: ['32K', 'SQW', 'SCL', 'SDA', 'VCC', 'GND'], lado2: 'este', pines2: ['SCL', 'SDA', 'VCC', 'GND'], piezas: [['soic', -3, -2.5, { pines: 16, texto: 'DS3231', ancho: 7.5, n: 'Chip de reloj DS3231', f: 'Reloj con cristal interno compensado por temperatura' }], ['soic', 9, 4, { pines: 8, texto: 'AT24C32', n: 'Memoria EEPROM', f: '4 KB extra para guardar datos' }], ['pila', 3, 0, { abajo: true }]] },
    'conversor-nivel': { w: 14, d: 16, color: ROJO, modo: 'abajo', pines: ['LV1', 'LV2', 'LV', 'GND', 'LV3', 'LV4'], pines2: ['HV1', 'HV2', 'HV', 'GND', 'HV3', 'HV4'], piezas: [...[[-3.4, -2.6], [3.4, -2.6], [-3.4, 2.6], [3.4, 2.6]].map(([x, z]) => ['sot23', x, z, { n: 'Transistor MOSFET BSS138', f: 'Traduce la señal entre 3,3 V y 5 V en ambos sentidos' }])] },
    'laser-ky008': { w: 18.5, d: 15, color: NEGRO, titulo: 'KY-008', tituloPos: [4, 2], tituloAlto: 1.2, pines: ['S', 'Centro', { n: '−', t: 'GND', f: 'Tierra' }], piezas: [['laser', -3, -3, { n: 'Diodo láser de 650 nm', f: 'Luz roja muy concentrada. ¡Nunca la apuntes a los ojos!' }], ['smd', 5, -3]] }
  };

  /* ----- Módulos compuestos (dos piezas separadas) ----- */
  function ensamble(F, V, partes) {
    const g = new V.T.Group(); g.userData.ensamble = true;
    partes.forEach(([obj, x, z]) => { obj.position.x += x; obj.position.z += z; obj.userData.ensamble = true; g.add(obj); });
    const raiz = new V.T.Group(); raiz.add(g); return raiz;
  }

  M['uln2003-28byj48'] = (F, c, V) => {
    const placa = modulo(F, c, V, { w: 35, d: 32, color: VERDE, titulo: 'ULN2003', tituloPos: [6, 12], lado: 'oeste', pines: ['IN1', 'IN2', 'IN3', 'IN4'], lado2: 'este', pines2: [MAS, MENOS], piezas: [
      ['dip', -3, 2, { pines: 16, texto: 'ULN2003', n: 'Chip ULN2003', f: '7 transistores Darlington que entregan la corriente que el pin no puede dar' }],
      ['caja', -1, -12, { w: 12.5, h: 6, d: 5, color: '#f2f2f2', n: 'Conector del motor', f: 'Aquí se enchufa el cable de 5 hilos del motor' }],
      ...[-6, -2, 2, 6].map(z => ['led5', 11, z + 2, { color: '#ff2a1a', r: 1.5, h: 2.5, encendido: z === -2, n: 'LED de bobina', f: 'Muestra qué bobina recibe corriente en cada paso', menor: true }])] });
    const motor = motorPaso(F);
    const r = ensamble(F, V, [[placa, 0, 0], [F.grupo(motor), -52, -2]]);
    r.userData.direccion = [.4, 1, 1.1];
    return r;
  };

  M['rf-433'] = (F, c, V) => {
    const tx = modulo(F, c, V, { w: 19, d: 19, color: VERDE, titulo: 'EMISOR', tituloPos: [0, -6], tituloAlto: 1.2, pines: [{ n: 'DATA', t: 'digital', f: 'Datos a transmitir' }, { n: 'VCC', t: 'alimentación', f: '3 a 12 V: más voltaje, más alcance' }, { n: 'GND', t: 'GND', f: 'Tierra' }], modo: 'abajo', piezas: [['cil', 0, -1, { r: 2.5, h: 4, metal: true, n: 'Resonador SAW de 433 MHz', f: 'Fija la frecuencia de la radio' }], ['sot23', 5, 3, { n: 'Transistor oscilador', f: 'Enciende y apaga la onda de radio' }]] });
    const rx = modulo(F, c, V, { w: 30, d: 14, color: VERDE, titulo: 'RECEPTOR', tituloPos: [0, -4.5], tituloAlto: 1.1, pines: [{ n: 'VCC', t: 'alimentación', f: '5 V' }, { n: 'DATA', t: 'digital', f: 'Datos recibidos' }, { n: 'DATA', t: 'digital', f: 'Datos recibidos (unido al otro DATA)' }, { n: 'GND', t: 'GND', f: 'Tierra' }], modo: 'abajo', piezas: [['cil', -9, -1.5, { r: 2.4, h: 5, color: '#b87333', n: 'Bobina', f: 'Sintoniza la frecuencia de 433 MHz' }], ['soic', 5, -1.5, { texto: 'LM358', n: 'Amplificador', f: 'Amplifica la señal de radio débil' }]] });
    return ensamble(F, V, [[tx, -20, 0], [rx, 14, 0]]);
  };

  M['humedad-suelo'] = (F, c, V) => {
    const mod = modulo(F, c, V, { w: 30, d: 16, titulo: 'SUELO', tituloPos: [0, -5.5], lado: 'oeste', pines: ['VCC', 'GND', 'DO', 'AO'], lado2: 'este', pines2: [{ n: 'Sonda +', t: 'otro', f: 'Va a una pata de la sonda' }, { n: 'Sonda −', t: 'otro', f: 'Va a la otra pata de la sonda' }], piezas: [['trimmer', -2, 1, {}], ['soic', 7, 1, { texto: 'LM393', n: 'Comparador LM393', f: 'Avisa (DO) cuando la tierra está más seca que el umbral' }], ['led', -9, -5, { color: '#ff3b30', on: true, menor: true, n: 'LED de encendido', f: 'Hay energía' }]] });
    const sonda = F.grupo();
    sonda.add(F.pon(F.caja(20, 1.6, 14, F.M.pcb(AZUL)), 0, .8, 0));
    [-6, 6].forEach(x => { sonda.add(F.pon(F.caja(5.5, 1.6, 44, F.M.pcb(AZUL)), x, .8, 29)); sonda.add(F.pon(F.caja(3.4, .1, 42, F.M.oro()), x, 1.65, 29)); });
    F.info(sonda, 'Sonda de dos patas', 'Se entierra en la maceta: el agua de la tierra deja pasar la corriente entre sus patas');
    const r = ensamble(F, V, [[mod, 0, 0], [sonda, 46, -10]]);
    r.userData.direccion = [.3, 1.1, 1];
    return r;
  };

  M['gps-neo-6m'] = (F, c, V) => {
    const mod = modulo(F, c, V, { w: 25, d: 36, titulo: 'GPS', tituloPos: [0, 9], pines: ['VCC', 'RX', 'TX', 'GND'], piezas: [
      ['caja', 0, -5, { w: 16, h: 2.4, d: 12.2, metal: true, n: 'Receptor NEO-6M', f: 'Calcula la posición midiendo el tiempo que tarda la señal de cada satélite' }],
      ['cil', 7, 6, { r: 3, h: 2, metal: true, n: 'Batería de respaldo', f: 'Recuerda los satélites para encontrar la posición más rápido', menor: true }], ['led', -7, 6, { color: '#3dff6a', menor: true, n: 'LED de posición', f: 'Parpadea cuando ya encontró la posición' }]] });
    const antena = F.grupo(F.pon(F.caja(25, 4, 25, F.M.plastico('#c9a46a', .5), .4), 0, 2, 0), F.pon(F.caja(18, .2, 18, F.M.estano()), 0, 4.1, 0));
    F.info(antena, 'Antena cerámica', 'Recibe las señales de los satélites: debe mirar al cielo');
    const r = ensamble(F, V, [[mod, 0, 0], [antena, -34, -4]]);
    r.add(F.cable([[-22, 4, -4], [-15, 6, -10], [-6, 5, -12], [-2, 4.5, -11]], '#2a2a2a', .5));
    return r;
  };

  /* =====================================================================
     Módulos que solo existen en la protoboard (no tienen ficha en la Biblioteca)
     ===================================================================== */
  const LM393 = (extra, titulo) => [['trimmer', 2, -1, {}], ['soic', -6, 3, { texto: 'LM393', n: 'Comparador LM393', f: 'Compara la señal con el umbral del potenciómetro' }], ['led', -6, -4, { color: '#ff3b30', on: true, menor: true, n: 'LED de encendido', f: 'Hay energía' }], ['led', -2, -4.5, { color: '#3dff6a', menor: true, n: 'LED de salida', f: 'Se enciende cuando la salida DO se activa' }]].concat(extra);
  const ESPECS_PB = {
    'pb-zumbador-pasivo': { w: 19, d: 15.5, color: NEGRO, titulo: 'KY-006', tituloPos: [5, 5.5], tituloAlto: 1.1, pines: ['S', '+', { n: '−', t: 'GND' }], piezas: [['cil', -1.5, -1.5, { r: 5.8, h: 7, color: '#141518', n: 'Zumbador pasivo', f: 'Vibra a la frecuencia que le envía tone(): así toca notas' }], ['cil', -1.5, -1.5, { r: 0.8, h: 0.1, color: '#000', y: 7, menor: true, n: 'Orificio', f: 'Por aquí sale el sonido' }]] },
    'pb-bme280': { w: 15, d: 13.5, color: MORADO, titulo: 'BME280', tituloPos: [2, -3.5], tituloAlto: 1.1, pines: ['VIN', 'GND', 'SCL', 'SDA'], piezas: [['caja', -3.5, -2.5, { w: 2.5, h: 0.95, d: 2.5, metal: true, n: 'Sensor BME280', f: 'Mide temperatura, humedad y presión en un chip de 2,5 mm' }], ['sot23', 3.5, -2.5, { n: 'Regulador de 3,3 V', f: 'Permite alimentarlo con 5 V' }], ['smd', 0, 1.5]] },
    'pb-hx711': { w: 56, d: 16, color: '#14161a', serigrafia: false, piezas: [
      ['caja', -9, 0, { w: 38, h: 12.7, d: 12.7, metal: true, radio: 0.6, n: 'Celda de carga (barra de aluminio)', f: 'Se dobla un poquito con el peso; sus galgas cambian de resistencia' }],
      ['caja', -9, 0, { w: 12, h: 0.4, d: 8, color: '#f2f2ee', y: 12.7, menor: true, n: 'Galga extensiométrica', f: 'Resistencia que cambia al estirarse' }],
      ['caja', 19, 0, { w: 18, h: 1.6, d: 15, color: '#1b6a3c', n: 'Placa HX711', f: 'Amplifica la señal de la celda y la convierte a números (24 bits)' }],
      ['soic', 19, 0, { pines: 16, texto: 'HX711', y: 1.6, n: 'Chip HX711', f: 'Convertidor analógico-digital de alta precisión' }]] },
    'pb-ldr': { w: 32, d: 14, titulo: 'LDR', tituloPos: [-3, -5], pines: ['VCC', 'GND', 'DO', 'AO'], lado: 'oeste', piezas: LM393([['cil', 12, 0, { r: 2.6, h: 1.8, color: '#d07a3c', n: 'Fotorresistencia LDR', f: 'Con más luz conduce mejor' }]]) },
    'pb-suelo': { w: 32, d: 16, titulo: 'SUELO', tituloPos: [-3, -5.5], lado: 'oeste', pines: ['VCC', 'GND', 'DO', 'AO'], lado2: 'este', pines2: ['+', { n: '−', t: 'GND' }], piezas: LM393([]) },
    'pb-llama': { w: 32, d: 14, titulo: 'LLAMA', tituloPos: [-3, -5], lado: 'oeste', pines: ['VCC', 'GND', 'DO', 'AO'], piezas: LM393([['led5', 12, 0, { color: '#14161a', opacidad: 0.95, horizontal: true, r: 2.5, h: 4, y: 2.5, chip: false, n: 'Receptor infrarrojo de llama', f: 'Detecta la luz infrarroja de 760 a 1100 nm que emite el fuego' }]]) },
    'pb-hall': { w: 19, d: 15.5, color: NEGRO, titulo: 'KY-003', tituloPos: [5, 5.5], tituloAlto: 1.1, pines: ['S', '+', { n: '−', t: 'GND' }], piezas: [['caja', -2, -3, { w: 4, h: 1.5, d: 3, color: '#141518', texto: '3144', n: 'Sensor de efecto Hall A3144', f: 'Cambia su salida cuando se le acerca un imán' }], ['led', 4, -3, { color: '#ff3b30', menor: true, n: 'LED', f: 'Se enciende al detectar el imán' }], ['smd', 4, 1]] },
    'pb-inclinacion': { w: 25, d: 13, titulo: 'SW-520D', tituloPos: [-2, -4.5], tituloAlto: 1.1, lado: 'oeste', pines: ['VCC', 'GND', 'DO'], piezas: [['cil', 7, 0, { r: 2.5, h: 9, metal: true, horizontal: true, y: 2.5, n: 'Interruptor de inclinación', f: 'Dentro hay dos bolitas que unen los contactos según la posición' }], ['soic', -4, 2.5, { texto: 'LM393', n: 'Comparador', f: 'Limpia la señal del interruptor' }], ['led', -4, -3.5, { color: '#3dff6a', menor: true, n: 'LED', f: 'Indica la posición' }]] },
    'pb-pulsador': { w: 19, d: 15.5, color: NEGRO, titulo: 'KY-004', tituloPos: [5, 5.5], tituloAlto: 1.1, pines: ['S', '+', { n: '−', t: 'GND' }], piezas: [['boton', -1, -2, { lado: 6 }], ['smd', 5, -2]] },
    'pb-acs712': { w: 31, d: 19, color: ROJO, titulo: 'ACS712 5A', tituloPos: [-3, -7], tituloAlto: 1.1, lado: 'oeste', pines: ['VCC', 'OUT', 'GND'], piezas: [['soic', -1, 0, { texto: 'ACS712', n: 'Sensor de corriente ACS712', f: 'Mide la corriente por el campo magnético que crea, sin tocar el circuito' }], ['bornera', 11, 0, { cant: 2, ry: Math.PI / 2, n: 'Bornera IP+ / IP−', f: 'Por aquí pasa la corriente que se quiere medir' }], ['led', -8, 5, { color: '#ff3b30', on: true, menor: true, n: 'LED', f: 'Hay energía' }]] },
    'pb-sensor-voltaje': { w: 25, d: 17, color: ROJO, titulo: '0–25 V', tituloPos: [-3, -6], tituloAlto: 1.2, lado: 'oeste', pines: ['S', '+', { n: '−', t: 'GND' }], piezas: [['bornera', 7, 0, { cant: 2, ry: Math.PI / 2, n: 'Bornera VCC / GND', f: 'Aquí se conecta el voltaje a medir (hasta 25 V)' }], ['smd', -3, -2, { n: 'Resistencia de 30 kΩ', f: 'Parte del divisor de voltaje (divide entre 5)' }], ['smd', -3, 2, { n: 'Resistencia de 7,5 kΩ', f: 'Parte del divisor de voltaje' }]] }
  };
  Object.keys(ESPECS_PB).forEach(id => { M[id] = (F, c, V) => modulo(F, c, V, ESPECS_PB[id]); });
  // Piezas sin placa
  M['pb-ds18-sonda'] = (F, c, V) => {
    const g = new V.T.Group();
    g.add(F.info(F.pon(F.cil(3, 3, 30, F.M.aluminio()), 10, 3, 0, 0, 0, Math.PI / 2), 'Sonda de acero inoxidable', 'Dentro está el DS18B20; se puede sumergir en agua'));
    g.add(F.info(F.pon(F.cil(2.2, 2.2, 4, F.M.negro()), -7, 3, 0, 0, 0, Math.PI / 2), 'Funda del cable', 'Protege la unión del cable con la sonda', { menor: true }));
    g.add(F.info(F.cable([[-9, 3, 0], [-16, 2.5, 0], [-22, 2, 0], [-28, 1.8, 0]], '#141518', 1.3), 'Cable', 'Lleva los 3 hilos hasta los pines', { menor: true }));
    ['#d32f2f', '#f2c200', '#1d1d1f'].forEach((col, i) => g.add(F.cable([[-28, 1.8, (i - 1) * 0.8], [-33, 1.2, (i - 1) * 2.54], [-36, 1, (i - 1) * 2.54]], col, 0.45)));
    g.userData.yPcb = 0; return g;
  };
  M['pb-final-carrera'] = (F, c, V) => {
    const g = new V.T.Group();
    g.add(F.info(F.pon(F.caja(20, 10, 6.4, F.M.negro(), 0.5), 0, 5, 0), 'Microinterruptor', 'Al presionar la palanca, el contacto C se une con NO'));
    g.add(F.pon(F.caja(3, 1.2, 3, F.M.plastico('#d32f2f', 0.4)), 4, 10.6, 0));
    g.add(F.info(F.pon(F.caja(20, 0.4, 4, F.M.aluminio()), 1, 12, 0, 0, 0, -0.18), 'Palanca metálica', 'Se empuja cuando algo llega al final del recorrido'));
    [-6, 0, 6].forEach(x => g.add(F.pon(F.caja(1.2, 4, 3, F.mat({ color: '#d9ab45', metalness: 0.9, roughness: 0.3 })), x, -1, 0)));
    g.userData.yPcb = 0; return g;
  };
  M['pb-reed-puerta'] = (F, c, V) => {
    const g = new V.T.Group(), blanco = F.M.plastico('#f1f1ee', 0.45);
    g.add(F.info(F.pon(F.caja(26, 9, 13, blanco, 1.5), -8, 4.5, 0), 'Sensor (con el interruptor reed)', 'Dentro hay dos láminas que se juntan cuando el imán está cerca'));
    g.add(F.info(F.pon(F.caja(26, 9, 13, blanco, 1.5), 22, 4.5, 0), 'Imán', 'Se pone en la puerta; al abrirla se aleja del sensor'));
    g.add(F.cable([[-21, 4, 2], [-27, 3, 2], [-32, 2, 2]], '#e9e9ee', 0.6)); g.add(F.cable([[-21, 4, -2], [-27, 3, -2], [-32, 2, -2]], '#e9e9ee', 0.6));
    g.userData.yPcb = 0; return g;
  };

  /* ----- Registrar las recetas y el constructor genérico ----- */
  Object.keys(ESPECS).forEach(id => { M[id] = (F, c, V) => modulo(F, c, V, ESPECS[id]); });
  V3.especs = ESPECS;   // la protoboard usa estas recetas para saber tamaño, color y pines de cada módulo
  M['*'] = (F, c, V) => {
    // Módulo genérico: una PCB con un pin por cada pin de los datos
    const etiquetas = c.pines.slice(0, 12).map(p => ({ n: p.nombre.split(/[ ,(/]/)[0], t: p.tipo, f: p.funcion }));
    return modulo(F, c, V, { w: Math.max(20, etiquetas.length * 2.54 + 6), d: 20, titulo: c.nombre.split(' ')[0], pines: etiquetas });
  };
})();
