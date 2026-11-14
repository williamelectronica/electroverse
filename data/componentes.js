/* =====================================================================
   ELECTROVERSE · Biblioteca de componentes (archivo de datos único)
   ---------------------------------------------------------------------
   Aquí vive TODA la información de placas, sensores, módulos y chips.
   La app solo lee este archivo: si quieres corregir un dato o agregar
   un componente, hazlo aquí y aparecerá en la sección "Biblioteca".

   Estructura de cada componente:
     id, nombre, categoria, descripcion, funcionamiento,
     pines: [{ nombre, tipo, voltaje, funcion }],
     voltajeOperacion, corrienteTipica, logica ('3.3 V' | '5 V' | '3.3 V y 5 V'),
     compatibleCon: ['Arduino Uno', 'Arduino Nano', 'Arduino Mega', 'ESP32'],
     conexionArduino / conexionESP32: [{ componente, placa, nota }],
     codigoArduino / codigoESP32: texto del programa (o null),
     advertencias: [], aplicaciones: [],
     porVerificar: [] → datos que aún hay que comprobar con la hoja de datos.
   Extras opcionales: datos (tabla de características), encabezados
   (para dibujar el pinout de una placa), compuertas y tablaVerdad (chips).

   Las conexiones de "Arduino" están pensadas para el Arduino Uno R3.
   Las de "ESP32" para el ESP32 DevKit V1 de 30 pines.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Categorías (el orden es el que se muestra en la app) ---------- */
  const CATEGORIAS = [
    { id: 'placa', nombre: 'Placas' },
    { id: 'sensor', nombre: 'Sensores' },
    { id: 'actuador', nombre: 'Actuadores' },
    { id: 'comunicacion', nombre: 'Comunicación' },
    { id: 'visualizacion', nombre: 'Visualización' },
    { id: 'alimentacion', nombre: 'Alimentación' },
    { id: 'basico', nombre: 'Básicos' },
    { id: 'ci', nombre: 'Circuitos integrados' }
  ];

  /* ---------- Tipos de pin y su color (lo usa la app para pintar los pines) ---------- */
  const TIPOS_PIN = {
    'alimentación': '#e53935', 'GND': '#5f6673', 'digital': '#22a6f2', 'analógico': '#2bb673',
    'PWM': '#a07bff', 'I2C': '#ffb52e', 'SPI': '#ff4fb8', 'UART': '#00c2b8', 'otro': '#9aa7cc'
  };

  const LISTA = [];

  /* Ayudantes para escribir los datos más corto:
     P('5V', 'alimentación', '5 V', 'Salida regulada')  → un pin
     K('VCC', '5V', 'nota opcional')                     → una conexión */
  const P = (nombre, tipo, voltaje, funcion) => ({ nombre, tipo, voltaje: voltaje || '', funcion: funcion || '' });
  const K = (componente, placa, nota) => ({ componente, placa, nota: nota || '' });

  /* Compatibilidades típicas */
  const TODAS = ['Arduino Uno', 'Arduino Nano', 'Arduino Mega', 'ESP32'];

  function agregar(c) {
    // Valores por defecto para que la app nunca encuentre un campo vacío
    const base = {
      pines: [], compatibleCon: TODAS, conexionArduino: [], conexionESP32: [],
      codigoArduino: null, codigoESP32: null, advertencias: [], aplicaciones: [], porVerificar: [],
      voltajeOperacion: '', corrienteTipica: '', logica: ''
    };
    const comp = Object.assign(base, c);
    if (LISTA.some(x => x.id === comp.id)) console.warn('Componente repetido en la biblioteca:', comp.id);
    LISTA.push(comp);
  }

  /* =====================================================================
     1. PLACAS
     ===================================================================== */

  agregar({
    id: 'uno-r3', nombre: 'UNO R3', categoria: 'placa',
    descripcion: 'La placa más usada para aprender. Tiene un microcontrolador ATmega328P que ejecuta tu programa una y otra vez.',
    funcionamiento: 'El microcontrolador es como un pequeño cerebro con memoria: lee las entradas (botones, sensores), sigue las instrucciones de tu programa y decide qué salidas encender. Es como un árbitro que mira el partido y toca el silbato según las reglas que le enseñaste.',
    voltajeOperacion: '5 V (alimentación por USB o de 7 a 12 V por el conector DC / VIN)',
    corrienteTipica: '≈ 50 mA la placa sola · máx. 20 mA recomendado por pin (40 mA es el límite absoluto) · máx. 200 mA sumando todos los pines',
    logica: '5 V',
    compatibleCon: ['Arduino Uno'],
    datos: [
      ['Microcontrolador', 'ATmega328P a 16 MHz'], ['Memoria de programa', '32 KB (0,5 KB los usa el gestor de arranque)'],
      ['RAM', '2 KB'], ['EEPROM', '1 KB'], ['Pines digitales', '14 (D0–D13), 6 con PWM: 3, 5, 6, 9, 10, 11'],
      ['Entradas analógicas', '6 (A0–A5), 10 bits: valores de 0 a 1023'], ['Interrupciones externas', 'D2 y D3'],
      ['Conector USB', 'Tipo B'], ['LED integrado', 'D13']
    ],
    pines: [
      P('D0 (RX)', 'UART', '5 V', 'Recibe datos del USB. Evítalo si usas el monitor serie'),
      P('D1 (TX)', 'UART', '5 V', 'Envía datos al USB. Evítalo si usas el monitor serie'),
      P('D2', 'digital', '5 V', 'Entrada/salida · interrupción 0'),
      P('D3', 'PWM', '5 V', 'Entrada/salida · PWM · interrupción 1'),
      P('D4', 'digital', '5 V', 'Entrada/salida'),
      P('D5', 'PWM', '5 V', 'Entrada/salida · PWM'),
      P('D6', 'PWM', '5 V', 'Entrada/salida · PWM'),
      P('D7', 'digital', '5 V', 'Entrada/salida'),
      P('D8', 'digital', '5 V', 'Entrada/salida'),
      P('D9', 'PWM', '5 V', 'Entrada/salida · PWM'),
      P('D10 (SS)', 'SPI', '5 V', 'PWM · selección de esclavo SPI'),
      P('D11 (MOSI)', 'SPI', '5 V', 'PWM · datos SPI hacia el módulo'),
      P('D12 (MISO)', 'SPI', '5 V', 'Datos SPI desde el módulo'),
      P('D13 (SCK)', 'SPI', '5 V', 'Reloj SPI · LED integrado'),
      P('A0', 'analógico', '0–5 V', 'Entrada analógica (también digital D14)'),
      P('A1', 'analógico', '0–5 V', 'Entrada analógica (D15)'),
      P('A2', 'analógico', '0–5 V', 'Entrada analógica (D16)'),
      P('A3', 'analógico', '0–5 V', 'Entrada analógica (D17)'),
      P('A4 (SDA)', 'I2C', '0–5 V', 'Entrada analógica · datos I2C'),
      P('A5 (SCL)', 'I2C', '0–5 V', 'Entrada analógica · reloj I2C'),
      P('SDA / SCL', 'I2C', '5 V', 'Copias de A4 y A5 junto a AREF'),
      P('AREF', 'otro', '≤ 5 V', 'Referencia para las entradas analógicas'),
      P('5V', 'alimentación', '5 V', 'Salida regulada de 5 V para módulos'),
      P('3.3V', 'alimentación', '3,3 V', 'Salida de 3,3 V (máx. 50 mA)'),
      P('VIN', 'alimentación', '7–12 V', 'Entrada de alimentación externa sin regular'),
      P('GND', 'GND', '0 V', 'Tierra (hay 3 en la placa)'),
      P('IOREF', 'otro', '5 V', 'Indica a los shields que la lógica es de 5 V'),
      P('RESET', 'otro', '5 V', 'Si lo llevas a GND, reinicia la placa')
    ],
    encabezados: {
      'Lado de pines digitales': ['SCL', 'SDA', 'AREF', 'GND', 'D13', 'D12', 'D11~', 'D10~', 'D9~', 'D8', 'D7', 'D6~', 'D5~', 'D4', 'D3~', 'D2', 'D1 TX', 'D0 RX'],
      'Lado de alimentación y analógicos': ['NC', 'IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4 SDA', 'A5 SCL']
    },
    codigoArduino: `// Parpadeo: el "Hola mundo" de la electrónica
// El LED integrado está en el pin 13

const int PIN_LED = 13;        // pin del LED integrado
const int TIEMPO_MS = 500;     // medio segundo

void setup() {
  pinMode(PIN_LED, OUTPUT);    // el pin será una salida
  Serial.begin(9600);          // abre el monitor serie
  Serial.println("UNO R3 listo");
}

void loop() {
  digitalWrite(PIN_LED, HIGH); // enciende (5 V)
  delay(TIEMPO_MS);
  digitalWrite(PIN_LED, LOW);  // apaga (0 V)
  delay(TIEMPO_MS);
}`,
    advertencias: [
      'Nunca conectes más de 5 V a un pin de entrada: se daña el microcontrolador.',
      'Un LED siempre va con resistencia (220 Ω a 330 Ω). Sin ella se quema el LED o el pin.',
      'Los motores, servos y relés no deben alimentarse del pin 5V si consumen mucho: usa una fuente aparte y une las tierras (GND).',
      'D0 y D1 se usan para subir el programa: desconecta lo que tengas ahí si falla la carga.'
    ],
    aplicaciones: ['Semáforo con LEDs', 'Termómetro con pantalla LCD', 'Robot seguidor de línea', 'Alarma con sensor de movimiento']
  });

  agregar({
    id: 'nano', nombre: 'Nano', categoria: 'placa',
    descripcion: 'El mismo cerebro que el UNO (ATmega328P) en una placa pequeña que se inserta directamente en la protoboard.',
    funcionamiento: 'Funciona igual que el UNO, pero en tamaño de bolsillo. Es como tener el mismo motor de un auto grande dentro de un auto compacto.',
    voltajeOperacion: '5 V (USB) o de 7 a 12 V por VIN',
    corrienteTipica: '≈ 20 mA la placa sola · máx. 20 mA recomendado por pin',
    logica: '5 V',
    compatibleCon: ['Arduino Nano'],
    datos: [
      ['Microcontrolador', 'ATmega328P a 16 MHz'], ['Memoria de programa', '32 KB (2 KB para el gestor de arranque)'],
      ['RAM', '2 KB'], ['Pines digitales', '14 (D0–D13), PWM en 3, 5, 6, 9, 10, 11'],
      ['Entradas analógicas', '8 (A0–A7). A6 y A7 son SOLO analógicas'], ['Conector USB', 'Mini-USB (o USB-C en algunos clones)'],
      ['LED integrado', 'D13']
    ],
    pines: [
      P('D0 (RX) / D1 (TX)', 'UART', '5 V', 'Comunicación con el USB'),
      P('D2, D3', 'digital', '5 V', 'Interrupciones externas (D3 también PWM)'),
      P('D3, D5, D6, D9, D10, D11', 'PWM', '5 V', 'Salidas PWM'),
      P('D10 (SS) · D11 (MOSI) · D12 (MISO) · D13 (SCK)', 'SPI', '5 V', 'Bus SPI'),
      P('A0–A3', 'analógico', '0–5 V', 'Entradas analógicas (también digitales)'),
      P('A4 (SDA) / A5 (SCL)', 'I2C', '0–5 V', 'Bus I2C'),
      P('A6, A7', 'analógico', '0–5 V', 'Solo entrada analógica: no sirven como digitales'),
      P('5V', 'alimentación', '5 V', 'Salida de 5 V (o entrada regulada)'),
      P('3V3', 'alimentación', '3,3 V', 'Salida pequeña de 3,3 V'),
      P('VIN', 'alimentación', '7–12 V', 'Entrada externa sin regular'),
      P('GND', 'GND', '0 V', 'Tierra (2 pines)'),
      P('RST', 'otro', '5 V', 'Reinicio (2 pines)'),
      P('AREF', 'otro', '≤ 5 V', 'Referencia analógica')
    ],
    encabezados: {
      'Izquierda (USB arriba)': ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RST', 'GND', 'VIN'],
      'Derecha (USB arriba)': ['D12', 'D11~', 'D10~', 'D9~', 'D8', 'D7', 'D6~', 'D5~', 'D4', 'D3~', 'D2', 'GND', 'RST', 'D0 RX', 'D1 TX']
    },
    codigoArduino: `// Nano: lee un potenciómetro en A0 y regula el brillo de un LED en D9
const int PIN_POT = A0;   // cursor del potenciómetro
const int PIN_LED = 9;    // LED con resistencia de 220 Ω (pin con PWM)

void setup() {
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lectura = analogRead(PIN_POT);          // 0 a 1023
  int brillo = map(lectura, 0, 1023, 0, 255); // PWM usa 0 a 255
  analogWrite(PIN_LED, brillo);
  Serial.println(lectura);
  delay(50);
}`,
    advertencias: [
      'Muchos Nano económicos usan el chip USB CH340: instala su controlador si Windows no reconoce la placa.',
      'En Arduino IDE, si la carga falla, prueba Herramientas → Procesador → "ATmega328P (Old Bootloader)".',
      'A6 y A7 no funcionan con digitalRead ni digitalWrite.'
    ],
    aplicaciones: ['Proyectos compactos en protoboard', 'Robots pequeños', 'Instrumentos portátiles con batería'],
    porVerificar: ['El orden exacto de los pines puede variar en algunos clones: compáralo con la serigrafía de tu placa.']
  });

  agregar({
    id: 'mega-2560', nombre: 'Mega 2560', categoria: 'placa',
    descripcion: 'Placa grande con muchos más pines y memoria. Ideal cuando el UNO se queda corto (impresoras 3D, robots con muchos sensores).',
    funcionamiento: 'Usa el microcontrolador ATmega2560. Es como pasar de una mochila a una maleta: el mismo tipo de trabajo, pero con mucho más espacio para pines y programa.',
    voltajeOperacion: '5 V (USB) o de 7 a 12 V por el conector DC / VIN',
    corrienteTipica: '≈ 70 mA la placa sola · máx. 20 mA recomendado por pin',
    logica: '5 V',
    compatibleCon: ['Arduino Mega'],
    datos: [
      ['Microcontrolador', 'ATmega2560 a 16 MHz'], ['Memoria de programa', '256 KB (8 KB para el gestor de arranque)'],
      ['RAM', '8 KB'], ['EEPROM', '4 KB'], ['Pines digitales', '54 (D0–D53), 15 con PWM: 2–13 y 44–46'],
      ['Entradas analógicas', '16 (A0–A15), 10 bits'], ['Puertos serie', '4: Serial (0/1), Serial1 (19/18), Serial2 (17/16), Serial3 (15/14)'],
      ['Interrupciones externas', '2, 3, 18, 19, 20, 21'], ['LED integrado', 'D13']
    ],
    pines: [
      P('D0 (RX0) / D1 (TX0)', 'UART', '5 V', 'Serial: conectado al USB'),
      P('D19 (RX1) / D18 (TX1)', 'UART', '5 V', 'Serial1'),
      P('D17 (RX2) / D16 (TX2)', 'UART', '5 V', 'Serial2'),
      P('D15 (RX3) / D14 (TX3)', 'UART', '5 V', 'Serial3'),
      P('D2–D13', 'PWM', '5 V', 'Entradas/salidas con PWM'),
      P('D44, D45, D46', 'PWM', '5 V', 'Entradas/salidas con PWM'),
      P('D22–D53', 'digital', '5 V', 'Entradas/salidas en el conector doble del extremo'),
      P('D20 (SDA) / D21 (SCL)', 'I2C', '5 V', 'Bus I2C (¡no en A4/A5 como en el UNO!)'),
      P('D50 (MISO) · D51 (MOSI) · D52 (SCK) · D53 (SS)', 'SPI', '5 V', 'Bus SPI'),
      P('A0–A15', 'analógico', '0–5 V', 'Entradas analógicas (también digitales D54–D69)'),
      P('5V', 'alimentación', '5 V', 'Salida regulada'),
      P('3.3V', 'alimentación', '3,3 V', 'Salida de 3,3 V (máx. 50 mA)'),
      P('VIN', 'alimentación', '7–12 V', 'Entrada externa'),
      P('GND', 'GND', '0 V', 'Tierra (varios pines)'),
      P('AREF', 'otro', '≤ 5 V', 'Referencia analógica'),
      P('RESET', 'otro', '5 V', 'Reinicio')
    ],
    codigoArduino: `// Mega 2560: usa un segundo puerto serie (Serial1) sin perder el monitor
// Serial  → monitor de la computadora
// Serial1 → módulo externo en los pines 19 (RX1) y 18 (TX1)

void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);
  Serial.println("Mega listo: lo que llegue por Serial1 se verá aquí");
}

void loop() {
  if (Serial1.available()) {          // ¿llegó algo del módulo?
    char letra = Serial1.read();
    Serial.write(letra);              // lo mostramos en el monitor
  }
}`,
    advertencias: [
      'El bus I2C está en D20 y D21, no en A4 y A5: los shields hechos para el UNO pueden necesitar cables extra.',
      'El bus SPI está en D50–D53, no en D10–D13.',
      'Algunas librerías con SoftwareSerial solo aceptan ciertos pines RX en el Mega: es mejor usar Serial1, Serial2 o Serial3.'
    ],
    aplicaciones: ['Robots con muchos motores y sensores', 'Impresoras 3D y máquinas CNC', 'Tableros con muchos botones y LEDs']
  });

  /* ---------- Advertencias comunes del ESP32 (se reutilizan en todas sus variantes) ---------- */
  const AVISOS_ESP32 = [
    'Lógica de 3,3 V: NUNCA conectes una señal de 5 V directo a un GPIO. Usa un divisor de voltaje o un conversor de nivel lógico.',
    'Los GPIO 34, 35, 36 (VP) y 39 (VN) son SOLO de entrada y no tienen resistencia pull-up interna.',
    'ADC2 (GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27) no funciona mientras el Wi-Fi está activo: para sensores analógicos con Wi-Fi usa ADC1 (GPIO 32–39).',
    'Pines de arranque: GPIO 0, 2, 5, 12 y 15 deciden cómo arranca la placa. Si les conectas algo que los fuerce a HIGH o LOW, la placa puede no arrancar o no dejar subir el programa.',
    'GPIO 6 a 11 están conectados a la memoria flash interna: no los uses nunca.',
    'El ADC del ESP32 no es lineal cerca de 0 V y de 3,3 V: las lecturas extremas son poco precisas.'
  ];

  agregar({
    id: 'esp32-devkit-30', nombre: 'ESP32 DevKit V1 (30 pines)', categoria: 'placa',
    descripcion: 'Placa con Wi-Fi y Bluetooth integrados, dos núcleos y mucha más velocidad que el UNO. Perfecta para proyectos de IoT.',
    funcionamiento: 'El chip ESP32 tiene dos procesadores y una radio. Es como un celular muy simple: puede leer sensores y, al mismo tiempo, enviar los datos por Wi-Fi a internet.',
    voltajeOperacion: '3,3 V en los pines · se alimenta con 5 V por USB o por VIN',
    corrienteTipica: '≈ 80 mA en uso normal · picos de 250 mA o más con Wi-Fi · ≈ 20 mA recomendado por GPIO (40 mA máx.)',
    logica: '3.3 V',
    compatibleCon: ['ESP32'],
    datos: [
      ['Chip', 'ESP32-WROOM-32 · 2 núcleos a 240 MHz'], ['Memoria flash', '4 MB (normalmente)'], ['RAM', '520 KB'],
      ['Conectividad', 'Wi-Fi 2,4 GHz y Bluetooth (clásico y BLE)'], ['ADC', '12 bits: valores de 0 a 4095'],
      ['DAC', '2 canales de 8 bits: GPIO 25 y 26'], ['PWM', 'Casi todos los GPIO de salida (LEDC, 16 canales)'],
      ['I2C por defecto', 'SDA = GPIO 21 · SCL = GPIO 22'], ['SPI por defecto (VSPI)', 'MOSI 23 · MISO 19 · SCK 18 · SS 5'],
      ['UART2', 'RX2 = GPIO 16 · TX2 = GPIO 17'], ['Táctiles', 'GPIO 4, 2, 15, 13, 12, 14, 27, 33, 32'],
      ['LED integrado', 'GPIO 2 (azul)'], ['Botones', 'EN (reinicio) y BOOT (GPIO 0)']
    ],
    pines: [
      P('EN', 'otro', '3,3 V', 'Reinicio (activo en LOW)'),
      P('VP (GPIO 36)', 'analógico', '0–3,3 V', 'Solo entrada · ADC1'),
      P('VN (GPIO 39)', 'analógico', '0–3,3 V', 'Solo entrada · ADC1'),
      P('GPIO 34', 'analógico', '0–3,3 V', 'Solo entrada · ADC1'),
      P('GPIO 35', 'analógico', '0–3,3 V', 'Solo entrada · ADC1'),
      P('GPIO 32', 'analógico', '3,3 V', 'E/S · ADC1 · táctil'),
      P('GPIO 33', 'analógico', '3,3 V', 'E/S · ADC1 · táctil'),
      P('GPIO 25', 'analógico', '3,3 V', 'E/S · ADC2 · DAC1'),
      P('GPIO 26', 'analógico', '3,3 V', 'E/S · ADC2 · DAC2'),
      P('GPIO 27', 'digital', '3,3 V', 'E/S · ADC2 · táctil'),
      P('GPIO 14', 'digital', '3,3 V', 'E/S · ADC2 · táctil (emite pulsos PWM al arrancar)'),
      P('GPIO 12', 'digital', '3,3 V', 'E/S · ADC2 · PIN DE ARRANQUE: debe estar en LOW al encender'),
      P('GPIO 13', 'digital', '3,3 V', 'E/S · ADC2 · táctil'),
      P('GND', 'GND', '0 V', 'Tierra'),
      P('VIN', 'alimentación', '5 V', 'Entrada de 5 V (o salida de 5 V del USB)'),
      P('GPIO 23 (MOSI)', 'SPI', '3,3 V', 'E/S · SPI datos de salida'),
      P('GPIO 22 (SCL)', 'I2C', '3,3 V', 'E/S · reloj I2C'),
      P('GPIO 1 (TX0)', 'UART', '3,3 V', 'Transmisión al USB: evítalo'),
      P('GPIO 3 (RX0)', 'UART', '3,3 V', 'Recepción del USB: evítalo'),
      P('GPIO 21 (SDA)', 'I2C', '3,3 V', 'E/S · datos I2C'),
      P('GPIO 19 (MISO)', 'SPI', '3,3 V', 'E/S · SPI datos de entrada'),
      P('GPIO 18 (SCK)', 'SPI', '3,3 V', 'E/S · reloj SPI'),
      P('GPIO 5 (SS)', 'SPI', '3,3 V', 'E/S · SPI selección · pin de arranque'),
      P('GPIO 17 (TX2)', 'UART', '3,3 V', 'E/S · UART2 transmisión'),
      P('GPIO 16 (RX2)', 'UART', '3,3 V', 'E/S · UART2 recepción'),
      P('GPIO 4', 'digital', '3,3 V', 'E/S · ADC2 · táctil'),
      P('GPIO 2', 'digital', '3,3 V', 'E/S · LED integrado · pin de arranque'),
      P('GPIO 15', 'digital', '3,3 V', 'E/S · ADC2 · pin de arranque'),
      P('GND', 'GND', '0 V', 'Tierra'),
      P('3V3', 'alimentación', '3,3 V', 'Salida del regulador de 3,3 V')
    ],
    encabezados: {
      'Izquierda (antena arriba)': ['EN', 'VP 36', 'VN 39', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', 'GND', 'VIN'],
      'Derecha (antena arriba)': ['23', '22', 'TX0 1', 'RX0 3', '21', '19', '18', '5', 'TX2 17', 'RX2 16', '4', '2', '15', 'GND', '3V3']
    },
    codigoESP32: `// ESP32: parpadeo y búsqueda de redes Wi-Fi cercanas
#include <WiFi.h>

const int PIN_LED = 2;   // LED azul integrado

void setup() {
  Serial.begin(115200);  // el ESP32 suele usar 115200 baudios
  pinMode(PIN_LED, OUTPUT);
  WiFi.mode(WIFI_STA);   // modo "estación" (como un celular)
}

void loop() {
  digitalWrite(PIN_LED, HIGH);
  int redes = WiFi.scanNetworks();          // busca redes
  Serial.printf("Encontré %d redes:\\n", redes);
  for (int i = 0; i < redes; i++) {
    Serial.printf("  %s  (%d dBm)\\n", WiFi.SSID(i).c_str(), WiFi.RSSI(i));
  }
  digitalWrite(PIN_LED, LOW);
  delay(5000);
}`,
    advertencias: AVISOS_ESP32.concat([
      'En la versión de 30 pines el GPIO 0 no sale al conector: está en el botón BOOT.',
      'Si Arduino IDE muestra "Connecting…" y no avanza, mantén presionado BOOT hasta que empiece a cargar.'
    ]),
    aplicaciones: ['Estación meteorológica con datos en internet', 'Control de luces desde el celular', 'Panel IoT con MQTT', 'Alarma con aviso por Wi-Fi']
  });

  agregar({
    id: 'esp32-devkit-38', nombre: 'ESP32 DevKit (38 pines)', categoria: 'placa',
    descripcion: 'Versión de 38 pines del ESP32 DevKit (tipo DevKitC). Saca al conector algunos pines más, incluido el GPIO 0 y los de la memoria flash.',
    funcionamiento: 'Es el mismo chip ESP32 que la versión de 30 pines. La diferencia es que tiene más patas disponibles, como una regleta con más enchufes.',
    voltajeOperacion: '3,3 V en los pines · 5 V por USB o por el pin 5V',
    corrienteTipica: '≈ 80 mA en uso normal · picos de 250 mA o más con Wi-Fi',
    logica: '3.3 V',
    compatibleCon: ['ESP32'],
    datos: [
      ['Chip', 'ESP32-WROOM-32 · 2 núcleos a 240 MHz'], ['Diferencia con la de 30 pines', 'Agrega 3V3 extra, GPIO 0, 5V y los pines de flash (6–11)'],
      ['I2C por defecto', 'SDA 21 · SCL 22'], ['SPI por defecto', 'MOSI 23 · MISO 19 · SCK 18 · SS 5'], ['LED integrado', 'Depende del fabricante (a veces no tiene)']
    ],
    pines: [
      P('3V3', 'alimentación', '3,3 V', 'Salida de 3,3 V'), P('EN', 'otro', '3,3 V', 'Reinicio'),
      P('VP 36, VN 39, 34, 35', 'analógico', '0–3,3 V', 'Solo entrada · ADC1'),
      P('32, 33', 'analógico', '3,3 V', 'E/S · ADC1 · táctil'), P('25, 26', 'analógico', '3,3 V', 'E/S · ADC2 · DAC'),
      P('27, 14, 12, 13', 'digital', '3,3 V', 'E/S · ADC2 · táctil (12 es pin de arranque)'),
      P('GND', 'GND', '0 V', 'Tierra (3 pines)'),
      P('SD2 (9), SD3 (10), CMD (11), CLK (6), SD0 (7), SD1 (8)', 'otro', '—', 'Memoria flash: ¡NO USAR!'),
      P('5V', 'alimentación', '5 V', 'Entrada/salida de 5 V del USB'),
      P('23 (MOSI), 19 (MISO), 18 (SCK), 5 (SS)', 'SPI', '3,3 V', 'Bus SPI (5 es pin de arranque)'),
      P('22 (SCL), 21 (SDA)', 'I2C', '3,3 V', 'Bus I2C'),
      P('TX 1, RX 3', 'UART', '3,3 V', 'Serie del USB: evítalos'),
      P('17 (TX2), 16 (RX2)', 'UART', '3,3 V', 'UART2'),
      P('4', 'digital', '3,3 V', 'E/S · ADC2 · táctil'),
      P('0', 'digital', '3,3 V', 'Pin de arranque (botón BOOT): LOW al encender = modo de carga'),
      P('2', 'digital', '3,3 V', 'E/S · pin de arranque'), P('15', 'digital', '3,3 V', 'E/S · pin de arranque')
    ],
    encabezados: {
      'Izquierda (antena arriba)': ['3V3', 'EN', 'VP 36', 'VN 39', '34', '35', '32', '33', '25', '26', '27', '14', '12', 'GND', '13', 'SD2 9', 'SD3 10', 'CMD 11', '5V'],
      'Derecha (antena arriba)': ['GND', '23', '22', 'TX 1', 'RX 3', '21', 'GND', '19', '18', '5', '17', '16', '4', '0', '2', '15', 'SD1 8', 'SD0 7', 'CLK 6']
    },
    codigoESP32: `// ESP32 (38 pines): botón BOOT (GPIO 0) como entrada
const int PIN_BOTON = 0;    // botón BOOT de la placa
const int PIN_LED = 2;      // conecta un LED con resistencia de 220 Ω

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BOTON, INPUT_PULLUP); // sin presionar = HIGH
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  bool presionado = digitalRead(PIN_BOTON) == LOW;
  digitalWrite(PIN_LED, presionado ? HIGH : LOW);
  Serial.println(presionado ? "Presionado" : "Suelto");
  delay(100);
}`,
    advertencias: AVISOS_ESP32.concat(['En esta versión los pines 6–11 SÍ salen al conector (CLK, SD0–SD3, CMD): no los uses aunque estén ahí.']),
    aplicaciones: ['Los mismos que el DevKit de 30 pines, cuando se necesitan más conexiones'],
    porVerificar: ['El orden de los pines corresponde al DevKitC V4; algunos clones de 38 pines cambian el orden o el LED integrado. Compáralo con la serigrafía de tu placa.']
  });

  agregar({
    id: 'esp32-cam', nombre: 'ESP32-CAM', categoria: 'placa',
    descripcion: 'ESP32 con cámara de 2 MP (OV2640), ranura para tarjeta microSD y un LED muy brillante (flash). Sirve para tomar fotos y transmitir video por Wi-Fi.',
    funcionamiento: 'El ESP32 lee la imagen de la cámara cuadro por cuadro y la envía por Wi-Fi a una página web. Es como una cámara de seguridad diminuta que tú programas.',
    voltajeOperacion: '5 V recomendado por el pin 5V (también acepta 3,3 V, pero se reinicia más fácil)',
    corrienteTipica: '≈ 180 mA transmitiendo · picos de hasta 300 mA o más con el flash encendido',
    logica: '3.3 V',
    compatibleCon: ['ESP32'],
    datos: [
      ['Módulo', 'ESP32-S (tipo AI-Thinker) con 4 MB de PSRAM'], ['Cámara', 'OV2640 de 2 MP'], ['USB', 'No tiene: se programa con un adaptador USB-serie o con la base ESP32-CAM-MB'],
      ['LED flash', 'GPIO 4'], ['LED rojo pequeño', 'GPIO 33 (se enciende con LOW)'], ['microSD', 'Usa GPIO 2, 4, 12, 13, 14 y 15']
    ],
    pines: [
      P('5V', 'alimentación', '5 V', 'Entrada de alimentación recomendada'),
      P('GND', 'GND', '0 V', 'Tierra (varios pines)'),
      P('GPIO 12', 'digital', '3,3 V', 'E/S · microSD · pin de arranque'),
      P('GPIO 13', 'digital', '3,3 V', 'E/S · microSD'),
      P('GPIO 15', 'digital', '3,3 V', 'E/S · microSD · pin de arranque'),
      P('GPIO 14', 'digital', '3,3 V', 'E/S · microSD'),
      P('GPIO 2', 'digital', '3,3 V', 'E/S · microSD · pin de arranque'),
      P('GPIO 4', 'digital', '3,3 V', 'LED flash · microSD'),
      P('3V3', 'alimentación', '3,3 V', 'Entrada/salida de 3,3 V'),
      P('GPIO 16', 'digital', '3,3 V', 'Lo usa la PSRAM: evítalo'),
      P('GPIO 0', 'digital', '3,3 V', 'Conectar a GND solo para cargar el programa'),
      P('VCC', 'alimentación', '3,3 V / 5 V', 'Salida (depende de un puente en la placa)'),
      P('U0R (GPIO 3)', 'UART', '3,3 V', 'Recepción serie: va al TX del adaptador'),
      P('U0T (GPIO 1)', 'UART', '3,3 V', 'Transmisión serie: va al RX del adaptador')
    ],
    encabezados: {
      'Lado izquierdo': ['5V', 'GND', 'IO12', 'IO13', 'IO15', 'IO14', 'IO2', 'IO4'],
      'Lado derecho': ['3V3', 'IO16', 'IO0', 'GND', 'VCC', 'U0R', 'U0T', 'GND']
    },
    conexionESP32: [
      K('5V', '5V del adaptador USB-serie'), K('GND', 'GND del adaptador'),
      K('U0R', 'TX del adaptador'), K('U0T', 'RX del adaptador'),
      K('GPIO 0', 'GND', 'Solo mientras cargas el programa; luego quítalo y presiona RESET')
    ],
    codigoESP32: `// ESP32-CAM: parpadeo del LED rojo de la placa
// Placa en Arduino IDE: "AI Thinker ESP32-CAM"
// El LED rojo (GPIO 33) se ENCIENDE con LOW (lógica invertida)

const int PIN_LED_ROJO = 33;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_ROJO, OUTPUT);
  Serial.println("ESP32-CAM lista. Para video usa el ejemplo CameraWebServer.");
}

void loop() {
  digitalWrite(PIN_LED_ROJO, LOW);   // enciende
  delay(300);
  digitalWrite(PIN_LED_ROJO, HIGH);  // apaga
  delay(300);
}`,
    advertencias: AVISOS_ESP32.slice(0, 1).concat([
      'No tiene USB: necesitas un adaptador USB-serie de 3,3 V o la base ESP32-CAM-MB.',
      'Para subir el programa, GPIO 0 debe estar en GND al reiniciar. Después quita ese cable y presiona RESET para ejecutar.',
      'Si se reinicia sola ("Brownout detector was triggered"), la fuente no da suficiente corriente: usa 5 V con al menos 1 A.',
      'El LED flash (GPIO 4) es muy brillante y se calienta: no lo mires de cerca ni lo dejes encendido mucho tiempo.',
      'Con la microSD en uso quedan muy pocos GPIO libres.'
    ]),
    aplicaciones: ['Cámara de vigilancia por Wi-Fi', 'Timbre con foto', 'Reconocimiento de colores u objetos sencillos', 'Fotos a intervalos (time-lapse) en la microSD'],
    porVerificar: ['Distribución de pines del modelo AI-Thinker; otros fabricantes pueden diferir.']
  });

  agregar({
    id: 'esp32-s3-devkit', nombre: 'ESP32-S3 DevKit', categoria: 'placa',
    descripcion: 'Versión moderna del ESP32 con USB nativo, más memoria e instrucciones para inteligencia artificial sencilla. Trae un LED RGB direccionable.',
    funcionamiento: 'Tiene el chip ESP32-S3 con dos núcleos. Además de Wi-Fi y Bluetooth LE, puede hacerse pasar por teclado o ratón USB. Es el "hermano mayor" del ESP32 clásico.',
    voltajeOperacion: '3,3 V en los pines · 5 V por USB',
    corrienteTipica: '≈ 50–100 mA en uso normal · picos de 300 mA o más con Wi-Fi',
    logica: '3.3 V',
    compatibleCon: ['ESP32'],
    datos: [
      ['Chip', 'ESP32-S3 · 2 núcleos a 240 MHz'], ['Conectividad', 'Wi-Fi 2,4 GHz y Bluetooth LE (NO tiene Bluetooth clásico)'],
      ['USB', 'Dos conectores: "UART" (programación) y "USB" nativo (GPIO 19 = D−, GPIO 20 = D+)'],
      ['ADC', 'ADC1: GPIO 1–10 · ADC2: GPIO 11–20 (ADC2 no se usa con Wi-Fi)'],
      ['I2C por defecto en Arduino', 'SDA = GPIO 8 · SCL = GPIO 9'], ['LED RGB', 'GPIO 48 (o GPIO 38 en la revisión 1.1)'],
      ['Pines de arranque', 'GPIO 0, 3, 45 y 46']
    ],
    pines: [
      P('3V3', 'alimentación', '3,3 V', 'Salida de 3,3 V'), P('5V (5VIN)', 'alimentación', '5 V', 'Entrada/salida de 5 V'),
      P('GND', 'GND', '0 V', 'Tierra'), P('RST / EN', 'otro', '3,3 V', 'Reinicio'),
      P('GPIO 1–10', 'analógico', '3,3 V', 'E/S · ADC1 · táctil'),
      P('GPIO 11–18', 'analógico', '3,3 V', 'E/S · ADC2'),
      P('GPIO 19 (D−) / GPIO 20 (D+)', 'otro', '3,3 V', 'USB nativo: evítalos si usas ese conector'),
      P('GPIO 43 (TX) / GPIO 44 (RX)', 'UART', '3,3 V', 'Serie del conector UART'),
      P('GPIO 35, 36, 37', 'otro', '—', 'Los usa la PSRAM en los módulos con PSRAM octal: evítalos'),
      P('GPIO 0', 'digital', '3,3 V', 'Botón BOOT · pin de arranque'),
      P('GPIO 3, 45, 46', 'digital', '3,3 V', 'Pines de arranque: úsalos con cuidado'),
      P('GPIO 21, 38–42, 47', 'digital', '3,3 V', 'E/S de uso general'),
      P('GPIO 48', 'digital', '3,3 V', 'LED RGB direccionable (según revisión)')
    ],
    codigoESP32: `// ESP32-S3: cambia el color del LED RGB integrado
// En el núcleo ESP32 3.x la función es rgbLedWrite();
// en el núcleo 2.x se llama neopixelWrite().

#ifndef RGB_BUILTIN
#define RGB_BUILTIN 48   // cambia a 38 si tu placa es la revisión 1.1
#endif

void setup() {
  Serial.begin(115200);
}

void loop() {
  rgbLedWrite(RGB_BUILTIN, 40, 0, 0);  // rojo (brillo bajo: 40 de 255)
  delay(500);
  rgbLedWrite(RGB_BUILTIN, 0, 40, 0);  // verde
  delay(500);
  rgbLedWrite(RGB_BUILTIN, 0, 0, 40);  // azul
  delay(500);
}`,
    advertencias: [
      AVISOS_ESP32[0],
      'Su distribución de pines es distinta a la del ESP32 clásico: no copies las conexiones del DevKit V1 sin revisar.',
      'No tiene Bluetooth clásico: la librería BluetoothSerial no funciona (usa BLE).',
      'Para ver el monitor serie por el conector "USB" nativo activa Herramientas → USB CDC On Boot → Enabled.',
      'GPIO 26–32 están reservados para la memoria flash/PSRAM del módulo.'
    ],
    aplicaciones: ['Teclado o mando USB personalizado', 'Reconocimiento de voz o gestos sencillos', 'Proyectos IoT que necesitan más memoria'],
    porVerificar: [
      'El pin del LED RGB depende de la revisión de la placa (GPIO 48 en la v1.0, GPIO 38 en la v1.1).',
      'El orden físico de los pines varía según el fabricante; solo se listan los grupos de GPIO.'
    ]
  });


  /* =====================================================================
     2. SENSORES
     ===================================================================== */

  const AVISO_5V_A_ESP32 = 'Con ESP32: la salida de este módulo puede llegar a 5 V. Usa un divisor de voltaje (por ejemplo 10 kΩ y 20 kΩ) o un conversor de nivel antes del GPIO.';

  agregar({
    id: 'dht11', nombre: 'DHT11 · temperatura y humedad', categoria: 'sensor',
    descripcion: 'Sensor económico que mide la temperatura del aire y la humedad relativa, y entrega ambos datos por un solo cable.',
    funcionamiento: 'Dentro tiene un termistor (resistencia que cambia con el calor) y una pieza que absorbe humedad y cambia su resistencia. Un pequeño chip convierte todo en números y los envía en "paquetes" de bits, como un mensaje en código Morse muy rápido.',
    voltajeOperacion: '3,3 V a 5,5 V', corrienteTipica: '≈ 1 mA midiendo · 0,1 mA en reposo', logica: '3.3 V y 5 V',
    datos: [['Rango de temperatura', '0 a 50 °C (± 2 °C)'], ['Rango de humedad', '20 a 90 % (± 5 %)'], ['Lecturas', '1 por segundo como máximo']],
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('DATA', 'digital', '3,3–5 V', 'Datos (un solo cable)'), P('NC', 'otro', '—', 'Sin conexión (solo en el sensor de 4 patas)'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('VCC', '5V'), K('DATA', 'D2', 'El sensor suelto necesita resistencia de 10 kΩ entre DATA y VCC (el módulo ya la trae)'), K('GND', 'GND')],
    conexionESP32: [K('VCC', '3V3'), K('DATA', 'GPIO 4', 'Resistencia de 10 kΩ a 3V3 si es el sensor suelto'), K('GND', 'GND')],
    codigoArduino: `// DHT11: muestra temperatura y humedad
// Librería: "DHT sensor library" de Adafruit (Gestor de librerías)
#include <DHT.h>

const int PIN_DHT = 2;
DHT dht(PIN_DHT, DHT11);   // para el DHT22 cambia DHT11 por DHT22

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);                          // el sensor necesita tiempo entre lecturas
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("No puedo leer el sensor: revisa los cables");
    return;
  }
  Serial.print("Temperatura: "); Serial.print(temperatura); Serial.print(" °C   ");
  Serial.print("Humedad: "); Serial.print(humedad); Serial.println(" %");
}`,
    codigoESP32: `// DHT11 con ESP32 (pin GPIO 4)
#include <DHT.h>

const int PIN_DHT = 4;
DHT dht(PIN_DHT, DHT11);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (isnan(t) || isnan(h)) { Serial.println("Error de lectura"); return; }
  Serial.printf("Temperatura: %.1f °C  Humedad: %.0f %%\\n", t, h);
}`,
    advertencias: ['Lee como máximo una vez por segundo; si lees más rápido obtendrás errores (NaN).', 'El orden de los pines del módulo de 3 patas cambia según el fabricante: lee la serigrafía (S o DATA, +, −).', 'No es preciso: sirve para aprender, no para medir con exactitud.'],
    aplicaciones: ['Estación meteorológica escolar', 'Control de un ventilador según la temperatura', 'Monitor de humedad para un invernadero']
  });

  agregar({
    id: 'dht22', nombre: 'DHT22 (AM2302) · temperatura y humedad', categoria: 'sensor',
    descripcion: 'Hermano mayor del DHT11: más preciso, con mayor rango y se usa exactamente igual.',
    funcionamiento: 'Funciona como el DHT11 (termistor + sensor capacitivo de humedad + chip), pero con piezas de mejor calidad. Es como pasar de una regla escolar a un vernier.',
    voltajeOperacion: '3,3 V a 6 V', corrienteTipica: '≈ 1,5 mA midiendo', logica: '3.3 V y 5 V',
    datos: [['Rango de temperatura', '−40 a 80 °C (± 0,5 °C)'], ['Rango de humedad', '0 a 100 % (± 2 a 5 %)'], ['Lecturas', '1 cada 2 segundos como máximo']],
    pines: [P('VCC', 'alimentación', '3,3–6 V', 'Alimentación'), P('DATA', 'digital', '3,3–5 V', 'Datos'), P('NC', 'otro', '—', 'Sin conexión'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('VCC', '5V'), K('DATA', 'D2', '10 kΩ entre DATA y VCC si no es módulo'), K('GND', 'GND')],
    conexionESP32: [K('VCC', '3V3'), K('DATA', 'GPIO 4'), K('GND', 'GND')],
    codigoArduino: `// DHT22: igual que el DHT11, solo cambia el tipo
#include <DHT.h>

DHT dht(2, DHT22);   // pin 2, sensor DHT22

void setup() { Serial.begin(9600); dht.begin(); }

void loop() {
  delay(2500);       // el DHT22 necesita al menos 2 s entre lecturas
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (isnan(t) || isnan(h)) { Serial.println("Error de lectura"); return; }
  Serial.print(t, 1); Serial.print(" °C   "); Serial.print(h, 1); Serial.println(" %");
}`,
    codigoESP32: `// DHT22 con ESP32 (GPIO 4)
#include <DHT.h>

DHT dht(4, DHT22);

void setup() { Serial.begin(115200); dht.begin(); }

void loop() {
  delay(2500);
  float t = dht.readTemperature(), h = dht.readHumidity();
  if (isnan(t) || isnan(h)) { Serial.println("Error de lectura"); return; }
  Serial.printf("%.1f °C  %.1f %%\\n", t, h);
}`,
    advertencias: ['Respeta los 2 segundos entre lecturas.', 'Con cables largos (más de 1 m) usa una resistencia pull-up de 4,7 kΩ.'],
    aplicaciones: ['Registro del clima del colegio', 'Control de humedad en una incubadora', 'Alarma de heladas para cultivos']
  });

  agregar({
    id: 'hc-sr04', nombre: 'HC-SR04 · sensor ultrasónico', categoria: 'sensor',
    descripcion: 'Mide distancias de 2 cm a 4 m usando sonido que el oído humano no puede escuchar.',
    funcionamiento: 'Emite un "grito" de ultrasonido (40 kHz) y espera el eco, como hacen los murciélagos. Mide cuánto tarda en volver: como el sonido viaja a 343 m/s, con ese tiempo se calcula la distancia.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 15 mA', logica: '5 V',
    datos: [['Rango', '2 cm a 400 cm'], ['Precisión', '≈ 3 mm'], ['Ángulo', '≈ 15°'], ['Fórmula', 'distancia (cm) = tiempo (µs) × 0,0343 ÷ 2']],
    pines: [P('VCC', 'alimentación', '5 V', 'Alimentación'), P('Trig', 'digital', '5 V', 'Disparo: un pulso de 10 µs inicia la medición'), P('Echo', 'digital', '5 V', 'Eco: pulso cuya duración es el tiempo de ida y vuelta'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('VCC', '5V'), K('Trig', 'D9'), K('Echo', 'D10'), K('GND', 'GND')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('Trig', 'GPIO 5'), K('Echo', 'GPIO 18', '¡Con divisor! Echo → 1 kΩ → GPIO 18 → 2 kΩ → GND'), K('GND', 'GND')],
    codigoArduino: `// HC-SR04: mide la distancia en centímetros
const int PIN_TRIG = 9;
const int PIN_ECHO = 10;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
}

void loop() {
  // 1) Enviamos un pulso de 10 microsegundos
  digitalWrite(PIN_TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // 2) Medimos cuánto dura el eco (máx. 30 ms ≈ 5 m)
  long duracion = pulseIn(PIN_ECHO, HIGH, 30000);

  // 3) El sonido va y vuelve: dividimos entre 2
  float distancia = duracion * 0.0343 / 2;

  if (duracion == 0) Serial.println("Fuera de rango");
  else { Serial.print(distancia); Serial.println(" cm"); }
  delay(200);
}`,
    codigoESP32: `// HC-SR04 con ESP32 (Echo con divisor de voltaje)
const int PIN_TRIG = 5;
const int PIN_ECHO = 18;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
}

void loop() {
  digitalWrite(PIN_TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duracion = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duracion == 0) Serial.println("Fuera de rango");
  else Serial.printf("%.1f cm\\n", duracion * 0.0343 / 2);
  delay(200);
}`,
    advertencias: ['Con ESP32 el pin Echo entrega 5 V: usa siempre el divisor de voltaje o la versión HC-SR04P de 3,3 V.', 'Superficies blandas (tela, espuma) o inclinadas absorben o desvían el sonido y dan lecturas erróneas.', 'No midas más rápido que cada 60 ms: los ecos anteriores confunden al sensor.'],
    aplicaciones: ['Robot que esquiva obstáculos', 'Sensor de estacionamiento', 'Medidor del nivel de agua de un tanque']
  });

  agregar({
    id: 'pir-hc-sr501', nombre: 'PIR HC-SR501 · sensor de movimiento', categoria: 'sensor',
    descripcion: 'Detecta el movimiento de personas o animales por el calor que emiten sus cuerpos.',
    funcionamiento: 'Todo cuerpo caliente emite luz infrarroja invisible. El sensor tiene dos "ojos" detrás de una lente blanca (Fresnel); cuando alguien pasa, un ojo ve más calor que el otro y el sensor activa su salida.',
    voltajeOperacion: '4,5 V a 20 V (salida de 3,3 V)', corrienteTipica: '≈ 65 µA en reposo', logica: '3.3 V y 5 V',
    datos: [['Alcance', '3 a 7 m (ajustable)'], ['Tiempo de salida activa', '≈ 3 s a 5 min (ajustable)'], ['Ángulo', '≈ 110°'], ['Calentamiento', '≈ 1 minuto al encender']],
    pines: [P('VCC', 'alimentación', '5 V', 'Alimentación'), P('OUT', 'digital', '3,3 V', 'HIGH cuando detecta movimiento'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('VCC', '5V'), K('OUT', 'D2'), K('GND', 'GND')],
    conexionESP32: [K('VCC', 'VIN (5 V)', 'El sensor necesita al menos 4,5 V'), K('OUT', 'GPIO 27', 'La salida es de 3,3 V: se conecta directo'), K('GND', 'GND')],
    codigoArduino: `// PIR: enciende el LED integrado cuando detecta movimiento
const int PIN_PIR = 2;
const int PIN_LED = 13;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Esperando 60 s a que el sensor se estabilice...");
  delay(60000);
}

void loop() {
  if (digitalRead(PIN_PIR) == HIGH) {
    digitalWrite(PIN_LED, HIGH);
    Serial.println("¡Movimiento!");
  } else {
    digitalWrite(PIN_LED, LOW);
  }
  delay(100);
}`,
    codigoESP32: `// PIR con ESP32 (GPIO 27)
const int PIN_PIR = 27;
const int PIN_LED = 2;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  bool hayMovimiento = digitalRead(PIN_PIR) == HIGH;
  digitalWrite(PIN_LED, hayMovimiento);
  if (hayMovimiento) Serial.println("¡Movimiento!");
  delay(100);
}`,
    advertencias: ['Durante el primer minuto da falsas alarmas: espera a que se estabilice.', 'Tiene dos potenciómetros naranjas: Sx (distancia) y Tx (tiempo). Gíralos con cuidado.', 'El puente H/L elige si se reactiva con cada movimiento (H) o una sola vez (L).', 'No detecta objetos fríos ni funciona bien detrás de un vidrio.'],
    aplicaciones: ['Alarma de seguridad', 'Luz automática de pasillo', 'Contador de personas que entran al aula']
  });

  agregar({
    id: 'mpu-6050', nombre: 'MPU-6050 · acelerómetro y giroscopio', categoria: 'sensor',
    descripcion: 'Mide la aceleración y la velocidad de giro en los tres ejes (X, Y, Z). Sirve para saber si algo se inclina, cae o gira.',
    funcionamiento: 'Dentro tiene piezas microscópicas (MEMS) que se mueven como pequeños resortes cuando el chip se acelera o gira. Es como sentir el empujón en el estómago cuando un bus frena: el chip lo "siente" y lo convierte en números.',
    voltajeOperacion: '3,3 V a 5 V (el módulo GY-521 trae regulador)', corrienteTipica: '≈ 4 mA', logica: '3.3 V y 5 V',
    datos: [['Acelerómetro', '± 2, 4, 8 o 16 g'], ['Giroscopio', '± 250, 500, 1000 o 2000 °/s'], ['Comunicación', 'I2C · dirección 0x68 (AD0 a GND) o 0x69 (AD0 a VCC)'], ['Extra', 'Termómetro interno']],
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('SCL', 'I2C', '3,3 V', 'Reloj I2C'), P('SDA', 'I2C', '3,3 V', 'Datos I2C'), P('XDA / XCL', 'I2C', '3,3 V', 'Bus auxiliar para otro sensor (normalmente libre)'), P('AD0', 'digital', '3,3 V', 'Elige la dirección I2C'), P('INT', 'digital', '3,3 V', 'Aviso de dato nuevo (opcional)')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('SCL', 'A5'), K('SDA', 'A4')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('SCL', 'GPIO 22'), K('SDA', 'GPIO 21')],
    codigoArduino: `// MPU-6050 sin librerías: lee la aceleración en X, Y, Z
#include <Wire.h>

const int MPU = 0x68;   // dirección I2C (AD0 a GND)

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);     // registro de energía
  Wire.write(0);        // 0 = despertar el sensor
  Wire.endTransmission();
}

void loop() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);     // primer registro de aceleración
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);           // 6 bytes: X, Y, Z
  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();
  // En el rango de ± 2 g, 16384 equivale a 1 g
  Serial.print("X: "); Serial.print(ax / 16384.0);
  Serial.print("  Y: "); Serial.print(ay / 16384.0);
  Serial.print("  Z: "); Serial.println(az / 16384.0);
  delay(200);
}`,
    codigoESP32: `// MPU-6050 con ESP32 (SDA 21, SCL 22)
#include <Wire.h>

const int MPU = 0x68;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Wire.beginTransmission(MPU); Wire.write(0x6B); Wire.write(0); Wire.endTransmission();
}

void loop() {
  Wire.beginTransmission(MPU); Wire.write(0x3B); Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();
  Serial.printf("X: %.2f g  Y: %.2f g  Z: %.2f g\\n", ax / 16384.0, ay / 16384.0, az / 16384.0);
  delay(200);
}`,
    advertencias: ['Quieto sobre la mesa debe marcar ≈ 1 g en Z: esa es la gravedad.', 'El giroscopio "se desvía" con el tiempo: para ángulos estables se combina con el acelerómetro (filtro complementario).', 'Hay módulos clon que no responden en 0x68: usa un escáner I2C para encontrar la dirección.'],
    aplicaciones: ['Nivel de burbuja digital', 'Robot que se equilibra en dos ruedas', 'Detector de caídas', 'Control por gestos']
  });

  agregar({
    id: 'mq-2', nombre: 'MQ-2 · sensor de gas y humo', categoria: 'sensor',
    descripcion: 'Detecta gas licuado (GLP), propano, metano, hidrógeno y humo. Entrega una señal analógica y otra digital.',
    funcionamiento: 'Tiene un pequeño calentador y una capa de óxido de estaño. Cuando hay gas en el aire, la resistencia de esa capa baja y el voltaje de salida sube. Es como una nariz electrónica que "huele" cambiando su resistencia.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 150 mA (el calentador consume mucho)', logica: '5 V',
    datos: [['Gases', 'GLP, propano, metano, hidrógeno, alcohol, humo'], ['Rango', '≈ 300 a 10 000 ppm'], ['Calentamiento', 'Unos minutos cada vez; 24 h la primera vez para calibrar']],
    pines: [P('VCC', 'alimentación', '5 V', 'Alimentación del calentador y del módulo'), P('GND', 'GND', '0 V', 'Tierra'), P('DO', 'digital', '5 V', 'Salida digital: cambia al pasar el umbral del potenciómetro'), P('AO', 'analógico', '0–5 V', 'Salida analógica: más gas = más voltaje')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('AO', 'A0'), K('DO', 'D7', 'Opcional')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('AO', 'GPIO 34', 'Con divisor 10 kΩ / 20 kΩ'), K('DO', 'GPIO 27', 'Con divisor (es de 5 V)')],
    codigoArduino: `// MQ-2: nivel de gas en el monitor y alarma con el LED
const int PIN_GAS = A0;
const int PIN_LED = 13;
const int UMBRAL = 400;   // ajústalo probando en tu aula

void setup() {
  Serial.begin(9600);
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Calentando el sensor 20 s...");
  delay(20000);
}

void loop() {
  int nivel = analogRead(PIN_GAS);   // 0 a 1023
  Serial.println(nivel);
  digitalWrite(PIN_LED, nivel > UMBRAL ? HIGH : LOW);
  delay(500);
}`,
    codigoESP32: `// MQ-2 con ESP32 (AO con divisor a GPIO 34, ADC1)
const int PIN_GAS = 34;
const int UMBRAL = 1500;  // de 0 a 4095

void setup() { Serial.begin(115200); }

void loop() {
  int nivel = analogRead(PIN_GAS);
  Serial.printf("Gas: %d %s\\n", nivel, nivel > UMBRAL ? "¡ALERTA!" : "");
  delay(500);
}`,
    advertencias: [AVISO_5V_A_ESP32, 'El sensor se calienta: es normal, pero no lo toques.', 'No sirve como detector de seguridad certificado: es solo para aprender.', 'Los valores cambian con la temperatura y la humedad; calibra en el lugar donde lo usarás.'],
    aplicaciones: ['Alarma de fuga de gas en la cocina (didáctica)', 'Detector de humo', 'Medidor de la calidad del aire del aula']
  });

  agregar({
    id: 'mq-135', nombre: 'MQ-135 · calidad del aire', categoria: 'sensor',
    descripcion: 'Detecta gases contaminantes como amoníaco, benceno, alcohol, humo y CO₂ (de forma aproximada).',
    funcionamiento: 'Igual que el MQ-2: un calentador y una capa sensible que cambia su resistencia con los gases. La diferencia está en el material, que reacciona más a los contaminantes del aire.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 150 mA', logica: '5 V',
    datos: [['Gases', 'NH₃, NOx, alcohol, benceno, humo, CO₂ (aproximado)'], ['Rango', '≈ 10 a 1000 ppm'], ['Calentamiento', '24 h la primera vez; unos minutos en cada uso']],
    pines: [P('VCC', 'alimentación', '5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('DO', 'digital', '5 V', 'Salida digital con umbral ajustable'), P('AO', 'analógico', '0–5 V', 'Salida analógica')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('AO', 'A0')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('AO', 'GPIO 35', 'Con divisor 10 kΩ / 20 kΩ')],
    codigoArduino: `// MQ-135: índice simple de calidad del aire
const int PIN_AIRE = A0;

void setup() { Serial.begin(9600); }

void loop() {
  int valor = analogRead(PIN_AIRE);
  Serial.print("Aire: "); Serial.print(valor);
  if (valor < 200) Serial.println("  (bueno)");
  else if (valor < 400) Serial.println("  (regular: ventila el aula)");
  else Serial.println("  (malo)");
  delay(1000);
}`,
    codigoESP32: `// MQ-135 con ESP32 (AO con divisor a GPIO 35)
const int PIN_AIRE = 35;

void setup() { Serial.begin(115200); }

void loop() {
  int valor = analogRead(PIN_AIRE);    // 0 a 4095
  Serial.printf("Aire: %d\\n", valor);
  delay(1000);
}`,
    advertencias: [AVISO_5V_A_ESP32, 'Los umbrales del ejemplo son orientativos: mide primero con el aire limpio del aula.', 'Para medir CO₂ real se necesita un sensor NDIR (por ejemplo MH-Z19); el MQ-135 solo da una idea.'],
    aplicaciones: ['Semáforo de ventilación del aula', 'Monitor de aire en el taller', 'Proyecto de ciencias sobre contaminación'],
    porVerificar: ['Los umbrales 200 / 400 son referenciales y dependen de cada sensor y su calibración.']
  });

  agregar({
    id: 'ky-038', nombre: 'KY-038 · sensor de sonido', categoria: 'sensor',
    descripcion: 'Módulo con micrófono que detecta ruidos fuertes como un aplauso o un golpe.',
    funcionamiento: 'El micrófono convierte las vibraciones del aire en una pequeña señal eléctrica. Un comparador (LM393) la compara con un umbral que eliges con el potenciómetro azul: si el sonido lo supera, la salida digital cambia.',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: '≈ 5 mA', logica: '3.3 V y 5 V',
    pines: [P('AO', 'analógico', '0–VCC', 'Señal del micrófono'), P('GND', 'GND', '0 V', 'Tierra'), P('+', 'alimentación', '3,3–5 V', 'Alimentación'), P('DO', 'digital', '0–VCC', 'Se activa cuando el sonido supera el umbral')],
    conexionArduino: [K('+', '5V'), K('GND', 'GND'), K('DO', 'D2'), K('AO', 'A0', 'Opcional')],
    conexionESP32: [K('+', '3V3', 'Alimentado a 3,3 V sus salidas son seguras'), K('GND', 'GND'), K('DO', 'GPIO 27'), K('AO', 'GPIO 35')],
    codigoArduino: `// KY-038: un aplauso enciende o apaga el LED
const int PIN_SONIDO = 2;
const int PIN_LED = 13;
bool encendido = false;

void setup() {
  pinMode(PIN_SONIDO, INPUT);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  if (digitalRead(PIN_SONIDO) == HIGH) {  // ¡ruido fuerte!
    encendido = !encendido;               // cambia de estado
    digitalWrite(PIN_LED, encendido);
    delay(300);                           // evita contar el mismo aplauso dos veces
  }
}`,
    codigoESP32: `// KY-038 con ESP32: aplauso → LED
const int PIN_SONIDO = 27;
const int PIN_LED = 2;
bool encendido = false;

void setup() { pinMode(PIN_SONIDO, INPUT); pinMode(PIN_LED, OUTPUT); }

void loop() {
  if (digitalRead(PIN_SONIDO) == HIGH) {
    encendido = !encendido;
    digitalWrite(PIN_LED, encendido);
    delay(300);
  }
}`,
    advertencias: ['Gira el potenciómetro hasta que el LED del módulo quede justo apagado en silencio.', 'No mide decibeles reales: solo detecta si hay sonido fuerte.', 'En algunos módulos la salida DO se activa con LOW: comprueba con el LED indicador.'],
    aplicaciones: ['Interruptor por aplausos', 'Semáforo de ruido para el aula', 'Detector de golpes en una puerta'],
    porVerificar: ['El nivel lógico activo de DO (HIGH o LOW) depende del fabricante del módulo.']
  });

  agregar({
    id: 'tcrt5000', nombre: 'TCRT5000 · sensor de línea', categoria: 'sensor',
    descripcion: 'Sensor infrarrojo de reflexión que distingue superficies claras de oscuras a muy poca distancia. Es el "ojo" de los robots seguidores de línea.',
    funcionamiento: 'Un LED infrarrojo ilumina el piso y un fototransistor mide cuánta luz rebota. El blanco refleja mucho y el negro casi nada, como cuando ves tu reflejo en una ventana blanca pero no en una pizarra negra.',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: '≈ 20 mA', logica: '3.3 V y 5 V',
    datos: [['Distancia de trabajo', '1 a 25 mm (mejor a 2–3 mm)'], ['Comparador', 'LM393 con umbral ajustable']],
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('DO', 'digital', '0–VCC', 'Salida digital'), P('AO', 'analógico', '0–VCC', 'Cantidad de luz reflejada')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('DO', 'D2'), K('AO', 'A0', 'Opcional')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('DO', 'GPIO 27'), K('AO', 'GPIO 34')],
    codigoArduino: `// TCRT5000: ¿estoy sobre la línea negra?
const int PIN_LINEA = 2;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_LINEA, INPUT);
}

void loop() {
  // En la mayoría de módulos: HIGH = superficie negra (no refleja)
  if (digitalRead(PIN_LINEA) == HIGH) Serial.println("Negro: sobre la línea");
  else Serial.println("Blanco: fuera de la línea");
  delay(200);
}`,
    codigoESP32: `// TCRT5000 con ESP32
const int PIN_LINEA = 27;

void setup() { Serial.begin(115200); pinMode(PIN_LINEA, INPUT); }

void loop() {
  Serial.println(digitalRead(PIN_LINEA) == HIGH ? "Negro" : "Blanco");
  delay(200);
}`,
    advertencias: ['La luz del sol tiene mucho infrarrojo y puede confundirlo: prueba bajo techo.', 'Ajusta el potenciómetro a la altura real a la que irá el sensor en el robot.'],
    aplicaciones: ['Robot seguidor de línea', 'Contador de vueltas de una rueda', 'Detector de borde de mesa'],
    porVerificar: ['El nivel de la salida sobre negro (HIGH o LOW) varía entre módulos; compruébalo con el LED del módulo.']
  });

  agregar({
    id: 'ir-obstaculos', nombre: 'Sensor IR de obstáculos (FC-51)', categoria: 'sensor',
    descripcion: 'Detecta objetos cercanos (2 a 30 cm) mediante luz infrarroja. Su salida es digital: hay o no hay obstáculo.',
    funcionamiento: 'Igual que el TCRT5000: un LED infrarrojo emite luz y un receptor detecta si rebota en algo. Cuando hay un objeto delante, la luz vuelve y el sensor avisa.',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: '≈ 20 mA', logica: '3.3 V y 5 V',
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('OUT', 'digital', '0–VCC', 'LOW = obstáculo detectado')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('OUT', 'D2')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('OUT', 'GPIO 27')],
    codigoArduino: `// Sensor IR: avisa cuando hay un obstáculo
const int PIN_IR = 2;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_IR, INPUT);
}

void loop() {
  if (digitalRead(PIN_IR) == LOW) Serial.println("¡Obstáculo!");  // activo en LOW
  delay(100);
}`,
    codigoESP32: `// Sensor IR con ESP32
const int PIN_IR = 27;

void setup() { Serial.begin(115200); pinMode(PIN_IR, INPUT); }

void loop() {
  if (digitalRead(PIN_IR) == LOW) Serial.println("¡Obstáculo!");
  delay(100);
}`,
    advertencias: ['Los objetos negros reflejan poco y se detectan a menor distancia.', 'La luz del sol directa puede dar falsas detecciones.'],
    aplicaciones: ['Robot que evita choques', 'Contador de objetos en una banda', 'Dispensador automático']
  });

  agregar({
    id: 'tcs3200', nombre: 'TCS3200 · sensor de color', categoria: 'sensor',
    descripcion: 'Identifica el color de un objeto midiendo cuánta luz roja, verde y azul refleja.',
    funcionamiento: 'Tiene 64 fotodiodos con filtros de color. Eliges qué filtro usar (rojo, verde, azul o sin filtro) y el chip entrega una onda cuadrada: cuanto más luz de ese color, más rápida es la onda. Es como mirar el objeto con lentes de colores, uno a la vez.',
    voltajeOperacion: '2,7 V a 5,5 V', corrienteTipica: '≈ 2 mA (más los 4 LED blancos, ≈ 20 mA)', logica: '3.3 V y 5 V',
    datos: [['S0 / S1 (escala)', 'LL = apagado · LH = 2 % · HL = 20 % · HH = 100 %'], ['S2 / S3 (filtro)', 'LL = rojo · LH = azul · HL = sin filtro · HH = verde']],
    pines: [P('S0, S1', 'digital', '3,3–5 V', 'Escala de la frecuencia de salida'), P('S2, S3', 'digital', '3,3–5 V', 'Elección del filtro de color'), P('OUT', 'digital', '0–VCC', 'Onda cuadrada proporcional a la luz'), P('OE', 'digital', '—', 'Habilitación (activa en LOW; muchos módulos ya la conectan a GND)'), P('VCC', 'alimentación', '2,7–5,5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('S0', 'D4'), K('S1', 'D5'), K('S2', 'D6'), K('S3', 'D7'), K('OUT', 'D8'), K('VCC', '5V'), K('GND', 'GND')],
    conexionESP32: [K('S0', 'GPIO 25'), K('S1', 'GPIO 26'), K('S2', 'GPIO 27'), K('S3', 'GPIO 14'), K('OUT', 'GPIO 33'), K('VCC', '3V3'), K('GND', 'GND')],
    codigoArduino: `// TCS3200: mide rojo, verde y azul (un número MENOR = más de ese color)
const int S0 = 4, S1 = 5, S2 = 6, S3 = 7, PIN_OUT = 8;

long leerColor(bool s2, bool s3) {
  digitalWrite(S2, s2);
  digitalWrite(S3, s3);
  delay(20);
  return pulseIn(PIN_OUT, LOW);   // duración del pulso en microsegundos
}

void setup() {
  Serial.begin(9600);
  pinMode(S0, OUTPUT); pinMode(S1, OUTPUT); pinMode(S2, OUTPUT); pinMode(S3, OUTPUT);
  pinMode(PIN_OUT, INPUT);
  digitalWrite(S0, HIGH); digitalWrite(S1, LOW);   // escala del 20 %
}

void loop() {
  long rojo  = leerColor(LOW, LOW);
  long verde = leerColor(HIGH, HIGH);
  long azul  = leerColor(LOW, HIGH);
  Serial.print("R: "); Serial.print(rojo);
  Serial.print("  G: "); Serial.print(verde);
  Serial.print("  B: "); Serial.println(azul);
  delay(300);
}`,
    codigoESP32: `// TCS3200 con ESP32
const int S0 = 25, S1 = 26, S2 = 27, S3 = 14, PIN_OUT = 33;

long leerColor(bool s2, bool s3) {
  digitalWrite(S2, s2); digitalWrite(S3, s3); delay(20);
  return pulseIn(PIN_OUT, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(S0, OUTPUT); pinMode(S1, OUTPUT); pinMode(S2, OUTPUT); pinMode(S3, OUTPUT);
  pinMode(PIN_OUT, INPUT);
  digitalWrite(S0, HIGH); digitalWrite(S1, LOW);
}

void loop() {
  Serial.printf("R: %ld  G: %ld  B: %ld\\n", leerColor(LOW, LOW), leerColor(HIGH, HIGH), leerColor(LOW, HIGH));
  delay(300);
}`,
    advertencias: ['Calibra primero con una hoja blanca y otra negra: los números cambian con la luz del ambiente.', 'Pon el objeto a 1–2 cm del sensor y tápalo de la luz exterior.'],
    aplicaciones: ['Clasificador de objetos por color', 'Robot que sigue líneas de colores', 'Juego para reconocer colores']
  });

  agregar({
    id: 'pulso-cardiaco', nombre: 'Sensor de ritmo cardíaco (óptico)', categoria: 'sensor',
    descripcion: 'Sensor que se apoya en la yema del dedo o el lóbulo de la oreja y detecta los latidos del corazón.',
    funcionamiento: 'Un LED verde ilumina la piel y un sensor de luz mide cuánta se refleja. Cada latido empuja más sangre por los vasos, la sangre absorbe luz y la señal baja un poquito. Contando esas bajadas se obtienen los latidos por minuto.',
    voltajeOperacion: '3 V a 5 V', corrienteTipica: '≈ 4 mA', logica: '3.3 V y 5 V',
    pines: [P('S (señal)', 'analógico', '0–VCC', 'Señal del pulso'), P('+', 'alimentación', '3–5 V', 'Alimentación'), P('−', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('S', 'A0'), K('+', '5V'), K('−', 'GND')],
    conexionESP32: [K('S', 'GPIO 34'), K('+', '3V3'), K('−', 'GND')],
    codigoArduino: `// Sensor de pulso: abre Herramientas → Plotter serie para ver los latidos
const int PIN_PULSO = A0;

void setup() { Serial.begin(9600); }

void loop() {
  int senal = analogRead(PIN_PULSO);
  Serial.println(senal);   // el plotter dibuja la onda del corazón
  delay(20);               // 50 lecturas por segundo
}`,
    codigoESP32: `// Sensor de pulso con ESP32 (GPIO 34)
const int PIN_PULSO = 34;

void setup() { Serial.begin(115200); }

void loop() {
  Serial.println(analogRead(PIN_PULSO));
  delay(20);
}`,
    advertencias: ['NO es un aparato médico: no lo uses para diagnosticar a nadie.', 'Mantén el dedo quieto y sin apretar demasiado: el movimiento arruina la señal.', 'Cubre la parte de atrás con cinta aislante para evitar falsos contactos con la piel.'],
    aplicaciones: ['Gráfica de los latidos en el plotter', 'Comparar el pulso antes y después de hacer ejercicio', 'LED que parpadea con cada latido']
  });

  agregar({
    id: 'ldr', nombre: 'LDR · fotorresistencia', categoria: 'sensor',
    descripcion: 'Resistencia que cambia con la luz: con mucha luz baja su valor y en la oscuridad sube.',
    funcionamiento: 'Está hecha de sulfuro de cadmio. La luz "libera" electrones en el material y la corriente pasa más fácil. Es como una puerta que se abre más cuanto más sol hay.',
    voltajeOperacion: 'Hasta 150 V (en la práctica 3,3 V o 5 V)', corrienteTipica: 'Menos de 1 mA en un divisor con 10 kΩ', logica: '3.3 V y 5 V',
    datos: [['Modelo común', 'GL5528'], ['Con luz', '≈ 10–20 kΩ (a 10 lux)'], ['En oscuridad', '≈ 1 MΩ']],
    pines: [P('Pata 1', 'otro', '—', 'No tiene polaridad'), P('Pata 2', 'otro', '—', 'No tiene polaridad')],
    conexionArduino: [K('Pata 1', '5V'), K('Pata 2', 'A0', 'Y una resistencia de 10 kΩ de A0 a GND (divisor de voltaje)')],
    conexionESP32: [K('Pata 1', '3V3'), K('Pata 2', 'GPIO 34', 'Y 10 kΩ de GPIO 34 a GND')],
    codigoArduino: `// LDR: enciende el LED cuando oscurece
const int PIN_LDR = A0;
const int PIN_LED = 13;
const int UMBRAL = 300;   // menos luz = número más bajo con este montaje

void setup() {
  Serial.begin(9600);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  Serial.println(luz);
  digitalWrite(PIN_LED, luz < UMBRAL ? HIGH : LOW);
  delay(200);
}`,
    codigoESP32: `// LDR con ESP32 (GPIO 34)
const int PIN_LDR = 34;

void setup() { Serial.begin(115200); }

void loop() {
  int luz = analogRead(PIN_LDR);   // 0 a 4095
  Serial.printf("Luz: %d (%d %%)\\n", luz, map(luz, 0, 4095, 0, 100));
  delay(200);
}`,
    advertencias: ['Sola no funciona con el Arduino: siempre va en un divisor de voltaje con otra resistencia.', 'Es lenta: tarda décimas de segundo en reaccionar.'],
    aplicaciones: ['Luz nocturna automática', 'Medidor de luz para plantas', 'Alarma que detecta cuando se abre una caja']
  });

  agregar({
    id: 'ds18b20', nombre: 'DS18B20 · temperatura digital', categoria: 'sensor',
    descripcion: 'Termómetro digital preciso. Existe en encapsulado TO-92 (como un transistor) y en versión sumergible con cable.',
    funcionamiento: 'Mide la temperatura dentro del chip y envía el resultado por el protocolo "1-Wire": un solo cable de datos para varios sensores, cada uno con su número de serie único, como alumnos que responden cuando el profesor dice su código.',
    voltajeOperacion: '3,0 V a 5,5 V', corrienteTipica: '≈ 1,5 mA midiendo', logica: '3.3 V y 5 V',
    datos: [['Rango', '−55 a 125 °C'], ['Precisión', '± 0,5 °C entre −10 y 85 °C'], ['Resolución', '9 a 12 bits (hasta 0,0625 °C)']],
    pines: [P('GND', 'GND', '0 V', 'Tierra (pata izquierda, cara plana hacia ti)'), P('DQ', 'digital', '3,3–5 V', 'Datos 1-Wire (pata central)'), P('VDD', 'alimentación', '3–5,5 V', 'Alimentación (pata derecha)')],
    conexionArduino: [K('GND', 'GND'), K('DQ', 'D2', 'Resistencia de 4,7 kΩ entre DQ y 5V'), K('VDD', '5V')],
    conexionESP32: [K('GND', 'GND'), K('DQ', 'GPIO 4', 'Resistencia de 4,7 kΩ entre DQ y 3V3'), K('VDD', '3V3')],
    codigoArduino: `// DS18B20: temperatura precisa
// Librerías: "OneWire" y "DallasTemperature"
#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_DATOS = 2;
OneWire bus(PIN_DATOS);
DallasTemperature sensores(&bus);

void setup() {
  Serial.begin(9600);
  sensores.begin();
}

void loop() {
  sensores.requestTemperatures();             // pide a todos que midan
  float t = sensores.getTempCByIndex(0);      // el primer sensor del cable
  if (t == DEVICE_DISCONNECTED_C) Serial.println("Sensor no encontrado");
  else { Serial.print(t); Serial.println(" °C"); }
  delay(1000);
}`,
    codigoESP32: `// DS18B20 con ESP32 (GPIO 4)
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire bus(4);
DallasTemperature sensores(&bus);

void setup() { Serial.begin(115200); sensores.begin(); }

void loop() {
  sensores.requestTemperatures();
  Serial.printf("%.2f °C\\n", sensores.getTempCByIndex(0));
  delay(1000);
}`,
    advertencias: ['Sin la resistencia de 4,7 kΩ el sensor no responde (lee −127 °C).', 'Si lo conectas al revés se calienta mucho y se daña en segundos: revisa la cara plana.', 'Hay muchos DS18B20 falsificados que fallan con 3,3 V.'],
    aplicaciones: ['Termómetro para agua o líquidos', 'Control de temperatura de un acuario', 'Varios sensores en un solo cable para un invernadero']
  });

  agregar({
    id: 'bmp280', nombre: 'BMP280 · presión y temperatura', categoria: 'sensor',
    descripcion: 'Mide la presión atmosférica y la temperatura. Con la presión se puede calcular la altitud aproximada.',
    funcionamiento: 'Tiene una membrana microscópica que se dobla con la presión del aire, como el parche de un tambor. El chip mide cuánto se dobla y lo convierte en hectopascales. Al subir una montaña hay menos aire encima y la presión baja.',
    voltajeOperacion: '3,3 V (algunos módulos aceptan 5 V)', corrienteTipica: '≈ 3 µA a 1 lectura por segundo', logica: '3.3 V',
    datos: [['Presión', '300 a 1100 hPa (± 1 hPa)'], ['Temperatura', '−40 a 85 °C (± 1 °C)'], ['Comunicación', 'I2C (0x76 o 0x77) o SPI'], ['Dato curioso', 'En Llata (≈ 3500 m) la presión ronda los 660 hPa']],
    pines: [P('VCC', 'alimentación', '3,3 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('SCL', 'I2C', '3,3 V', 'Reloj I2C (o SCK en SPI)'), P('SDA', 'I2C', '3,3 V', 'Datos I2C (o MOSI en SPI)'), P('CSB', 'SPI', '3,3 V', 'Selección SPI (a VCC o libre para I2C)'), P('SDO', 'otro', '3,3 V', 'Dirección I2C: GND = 0x76, VCC = 0x77')],
    conexionArduino: [K('VCC', '3.3V'), K('GND', 'GND'), K('SCL', 'A5'), K('SDA', 'A4')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('SCL', 'GPIO 22'), K('SDA', 'GPIO 21')],
    codigoArduino: `// BMP280: presión, temperatura y altitud aproximada
// Librería: "Adafruit BMP280 Library"
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {        // prueba 0x77 si no lo encuentra
    Serial.println("No encuentro el BMP280: revisa los cables");
    while (true) {}
  }
}

void loop() {
  Serial.print("Temperatura: "); Serial.print(bmp.readTemperature()); Serial.println(" °C");
  Serial.print("Presión: "); Serial.print(bmp.readPressure() / 100.0); Serial.println(" hPa");
  Serial.print("Altitud aprox.: "); Serial.print(bmp.readAltitude(1013.25)); Serial.println(" m");
  delay(2000);
}`,
    codigoESP32: `// BMP280 con ESP32 (SDA 21, SCL 22)
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  if (!bmp.begin(0x76)) { Serial.println("BMP280 no encontrado"); while (true) delay(10); }
}

void loop() {
  Serial.printf("%.1f °C  %.1f hPa  %.0f m\\n", bmp.readTemperature(), bmp.readPressure() / 100.0, bmp.readAltitude(1013.25));
  delay(2000);
}`,
    advertencias: ['Muchos módulos morados de 6 pines NO tienen regulador: aliméntalos solo con 3,3 V.', 'Con el UNO, las líneas SDA/SCL van a 5 V; lo más seguro es usar un conversor de nivel lógico.', 'No mide humedad: el que sí la mide es el BME280.'],
    aplicaciones: ['Barómetro para predecir el clima', 'Altímetro para un cohete de agua', 'Estación meteorológica con el DHT22'],
    porVerificar: ['Si tu módulo trae regulador de 3,3 V (algunos lo tienen) puede alimentarse con 5 V; revisa la placa.']
  });

  agregar({
    id: 'humedad-suelo', nombre: 'Sensor de humedad de suelo', categoria: 'sensor',
    descripcion: 'Mide qué tan mojada está la tierra de una maceta. Viene con una sonda de dos patas y un módulo comparador.',
    funcionamiento: 'La sonda resistiva tiene dos patas metálicas: el agua conduce electricidad, así que en tierra mojada la corriente pasa más fácil. El módulo convierte eso en voltaje. Con este módulo: tierra seca = número alto, tierra mojada = número bajo.',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: '≈ 35 mA', logica: '3.3 V y 5 V',
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('DO', 'digital', '0–VCC', 'Avisa cuando la humedad pasa el umbral'), P('AO', 'analógico', '0–VCC', 'Nivel de humedad')],
    conexionArduino: [K('VCC', 'D7', 'Alimentarlo desde un pin y encenderlo solo al medir reduce la corrosión'), K('GND', 'GND'), K('AO', 'A0')],
    conexionESP32: [K('VCC', 'GPIO 25', 'Encender solo al medir'), K('GND', 'GND'), K('AO', 'GPIO 32', 'ADC1: funciona con Wi-Fi')],
    codigoArduino: `// Humedad de suelo: ¿hay que regar?
const int PIN_SENSOR = A0;
const int PIN_ENERGIA = 7;   // alimenta el sensor solo al medir
const int SECO = 700;        // ajusta con tu tierra

void setup() {
  Serial.begin(9600);
  pinMode(PIN_ENERGIA, OUTPUT);
}

void loop() {
  digitalWrite(PIN_ENERGIA, HIGH);   // enciende el sensor
  delay(100);
  int valor = analogRead(PIN_SENSOR);
  digitalWrite(PIN_ENERGIA, LOW);    // lo apaga para que no se oxide
  Serial.print(valor);
  Serial.println(valor > SECO ? "  → ¡Hay que regar!" : "  → Tierra húmeda");
  delay(5000);
}`,
    codigoESP32: `// Humedad de suelo con ESP32
const int PIN_SENSOR = 32;
const int PIN_ENERGIA = 25;

void setup() { Serial.begin(115200); pinMode(PIN_ENERGIA, OUTPUT); }

void loop() {
  digitalWrite(PIN_ENERGIA, HIGH); delay(100);
  int valor = analogRead(PIN_SENSOR);
  digitalWrite(PIN_ENERGIA, LOW);
  Serial.printf("Humedad (crudo): %d\\n", valor);
  delay(5000);
}`,
    advertencias: ['La sonda resistiva se oxida con el tiempo si está siempre encendida: aliméntala solo al medir.', 'Las sondas capacitivas (v1.2) no se oxidan, pero dan valores al revés según el modelo: calibra con tierra seca y con agua.', 'Calibra con tu propia tierra: los números cambian según el tipo de suelo.'],
    aplicaciones: ['Riego automático con mini bomba', 'Aviso de "riégame" para las plantas del aula', 'Comparar la humedad de distintos suelos']
  });

  agregar({
    id: 'joystick-ky-023', nombre: 'Joystick KY-023', categoria: 'sensor',
    descripcion: 'Palanca de dos ejes como la de un mando de videojuegos, con un botón al presionarla.',
    funcionamiento: 'Dentro hay dos potenciómetros, uno para el eje X y otro para el eje Y. Al mover la palanca giras los potenciómetros y cambia el voltaje. En el centro marca la mitad (≈ 512 en el UNO).',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: 'Menos de 1 mA', logica: '3.3 V y 5 V',
    pines: [P('GND', 'GND', '0 V', 'Tierra'), P('+5V', 'alimentación', '3,3–5 V', 'Alimentación'), P('VRx', 'analógico', '0–VCC', 'Posición en el eje X'), P('VRy', 'analógico', '0–VCC', 'Posición en el eje Y'), P('SW', 'digital', '—', 'Botón: LOW al presionar (necesita pull-up)')],
    conexionArduino: [K('GND', 'GND'), K('+5V', '5V'), K('VRx', 'A0'), K('VRy', 'A1'), K('SW', 'D2', 'Con INPUT_PULLUP')],
    conexionESP32: [K('GND', 'GND'), K('+5V', '3V3', '¡A 3,3 V, no a 5 V!'), K('VRx', 'GPIO 34'), K('VRy', 'GPIO 35'), K('SW', 'GPIO 27', 'Con INPUT_PULLUP')],
    codigoArduino: `// Joystick: muestra la posición y el botón
const int PIN_X = A0, PIN_Y = A1, PIN_BOTON = 2;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_BOTON, INPUT_PULLUP);   // el botón no trae resistencia
}

void loop() {
  int x = analogRead(PIN_X);          // 0 a 1023 (centro ≈ 512)
  int y = analogRead(PIN_Y);
  bool presionado = digitalRead(PIN_BOTON) == LOW;
  Serial.print("X: "); Serial.print(x);
  Serial.print("  Y: "); Serial.print(y);
  Serial.println(presionado ? "  [BOTÓN]" : "");
  delay(100);
}`,
    codigoESP32: `// Joystick con ESP32 (alimentado a 3,3 V)
const int PIN_X = 34, PIN_Y = 35, PIN_BOTON = 27;

void setup() { Serial.begin(115200); pinMode(PIN_BOTON, INPUT_PULLUP); }

void loop() {
  Serial.printf("X: %d  Y: %d  %s\\n", analogRead(PIN_X), analogRead(PIN_Y), digitalRead(PIN_BOTON) == LOW ? "[BOTÓN]" : "");
  delay(100);
}`,
    advertencias: ['Con ESP32 aliméntalo con 3,3 V para que las salidas no pasen de 3,3 V.', 'El centro casi nunca es exactamente 512: deja una "zona muerta" en tu programa.'],
    aplicaciones: ['Control de un robot o un carrito', 'Mover un servo de cámara (pan/tilt)', 'Videojuego en una pantalla OLED']
  });

  /* =====================================================================
     3. BÁSICOS
     ===================================================================== */

  agregar({
    id: 'led', nombre: 'LED', categoria: 'basico',
    descripcion: 'Diodo emisor de luz. Solo deja pasar la corriente en un sentido y brilla cuando lo hace.',
    funcionamiento: 'Cuando los electrones cruzan la unión del semiconductor liberan energía en forma de luz. Es como una calle de un solo sentido que, además, se ilumina cuando pasan los autos.',
    voltajeOperacion: '≈ 1,8 a 2,2 V (rojo, amarillo, verde) · ≈ 3 a 3,3 V (azul, blanco)', corrienteTipica: '10 a 20 mA', logica: '—',
    datos: [['Pata larga', 'Ánodo (+)'], ['Pata corta / lado plano', 'Cátodo (−)'], ['Resistencia con 5 V', '220 Ω a 330 Ω'], ['Resistencia con 3,3 V', '68 Ω a 100 Ω (rojo) · cálculo: R = (Vfuente − VLED) ÷ I']],
    pines: [P('Ánodo (+)', 'otro', '—', 'Pata larga: hacia el pin o el positivo'), P('Cátodo (−)', 'GND', '0 V', 'Pata corta: hacia GND')],
    conexionArduino: [K('Ánodo (+)', 'D8', 'A través de una resistencia de 220 Ω'), K('Cátodo (−)', 'GND')],
    conexionESP32: [K('Ánodo (+)', 'GPIO 23', 'A través de una resistencia de 100 Ω a 220 Ω'), K('Cátodo (−)', 'GND')],
    codigoArduino: `// LED externo en el pin 8
const int PIN_LED = 8;

void setup() { pinMode(PIN_LED, OUTPUT); }

void loop() {
  digitalWrite(PIN_LED, HIGH); delay(1000);
  digitalWrite(PIN_LED, LOW);  delay(1000);
}`,
    codigoESP32: `// LED externo en el GPIO 23
const int PIN_LED = 23;

void setup() { pinMode(PIN_LED, OUTPUT); }

void loop() {
  digitalWrite(PIN_LED, HIGH); delay(1000);
  digitalWrite(PIN_LED, LOW);  delay(1000);
}`,
    advertencias: ['Sin resistencia el LED se quema (y puede dañar el pin).', 'Si lo conectas al revés no enciende, pero tampoco se daña con 5 V.'],
    aplicaciones: ['Semáforo', 'Indicadores de encendido', 'Juego de luces']
  });

  agregar({
    id: 'resistencia', nombre: 'Resistencia', categoria: 'basico',
    descripcion: 'Componente que se opone al paso de la corriente. Su valor se mide en ohmios (Ω) y se lee con las bandas de colores.',
    funcionamiento: 'Es como estrechar una manguera: por un tubo más angosto pasa menos agua. La ley de Ohm lo resume: V = I × R.',
    voltajeOperacion: 'Depende de la potencia (las comunes son de 1/4 W)', corrienteTipica: 'I = V ÷ R', logica: '—',
    datos: [['Colores', 'Negro 0 · Marrón 1 · Rojo 2 · Naranja 3 · Amarillo 4 · Verde 5 · Azul 6 · Violeta 7 · Gris 8 · Blanco 9'], ['Ejemplo', 'Rojo-rojo-marrón = 22 × 10 = 220 Ω'], ['Tolerancia', 'Dorado ± 5 % · Plateado ± 10 %']],
    pines: [P('Pata 1', 'otro', '—', 'Sin polaridad'), P('Pata 2', 'otro', '—', 'Sin polaridad')],
    conexionArduino: [K('Resistencia conocida 10 kΩ', '5V → A0'), K('Resistencia a medir', 'A0 → GND', 'Así el Arduino funciona como ohmímetro')],
    conexionESP32: [K('Resistencia conocida 10 kΩ', '3V3 → GPIO 34'), K('Resistencia a medir', 'GPIO 34 → GND')],
    codigoArduino: `// Ohmímetro sencillo con un divisor de voltaje
// 5V → R conocida (10 kΩ) → A0 → R desconocida → GND
const float R_CONOCIDA = 10000.0;

void setup() { Serial.begin(9600); }

void loop() {
  int lectura = analogRead(A0);
  if (lectura <= 0 || lectura >= 1023) { Serial.println("Fuera de rango"); delay(1000); return; }
  float vSalida = lectura * 5.0 / 1023.0;
  // Divisor: Vout = 5 × Rx / (Rc + Rx)  →  Rx = Rc × Vout / (5 − Vout)
  float rx = R_CONOCIDA * vSalida / (5.0 - vSalida);
  Serial.print("Resistencia ≈ "); Serial.print(rx, 0); Serial.println(" Ω");
  delay(1000);
}`,
    codigoESP32: `// Ohmímetro sencillo con ESP32 (menos preciso por su ADC)
const float R_CONOCIDA = 10000.0;

void setup() { Serial.begin(115200); }

void loop() {
  float v = analogReadMilliVolts(34) / 1000.0;   // voltaje ya corregido
  if (v <= 0.05 || v >= 3.25) { Serial.println("Fuera de rango"); delay(1000); return; }
  Serial.printf("Resistencia ≈ %.0f Ω\\n", R_CONOCIDA * v / (3.3 - v));
  delay(1000);
}`,
    advertencias: ['Mide resistencias siempre sin corriente en el circuito.', 'Una resistencia que se calienta mucho tiene poca potencia para ese uso.'],
    aplicaciones: ['Limitar la corriente de un LED', 'Divisor de voltaje', 'Resistencias pull-up y pull-down para botones']
  });

  agregar({
    id: 'pulsador', nombre: 'Pulsador', categoria: 'basico',
    descripcion: 'Botón que une dos contactos solo mientras lo presionas.',
    funcionamiento: 'Es como un puente levadizo: al presionar, el puente baja y la corriente cruza; al soltar, se levanta. El de 4 patas tiene las patas unidas de dos en dos.',
    voltajeOperacion: 'Hasta 12 V (pulsador de protoboard)', corrienteTipica: 'Hasta 50 mA', logica: '3.3 V y 5 V',
    pines: [P('Patas A (2)', 'otro', '—', 'Unidas entre sí'), P('Patas B (2)', 'otro', '—', 'Unidas entre sí; se conectan con A al presionar')],
    conexionArduino: [K('Pata A', 'D2', 'Con INPUT_PULLUP no hace falta resistencia'), K('Pata B', 'GND')],
    conexionESP32: [K('Pata A', 'GPIO 27', 'Con INPUT_PULLUP'), K('Pata B', 'GND')],
    codigoArduino: `// Pulsador con la resistencia pull-up interna
const int PIN_BOTON = 2;
const int PIN_LED = 13;

void setup() {
  pinMode(PIN_BOTON, INPUT_PULLUP);  // sin presionar = HIGH
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  bool presionado = digitalRead(PIN_BOTON) == LOW;  // presionado = LOW
  digitalWrite(PIN_LED, presionado ? HIGH : LOW);
}`,
    codigoESP32: `// Pulsador con ESP32
const int PIN_BOTON = 27;
const int PIN_LED = 2;

void setup() { pinMode(PIN_BOTON, INPUT_PULLUP); pinMode(PIN_LED, OUTPUT); }

void loop() { digitalWrite(PIN_LED, digitalRead(PIN_BOTON) == LOW); }`,
    advertencias: ['Un pin de entrada "al aire" lee valores al azar: usa siempre pull-up o pull-down.', 'Los contactos "rebotan" unos milisegundos: si cuentas pulsaciones, agrega un pequeño retardo.'],
    aplicaciones: ['Timbre', 'Contador de personas', 'Control de un juego']
  });

  agregar({
    id: 'potenciometro', nombre: 'Potenciómetro', categoria: 'basico',
    descripcion: 'Resistencia variable con una perilla. Sirve para elegir un valor girando, como el volumen de una radio.',
    funcionamiento: 'Tiene una pista de carbón y un cursor que se desliza sobre ella. Las patas de los extremos van a 5 V y GND; la central entrega un voltaje entre ambos según la posición: es un divisor de voltaje que puedes mover con la mano.',
    voltajeOperacion: 'Hasta la tensión de tu placa', corrienteTipica: '0,5 mA con 10 kΩ a 5 V', logica: '3.3 V y 5 V',
    pines: [P('Extremo 1', 'alimentación', '5 V / 3,3 V', 'A VCC'), P('Cursor', 'analógico', '0–VCC', 'Salida variable (pata central)'), P('Extremo 2', 'GND', '0 V', 'A GND')],
    conexionArduino: [K('Extremo 1', '5V'), K('Cursor', 'A0'), K('Extremo 2', 'GND')],
    conexionESP32: [K('Extremo 1', '3V3'), K('Cursor', 'GPIO 34'), K('Extremo 2', 'GND')],
    codigoArduino: `// Potenciómetro: muestra la posición en porcentaje
void setup() { Serial.begin(9600); }

void loop() {
  int lectura = analogRead(A0);                 // 0 a 1023
  int porcentaje = map(lectura, 0, 1023, 0, 100);
  Serial.print(porcentaje); Serial.println(" %");
  delay(100);
}`,
    codigoESP32: `// Potenciómetro con ESP32
void setup() { Serial.begin(115200); }

void loop() {
  int lectura = analogRead(34);                 // 0 a 4095
  Serial.printf("%d %%\\n", map(lectura, 0, 4095, 0, 100));
  delay(100);
}`,
    advertencias: ['Con ESP32 conecta el extremo a 3V3, nunca a 5 V.', 'Si gira al revés de lo esperado, intercambia los cables de los extremos.'],
    aplicaciones: ['Control de brillo de un LED', 'Control de la velocidad de un motor', 'Ajuste de la posición de un servo']
  });

  /* =====================================================================
     4. MÓDULOS Y ACTUADORES
     ===================================================================== */

  const AVISO_MOTOR = 'Los motores necesitan su propia fuente: no los alimentes desde el pin 5V de la placa. Une siempre la GND de la fuente con la GND de la placa.';

  agregar({
    id: 'rele-1', nombre: 'Módulo relé de 1 canal', categoria: 'actuador',
    descripcion: 'Interruptor controlado por la placa. Con una señal pequeña enciende o apaga aparatos que consumen más corriente, como una lámpara o una bomba.',
    funcionamiento: 'Dentro hay un electroimán: cuando le llega corriente atrae una lámina metálica que cierra el contacto. Es como pedirle a alguien fuerte que mueva una palanca pesada por ti: tú solo le das la orden.',
    voltajeOperacion: '5 V (bobina)', corrienteTipica: '≈ 70 mA con el relé activado', logica: '5 V',
    datos: [['Contactos', 'COM (común), NO (normalmente abierto), NC (normalmente cerrado)'], ['Capacidad del contacto', '10 A a 250 V AC / 30 V DC (relé SRD-05VDC)'], ['Activación', 'La mayoría se activan con LOW']],
    pines: [P('VCC', 'alimentación', '5 V', 'Alimentación de la bobina'), P('GND', 'GND', '0 V', 'Tierra'), P('IN', 'digital', '5 V', 'Señal de control'), P('COM', 'otro', 'Carga', 'Contacto común'), P('NO', 'otro', 'Carga', 'Se une a COM cuando el relé se activa'), P('NC', 'otro', 'Carga', 'Unido a COM cuando el relé está en reposo')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('IN', 'D7')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('IN', 'GPIO 26', 'Con 3,3 V algunos módulos no se activan bien: usa un transistor o un módulo compatible con 3,3 V')],
    codigoArduino: `// Relé: enciende y apaga una carga cada 2 segundos
const int PIN_RELE = 7;
// Muchos módulos se activan con LOW (lógica invertida)
const int ACTIVAR = LOW;
const int DESACTIVAR = HIGH;

void setup() {
  digitalWrite(PIN_RELE, DESACTIVAR);  // primero apagado, para que no "salte" al arrancar
  pinMode(PIN_RELE, OUTPUT);
}

void loop() {
  digitalWrite(PIN_RELE, ACTIVAR);    delay(2000);
  digitalWrite(PIN_RELE, DESACTIVAR); delay(2000);
}`,
    codigoESP32: `// Relé con ESP32 (GPIO 26)
const int PIN_RELE = 26;
const int ACTIVAR = LOW, DESACTIVAR = HIGH;

void setup() { digitalWrite(PIN_RELE, DESACTIVAR); pinMode(PIN_RELE, OUTPUT); }

void loop() {
  digitalWrite(PIN_RELE, ACTIVAR);    delay(2000);
  digitalWrite(PIN_RELE, DESACTIVAR); delay(2000);
}`,
    advertencias: ['PELIGRO: en el colegio no conectes 220 V al relé. Practica con cargas de 12 V o menos y con la supervisión del docente.', 'Escucharás un "clic" cada vez que cambia: es normal.', 'Si el relé está activo cuando debería estar apagado, tu módulo es de lógica invertida: cambia HIGH por LOW.'],
    aplicaciones: ['Encender una lámpara de 12 V a una hora', 'Riego automático con bomba', 'Control de un ventilador por temperatura'],
    porVerificar: ['Si tu módulo se activa con HIGH o con LOW depende del modelo (algunos tienen un puente para elegir).']
  });

  agregar({
    id: 'rele-2', nombre: 'Módulo relé de 2 canales', categoria: 'actuador',
    descripcion: 'Dos relés en un mismo módulo, con optoacopladores que aíslan la placa de la parte de potencia.',
    funcionamiento: 'Igual que el relé de 1 canal, pero doble. El optoacoplador es un LED y un sensor de luz dentro de un chip: la placa "habla" con el relé usando luz, sin cables eléctricos directos.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 70 mA por relé activado', logica: '5 V',
    pines: [P('GND', 'GND', '0 V', 'Tierra'), P('IN1', 'digital', '5 V', 'Control del relé 1'), P('IN2', 'digital', '5 V', 'Control del relé 2'), P('VCC', 'alimentación', '5 V', 'Alimentación de la parte lógica'), P('JD-VCC', 'alimentación', '5 V', 'Alimentación de las bobinas (con el puente puesto se une a VCC)'), P('COM / NO / NC (x2)', 'otro', 'Carga', 'Contactos de cada relé')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('IN1', 'D7'), K('IN2', 'D8')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('IN1', 'GPIO 26'), K('IN2', 'GPIO 27')],
    codigoArduino: `// Relé de 2 canales: se turnan como un semáforo
const int RELE_1 = 7, RELE_2 = 8;
const int ACTIVAR = LOW, DESACTIVAR = HIGH;   // módulo de lógica invertida

void setup() {
  digitalWrite(RELE_1, DESACTIVAR); digitalWrite(RELE_2, DESACTIVAR);
  pinMode(RELE_1, OUTPUT); pinMode(RELE_2, OUTPUT);
}

void loop() {
  digitalWrite(RELE_1, ACTIVAR); digitalWrite(RELE_2, DESACTIVAR); delay(1500);
  digitalWrite(RELE_1, DESACTIVAR); digitalWrite(RELE_2, ACTIVAR); delay(1500);
}`,
    codigoESP32: `// Relé de 2 canales con ESP32
const int RELE_1 = 26, RELE_2 = 27;
const int ACTIVAR = LOW, DESACTIVAR = HIGH;

void setup() {
  digitalWrite(RELE_1, DESACTIVAR); digitalWrite(RELE_2, DESACTIVAR);
  pinMode(RELE_1, OUTPUT); pinMode(RELE_2, OUTPUT);
}

void loop() {
  digitalWrite(RELE_1, ACTIVAR); digitalWrite(RELE_2, DESACTIVAR); delay(1500);
  digitalWrite(RELE_1, DESACTIVAR); digitalWrite(RELE_2, ACTIVAR); delay(1500);
}`,
    advertencias: ['PELIGRO: no uses 220 V en prácticas escolares.', 'Para aislar de verdad, quita el puente JD-VCC y alimenta las bobinas con otra fuente de 5 V.', 'Con dos relés activos el consumo es de ≈ 140 mA: el USB lo soporta, pero sin otros motores.'],
    aplicaciones: ['Control de un motor en dos sentidos (con cuidado)', 'Dos luces independientes', 'Domótica básica']
  });

  agregar({
    id: 'l298n', nombre: 'L298N · driver de motores', categoria: 'actuador',
    descripcion: 'Controla la velocidad y el sentido de giro de dos motores DC (o de un motor paso a paso bipolar).',
    funcionamiento: 'Tiene dos "puentes H": cuatro interruptores electrónicos dispuestos como una letra H que, según cuáles se cierren, hacen pasar la corriente por el motor en un sentido o en el otro. Con PWM en ENA/ENB se controla la velocidad.',
    voltajeOperacion: '5 a 35 V para los motores · 5 V para la lógica', corrienteTipica: 'Hasta 2 A por canal (se calienta mucho)', logica: '5 V',
    datos: [['Caída de voltaje', '≈ 2 V (un motor de 6 V con batería de 6 V gira lento)'], ['Regulador interno', 'Con el puente 5V-EN puesto entrega 5 V si la batería es de 12 V o menos']],
    pines: [P('12V (VS)', 'alimentación', '5–35 V', 'Batería de los motores'), P('GND', 'GND', '0 V', 'Tierra común'), P('5V', 'alimentación', '5 V', 'Salida (con puente) o entrada de 5 V lógica'), P('ENA', 'PWM', '5 V', 'Velocidad del motor A (quita el puente para usar PWM)'), P('IN1, IN2', 'digital', '5 V', 'Sentido del motor A'), P('IN3, IN4', 'digital', '5 V', 'Sentido del motor B'), P('ENB', 'PWM', '5 V', 'Velocidad del motor B'), P('OUT1, OUT2', 'otro', 'VS', 'Motor A'), P('OUT3, OUT4', 'otro', 'VS', 'Motor B')],
    conexionArduino: [K('ENA', 'D9'), K('IN1', 'D8'), K('IN2', 'D7'), K('IN3', 'D6'), K('IN4', 'D5'), K('ENB', 'D10'), K('GND', 'GND', 'Unida a la GND de la batería')],
    conexionESP32: [K('ENA', 'GPIO 25'), K('IN1', 'GPIO 26'), K('IN2', 'GPIO 27'), K('IN3', 'GPIO 14'), K('IN4', 'GPIO 13'), K('ENB', 'GPIO 33'), K('GND', 'GND', 'Las entradas aceptan 3,3 V como HIGH')],
    codigoArduino: `// L298N: motor A adelante, alto, atrás
const int ENA = 9, IN1 = 8, IN2 = 7;

void setup() {
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
}

void moverMotor(int velocidad) {   // de -255 (atrás) a 255 (adelante)
  digitalWrite(IN1, velocidad > 0);
  digitalWrite(IN2, velocidad < 0);
  analogWrite(ENA, abs(velocidad));
}

void loop() {
  moverMotor(200);  delay(2000);   // adelante
  moverMotor(0);    delay(1000);   // alto
  moverMotor(-200); delay(2000);   // atrás
  moverMotor(0);    delay(1000);
}`,
    codigoESP32: `// L298N con ESP32 (núcleo ESP32 2.x o 3.x: analogWrite funciona)
const int ENA = 25, IN1 = 26, IN2 = 27;

void moverMotor(int velocidad) {
  digitalWrite(IN1, velocidad > 0);
  digitalWrite(IN2, velocidad < 0);
  analogWrite(ENA, abs(velocidad));
}

void setup() { pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(ENA, OUTPUT); }

void loop() {
  moverMotor(200); delay(2000);
  moverMotor(0); delay(1000);
  moverMotor(-200); delay(2000);
  moverMotor(0); delay(1000);
}`,
    advertencias: [AVISO_MOTOR, 'Si la batería supera 12 V, quita el puente 5V-EN y alimenta la lógica aparte con 5 V.', 'El disipador se calienta mucho: no lo toques en funcionamiento.', 'Para motores pequeños de 3–6 V es mejor el DRV8833 (pierde mucho menos voltaje).'],
    aplicaciones: ['Carrito robot de dos ruedas', 'Robot seguidor de línea', 'Banda transportadora']
  });

  agregar({
    id: 'drv8833', nombre: 'DRV8833 · driver de motores pequeño', categoria: 'actuador',
    descripcion: 'Driver moderno y diminuto para dos motores DC pequeños. Pierde muy poco voltaje y funciona con lógica de 3,3 V y 5 V.',
    funcionamiento: 'También tiene dos puentes H, pero con transistores MOSFET muy eficientes, así que casi no se calienta. El sentido y la velocidad se controlan con PWM en los pines de entrada.',
    voltajeOperacion: '2,7 V a 10,8 V (motores)', corrienteTipica: '1,5 A por canal continuo (2 A pico)', logica: '3.3 V y 5 V',
    datos: [['Control', 'IN1 = PWM, IN2 = LOW → adelante · IN1 = LOW, IN2 = PWM → atrás · ambos LOW → libre'], ['Protecciones', 'Sobrecorriente y temperatura (pin nFAULT)']],
    pines: [P('VM', 'alimentación', '2,7–10,8 V', 'Batería de los motores'), P('GND', 'GND', '0 V', 'Tierra'), P('AIN1, AIN2', 'PWM', '3,3–5 V', 'Control del motor A'), P('BIN1, BIN2', 'PWM', '3,3–5 V', 'Control del motor B'), P('AOUT1, AOUT2', 'otro', 'VM', 'Motor A'), P('BOUT1, BOUT2', 'otro', 'VM', 'Motor B'), P('nSLEEP (EEP)', 'digital', '3,3–5 V', 'HIGH = activo (en muchos módulos ya está a HIGH)'), P('nFAULT (ULT)', 'digital', '—', 'Se pone en LOW si hay falla')],
    conexionArduino: [K('AIN1', 'D9'), K('AIN2', 'D10'), K('VM', 'Batería +'), K('GND', 'GND y batería −')],
    conexionESP32: [K('AIN1', 'GPIO 25'), K('AIN2', 'GPIO 26'), K('VM', 'Batería +'), K('GND', 'GND y batería −')],
    codigoArduino: `// DRV8833: acelera y frena suave el motor A
const int AIN1 = 9, AIN2 = 10;   // pines con PWM

void moverMotor(int v) {          // -255 a 255
  if (v >= 0) { analogWrite(AIN1, v); digitalWrite(AIN2, LOW); }
  else        { digitalWrite(AIN1, LOW); analogWrite(AIN2, -v); }
}

void setup() { pinMode(AIN1, OUTPUT); pinMode(AIN2, OUTPUT); }

void loop() {
  for (int v = 0; v <= 255; v += 5) { moverMotor(v); delay(30); }   // acelera
  for (int v = 255; v >= 0; v -= 5) { moverMotor(v); delay(30); }   // frena
  delay(1000);
}`,
    codigoESP32: `// DRV8833 con ESP32
const int AIN1 = 25, AIN2 = 26;

void moverMotor(int v) {
  if (v >= 0) { analogWrite(AIN1, v); digitalWrite(AIN2, LOW); }
  else        { digitalWrite(AIN1, LOW); analogWrite(AIN2, -v); }
}

void setup() { pinMode(AIN1, OUTPUT); pinMode(AIN2, OUTPUT); }

void loop() {
  moverMotor(180); delay(2000);
  moverMotor(-180); delay(2000);
}`,
    advertencias: [AVISO_MOTOR, 'No pases de 10,8 V en VM: el chip se daña.', 'Si los motores no giran, revisa que nSLEEP esté en HIGH.'],
    aplicaciones: ['Robot pequeño con motores amarillos (TT)', 'Mini ventilador con control de velocidad', 'Vehículo con ESP32 controlado por Wi-Fi'],
    porVerificar: ['La serigrafía cambia entre módulos (EEP/nSLEEP, ULT/nFAULT, IN1–IN4 en vez de AIN/BIN).']
  });

  agregar({
    id: 'uln2003-28byj48', nombre: 'ULN2003 + motor paso a paso 28BYJ-48', categoria: 'actuador',
    descripcion: 'Kit muy común: un motor paso a paso pequeño de 5 V y su placa driver con 4 LEDs que muestran los pasos.',
    funcionamiento: 'El motor tiene 4 bobinas. Si las energizas en orden, el eje avanza "paso a paso", como las manecillas de un reloj. El chip ULN2003 son transistores que entregan la corriente que la placa no puede dar.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 160 mA a 240 mA (motor en marcha)', logica: '3.3 V y 5 V',
    datos: [['Pasos por vuelta', '2048 (paso completo) · 4096 (medio paso) por la reducción de ≈ 1:64'], ['Velocidad máxima', '≈ 15 rpm'], ['Torque', 'Pequeño pero suficiente para mover agujas o persianas']],
    pines: [P('IN1–IN4', 'digital', '3,3–5 V', 'Control de las 4 bobinas'), P('+ (5–12 V)', 'alimentación', '5 V', 'Alimentación del motor'), P('−', 'GND', '0 V', 'Tierra'), P('Conector blanco', 'otro', '5 V', 'Motor (5 cables)')],
    conexionArduino: [K('IN1', 'D8'), K('IN2', 'D9'), K('IN3', 'D10'), K('IN4', 'D11'), K('+', 'Fuente de 5 V'), K('−', 'GND')],
    conexionESP32: [K('IN1', 'GPIO 19'), K('IN2', 'GPIO 18'), K('IN3', 'GPIO 5'), K('IN4', 'GPIO 17'), K('+', 'Fuente de 5 V'), K('−', 'GND')],
    codigoArduino: `// 28BYJ-48: una vuelta en un sentido y otra en el contrario
// Librería "Stepper" (ya viene con Arduino IDE)
#include <Stepper.h>

const int PASOS_POR_VUELTA = 2048;
// ¡Ojo con el orden! IN1, IN3, IN2, IN4
Stepper motor(PASOS_POR_VUELTA, 8, 10, 9, 11);

void setup() {
  motor.setSpeed(10);   // revoluciones por minuto (máx. ≈ 15)
}

void loop() {
  motor.step(PASOS_POR_VUELTA);    // una vuelta completa
  delay(500);
  motor.step(-PASOS_POR_VUELTA);   // vuelta al revés
  delay(500);
}`,
    codigoESP32: `// 28BYJ-48 con ESP32
#include <Stepper.h>

const int PASOS_POR_VUELTA = 2048;
Stepper motor(PASOS_POR_VUELTA, 19, 5, 18, 17);   // IN1, IN3, IN2, IN4

void setup() { motor.setSpeed(10); }

void loop() {
  motor.step(PASOS_POR_VUELTA); delay(500);
  motor.step(-PASOS_POR_VUELTA); delay(500);
}`,
    advertencias: ['El orden de pines en la librería Stepper es IN1, IN3, IN2, IN4: si lo pones en orden normal el motor solo vibra.', 'Alimenta el motor con una fuente de 5 V aparte si usas otros módulos.', 'El motor se calienta aunque esté quieto si las bobinas quedan energizadas.'],
    aplicaciones: ['Reloj analógico', 'Persiana automática', 'Plataforma giratoria para fotos', 'Dispensador de comida para mascotas']
  });

  agregar({
    id: 'servo-sg90', nombre: 'Servo SG90', categoria: 'actuador',
    descripcion: 'Motor pequeño que gira a un ángulo exacto entre 0° y 180° y se queda ahí. Muy usado en robótica.',
    funcionamiento: 'Tiene un motor, engranajes y un potenciómetro que "sabe" en qué ángulo está el eje. La placa le envía un pulso cada 20 ms: la duración del pulso (de 0,5 a 2,4 ms) indica el ángulo deseado.',
    voltajeOperacion: '4,8 V a 6 V', corrienteTipica: '≈ 100–250 mA moviéndose · hasta ≈ 650 mA si se traba', logica: '3.3 V y 5 V',
    datos: [['Cables', 'Marrón = GND · Rojo = 5 V · Naranja = señal'], ['Torque', '≈ 1,8 kg·cm'], ['Señal', 'PWM de 50 Hz (periodo de 20 ms)']],
    pines: [P('Marrón (GND)', 'GND', '0 V', 'Tierra'), P('Rojo (VCC)', 'alimentación', '5 V', 'Alimentación'), P('Naranja (señal)', 'PWM', '3,3–5 V', 'Pulso de control')],
    conexionArduino: [K('Marrón', 'GND'), K('Rojo', '5V', 'Con más de un servo usa fuente externa'), K('Naranja', 'D9')],
    conexionESP32: [K('Marrón', 'GND'), K('Rojo', 'VIN (5 V)'), K('Naranja', 'GPIO 13')],
    codigoArduino: `// Servo SG90: barrido de 0° a 180° y regreso
#include <Servo.h>

Servo miServo;

void setup() {
  miServo.attach(9);   // señal en el pin 9
}

void loop() {
  for (int angulo = 0; angulo <= 180; angulo++) { miServo.write(angulo); delay(15); }
  for (int angulo = 180; angulo >= 0; angulo--) { miServo.write(angulo); delay(15); }
}`,
    codigoESP32: `// Servo SG90 con ESP32
// Librería: "ESP32Servo" (la librería Servo normal no funciona en ESP32)
#include <ESP32Servo.h>

Servo miServo;

void setup() {
  miServo.attach(13, 500, 2400);   // pin, pulso mínimo y máximo en µs
}

void loop() {
  miServo.write(0);   delay(1000);
  miServo.write(90);  delay(1000);
  miServo.write(180); delay(1000);
}`,
    advertencias: ['Si el servo hace que la placa se reinicie, consume demasiado: aliméntalo con una fuente externa de 5 V y une las GND.', 'No lo fuerces con la mano cuando está encendido: se rompen los engranajes de plástico.', 'Algunos SG90 no llegan a 180° exactos: ajusta los límites del pulso.'],
    aplicaciones: ['Brazo robótico', 'Barrera de estacionamiento', 'Cerradura automática', 'Torreta para el sensor ultrasónico']
  });

  agregar({
    id: 'mini-bomba', nombre: 'Mini bomba de agua sumergible', categoria: 'actuador',
    descripcion: 'Pequeña bomba de 3 a 6 V que se sumerge en el agua y la impulsa por una manguera. Ideal para riego automático.',
    funcionamiento: 'Un motor DC hace girar un rotor con aspas (impulsor) que empuja el agua hacia la salida, como un ventilador pero para líquidos.',
    voltajeOperacion: '3 V a 6 V DC', corrienteTipica: '≈ 100–200 mA', logica: '—',
    datos: [['Caudal', '≈ 80 a 120 litros por hora'], ['Altura máxima', '≈ 40 a 110 cm']],
    pines: [P('Cable rojo (+)', 'alimentación', '3–6 V', 'Positivo'), P('Cable negro (−)', 'GND', '0 V', 'Negativo')],
    conexionArduino: [K('Rojo (+)', '+5 V de una fuente externa'), K('Negro (−)', 'Colector de un transistor TIP120 (o drenador de un MOSFET IRLZ44N)'), K('Base del TIP120', 'D7', 'A través de 1 kΩ; emisor a GND y diodo 1N4007 en paralelo con la bomba')],
    conexionESP32: [K('Rojo (+)', '+5 V externo'), K('Negro (−)', 'Drenador de un MOSFET de nivel lógico (IRLZ44N)'), K('Compuerta del MOSFET', 'GPIO 26', 'Con 220 Ω y una de 10 kΩ a GND')],
    codigoArduino: `// Mini bomba: riega 3 segundos cada 10 segundos (prueba)
const int PIN_BOMBA = 7;   // controla el transistor

void setup() { pinMode(PIN_BOMBA, OUTPUT); }

void loop() {
  digitalWrite(PIN_BOMBA, HIGH);  // bomba encendida
  delay(3000);
  digitalWrite(PIN_BOMBA, LOW);   // bomba apagada
  delay(10000);
}`,
    codigoESP32: `// Mini bomba con ESP32 y MOSFET
const int PIN_BOMBA = 26;

void setup() { pinMode(PIN_BOMBA, OUTPUT); }

void loop() {
  digitalWrite(PIN_BOMBA, HIGH); delay(3000);
  digitalWrite(PIN_BOMBA, LOW);  delay(10000);
}`,
    advertencias: ['Nunca la hagas funcionar en seco: se quema en poco tiempo.', 'Nunca la conectes directo a un pin de la placa: siempre con transistor, MOSFET o relé.', 'Coloca un diodo 1N4007 en paralelo con la bomba (franja hacia el +) para proteger el transistor.', 'Mantén la electrónica lejos del agua.'],
    aplicaciones: ['Riego automático con sensor de humedad', 'Fuente decorativa', 'Dispensador de agua para mascotas']
  });

  agregar({
    id: 'hc-05', nombre: 'HC-05 · Bluetooth', categoria: 'comunicacion',
    descripcion: 'Módulo Bluetooth clásico que permite enviar y recibir datos desde el celular (con una app de terminal Bluetooth).',
    funcionamiento: 'Es como un cable serie invisible: lo que la placa escribe por su puerto serie viaja por radio hasta el celular, y al revés.',
    voltajeOperacion: '3,6 V a 6 V (módulo) · lógica de 3,3 V', corrienteTipica: '≈ 30–40 mA emparejando · ≈ 8 mA conectado', logica: '3.3 V',
    datos: [['Velocidad por defecto', '9600 baudios (modo datos) · 38400 (modo AT)'], ['Clave de emparejamiento', '1234 o 0000'], ['Alcance', '≈ 10 m']],
    pines: [P('EN (KEY)', 'digital', '3,3 V', 'HIGH al encender = modo de comandos AT'), P('VCC', 'alimentación', '5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('TXD', 'UART', '3,3 V', 'Datos que salen del módulo'), P('RXD', 'UART', '3,3 V', 'Datos que entran al módulo (¡solo 3,3 V!)'), P('STATE', 'digital', '3,3 V', 'HIGH cuando está conectado')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('TXD', 'D10'), K('RXD', 'D11', 'Con divisor: D11 → 1 kΩ → RXD → 2 kΩ → GND')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('TXD', 'GPIO 16 (RX2)'), K('RXD', 'GPIO 17 (TX2)', 'Directo: ambos son de 3,3 V')],
    codigoArduino: `// HC-05: lo que envías desde el celular aparece en el monitor, y al revés
#include <SoftwareSerial.h>

SoftwareSerial bt(10, 11);   // RX, TX (conectados a TXD y RXD del módulo)

void setup() {
  Serial.begin(9600);
  bt.begin(9600);
  Serial.println("Empareja el celular con el HC-05 (clave 1234)");
}

void loop() {
  if (bt.available()) Serial.write(bt.read());      // celular → monitor
  if (Serial.available()) bt.write(Serial.read());  // monitor → celular
}`,
    codigoESP32: `// HC-05 con ESP32 usando el UART2 (GPIO 16 y 17)
// Nota: el ESP32 clásico ya trae Bluetooth (librería BluetoothSerial),
// así que el HC-05 solo hace falta si quieres practicar con el módulo.

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);   // RX2, TX2
}

void loop() {
  if (Serial2.available()) Serial.write(Serial2.read());
  if (Serial.available()) Serial2.write(Serial.read());
}`,
    advertencias: ['El pin RXD es de 3,3 V: con el UNO usa siempre el divisor de voltaje.', 'No funciona con iPhone (solo Bluetooth clásico); usa un celular Android.', 'Si subes el programa con el módulo en D0/D1, la carga falla: por eso usamos SoftwareSerial.'],
    aplicaciones: ['Carrito controlado desde el celular', 'Encender luces con una app', 'Enviar lecturas de sensores al celular']
  });

  agregar({
    id: 'rfid-rc522', nombre: 'RFID RC522', categoria: 'comunicacion',
    descripcion: 'Lector de tarjetas y llaveros RFID de 13,56 MHz (como las tarjetas de transporte o de control de acceso).',
    funcionamiento: 'La antena del lector crea un campo magnético. Cuando acercas la tarjeta, ese campo le da energía (¡la tarjeta no tiene pila!) y ella responde con su número único (UID).',
    voltajeOperacion: '3,3 V', corrienteTipica: '≈ 13–26 mA', logica: '3.3 V',
    datos: [['Frecuencia', '13,56 MHz'], ['Tarjetas', 'MIFARE Classic 1K, llaveros'], ['Distancia', '≈ 3 cm'], ['Comunicación', 'SPI']],
    pines: [P('SDA (SS)', 'SPI', '3,3 V', 'Selección del lector'), P('SCK', 'SPI', '3,3 V', 'Reloj SPI'), P('MOSI', 'SPI', '3,3 V', 'Datos hacia el lector'), P('MISO', 'SPI', '3,3 V', 'Datos desde el lector'), P('IRQ', 'digital', '3,3 V', 'Interrupción (normalmente libre)'), P('GND', 'GND', '0 V', 'Tierra'), P('RST', 'digital', '3,3 V', 'Reinicio'), P('3.3V', 'alimentación', '3,3 V', 'Alimentación (¡NO a 5 V!)')],
    conexionArduino: [K('SDA', 'D10'), K('SCK', 'D13'), K('MOSI', 'D11'), K('MISO', 'D12'), K('RST', 'D9'), K('3.3V', '3.3V'), K('GND', 'GND')],
    conexionESP32: [K('SDA', 'GPIO 5'), K('SCK', 'GPIO 18'), K('MOSI', 'GPIO 23'), K('MISO', 'GPIO 19'), K('RST', 'GPIO 27'), K('3.3V', '3V3'), K('GND', 'GND')],
    codigoArduino: `// RC522: muestra el número (UID) de cada tarjeta
// Librería: "MFRC522" de GithubCommunity
#include <SPI.h>
#include <MFRC522.h>

const int PIN_SS = 10, PIN_RST = 9;
MFRC522 lector(PIN_SS, PIN_RST);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  lector.PCD_Init();
  Serial.println("Acerca una tarjeta...");
}

void loop() {
  if (!lector.PICC_IsNewCardPresent() || !lector.PICC_ReadCardSerial()) return;
  Serial.print("UID:");
  for (byte i = 0; i < lector.uid.size; i++) {
    Serial.print(lector.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(lector.uid.uidByte[i], HEX);
  }
  Serial.println();
  lector.PICC_HaltA();   // deja de leer esta tarjeta
}`,
    codigoESP32: `// RC522 con ESP32 (SPI por defecto: SCK 18, MISO 19, MOSI 23)
#include <SPI.h>
#include <MFRC522.h>

MFRC522 lector(5, 27);   // SS, RST

void setup() { Serial.begin(115200); SPI.begin(); lector.PCD_Init(); }

void loop() {
  if (!lector.PICC_IsNewCardPresent() || !lector.PICC_ReadCardSerial()) return;
  Serial.print("UID:");
  for (byte i = 0; i < lector.uid.size; i++) Serial.printf(" %02X", lector.uid.uidByte[i]);
  Serial.println();
  lector.PICC_HaltA();
}`,
    advertencias: ['Aliméntalo SOLO con 3,3 V: con 5 V se daña.', 'Con el UNO las señales SPI son de 5 V; suele funcionar, pero lo más seguro es usar un conversor de nivel.', 'Suelda bien los pines: los contactos flojos son la falla más común.'],
    aplicaciones: ['Control de asistencia con tarjetas', 'Cerradura con llavero', 'Juego de preguntas con tarjetas'],
    porVerificar: ['Tolerancia de los pines del RC522 a señales de 5 V: no está garantizada por el fabricante.']
  });

  agregar({
    id: 'gps-neo-6m', nombre: 'GPS NEO-6M', categoria: 'comunicacion',
    descripcion: 'Receptor GPS que calcula la latitud, longitud, altitud, velocidad y hora exacta a partir de los satélites.',
    funcionamiento: 'Los satélites GPS envían su posición y la hora exacta. El módulo mide cuánto tarda en llegar la señal de al menos 4 satélites y, como sabe que viaja a la velocidad de la luz, calcula dónde estás (trilateración).',
    voltajeOperacion: '3,3 V a 5 V (el módulo trae regulador)', corrienteTipica: '≈ 45 mA', logica: '3.3 V',
    datos: [['Velocidad serie', '9600 baudios'], ['Formato', 'Frases NMEA ($GPGGA, $GPRMC…)'], ['Primer arranque', '30 s a varios minutos al aire libre'], ['LED', 'Parpadea cuando ya tiene posición']],
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('RX', 'UART', '3,3 V', 'Entrada de datos al GPS'), P('TX', 'UART', '3,3 V', 'Salida de datos del GPS'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('TX', 'D4'), K('RX', 'D3', 'Con divisor 1 kΩ / 2 kΩ (opcional si solo lees)')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('TX', 'GPIO 16 (RX2)'), K('RX', 'GPIO 17 (TX2)')],
    codigoArduino: `// GPS NEO-6M: muestra latitud y longitud
// Librería: "TinyGPSPlus"
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>

SoftwareSerial gpsSerial(4, 3);   // RX (al TX del GPS), TX (al RX del GPS)
TinyGPSPlus gps;

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  Serial.println("Buscando satélites (sal al patio)...");
}

void loop() {
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  if (gps.location.isUpdated()) {
    Serial.print("Latitud: ");  Serial.print(gps.location.lat(), 6);
    Serial.print("  Longitud: "); Serial.print(gps.location.lng(), 6);
    Serial.print("  Satélites: "); Serial.println(gps.satellites.value());
  }
}`,
    codigoESP32: `// GPS NEO-6M con ESP32 (UART2)
#include <TinyGPSPlus.h>

TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
}

void loop() {
  while (Serial2.available()) gps.encode(Serial2.read());
  if (gps.location.isUpdated())
    Serial.printf("Lat: %.6f  Lon: %.6f  Alt: %.0f m\\n", gps.location.lat(), gps.location.lng(), gps.altitude.meters());
}`,
    advertencias: ['Dentro del aula casi nunca recibe señal: pruébalo al aire libre con la antena mirando al cielo.', 'La primera posición puede tardar varios minutos (arranque en frío).', 'La hora del GPS es UTC: en Perú resta 5 horas.'],
    aplicaciones: ['Rastreador de recorrido', 'Medir la altitud de Llata', 'Reloj de hora exacta', 'Velocímetro para bicicleta']
  });

  agregar({
    id: 'rf-433', nombre: 'Módulos RF 433 MHz (emisor y receptor)', categoria: 'comunicacion',
    descripcion: 'Pareja de módulos de radio muy económicos para enviar mensajes cortos de una placa a otra sin cables.',
    funcionamiento: 'El emisor (FS1000A) enciende y apaga una onda de radio de 433 MHz siguiendo los bits del mensaje, como hacer señales con una linterna. El receptor detecta esos cambios y reconstruye los bits.',
    voltajeOperacion: 'Emisor: 3 V a 12 V · Receptor: 5 V', corrienteTipica: 'Emisor ≈ 20–40 mA · Receptor ≈ 4 mA', logica: '5 V',
    datos: [['Alcance', '≈ 20 m sin antena · hasta 100 m con antena de 17 cm'], ['Velocidad', 'Lenta: ≈ 2000 bits por segundo']],
    pines: [P('Emisor DATA', 'digital', '3,3–5 V', 'Datos a transmitir'), P('Emisor VCC', 'alimentación', '3–12 V', 'Más voltaje = más alcance'), P('Emisor GND', 'GND', '0 V', 'Tierra'), P('Receptor VCC', 'alimentación', '5 V', 'Alimentación'), P('Receptor DATA (x2)', 'digital', '5 V', 'Datos recibidos (los dos pines centrales están unidos)'), P('Receptor GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('Emisor DATA', 'D12', 'Placa que envía'), K('Receptor DATA', 'D11', 'Placa que recibe'), K('VCC / GND', '5V / GND')],
    conexionESP32: [K('Receptor VCC', 'VIN (5 V)'), K('Receptor DATA', 'GPIO 4', 'Con divisor 10 kΩ / 20 kΩ'), K('Receptor GND', 'GND')],
    codigoArduino: `// EMISOR RF 433 MHz (placa UNO con el FS1000A en D12)
// Librería: "RadioHead" (RH_ASK)
#include <RH_ASK.h>
#include <SPI.h>   // RadioHead la necesita para compilar

RH_ASK radio;      // por defecto: TX = D12, RX = D11

void setup() {
  Serial.begin(9600);
  if (!radio.init()) Serial.println("Error al iniciar la radio");
}

void loop() {
  const char *mensaje = "Hola desde Llata";
  radio.send((uint8_t *)mensaje, strlen(mensaje));
  radio.waitPacketSent();
  Serial.println("Mensaje enviado");
  delay(1000);
}`,
    codigoESP32: `// RECEPTOR RF 433 MHz con ESP32 (DATA en GPIO 4 con divisor)
#include <RH_ASK.h>
#include <SPI.h>

RH_ASK radio(2000, 4, 5);   // velocidad, pin RX, pin TX

void setup() {
  Serial.begin(115200);
  if (!radio.init()) Serial.println("Error al iniciar la radio");
}

void loop() {
  uint8_t buf[32];
  uint8_t largo = sizeof(buf);
  if (radio.recv(buf, &largo)) {
    Serial.print("Recibido: ");
    Serial.write(buf, largo);
    Serial.println();
  }
}`,
    advertencias: ['Suelda una antena de 17,3 cm (un cuarto de onda) en el emisor y en el receptor: el alcance mejora muchísimo.', 'No es seguro ni confiable: no lo uses para alarmas importantes.', 'El receptor entrega 5 V: con ESP32 usa un divisor.'],
    aplicaciones: ['Timbre inalámbrico', 'Control remoto de un carrito', 'Enviar la temperatura de un sensor exterior'],
    porVerificar: ['Soporte de RH_ASK en ESP32 según la versión de RadioHead y del núcleo ESP32; si falla, prueba la librería "rc-switch".']
  });

  agregar({
    id: 'lcd-16x2-i2c', nombre: 'LCD 16x2 con I2C', categoria: 'visualizacion',
    descripcion: 'Pantalla de 2 filas y 16 caracteres con un adaptador I2C soldado atrás, que reduce los cables de 16 a solo 4.',
    funcionamiento: 'Cada carácter está hecho de una cuadrícula de 5 × 8 puntos de cristal líquido que se oscurecen con voltaje. El adaptador (chip PCF8574) recibe los datos por I2C y maneja la pantalla por ti.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 20–30 mA con luz de fondo', logica: '5 V',
    datos: [['Dirección I2C', '0x27 o 0x3F (depende del chip)'], ['Contraste', 'Potenciómetro azul en el adaptador']],
    pines: [P('GND', 'GND', '0 V', 'Tierra'), P('VCC', 'alimentación', '5 V', 'Alimentación'), P('SDA', 'I2C', '5 V', 'Datos'), P('SCL', 'I2C', '5 V', 'Reloj')],
    conexionArduino: [K('GND', 'GND'), K('VCC', '5V'), K('SDA', 'A4'), K('SCL', 'A5')],
    conexionESP32: [K('GND', 'GND'), K('VCC', 'VIN (5 V)'), K('SDA', 'GPIO 21'), K('SCL', 'GPIO 22')],
    codigoArduino: `// LCD 16x2 I2C: mensaje y contador
// Librería: "LiquidCrystal I2C" de Frank de Brabander
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // prueba 0x3F si no aparece nada

void setup() {
  lcd.init();
  lcd.backlight();          // enciende la luz de fondo
  lcd.setCursor(0, 0);      // columna 0, fila 0
  lcd.print("Hola, Llata!");
}

void loop() {
  lcd.setCursor(0, 1);      // segunda fila
  lcd.print("Segundos: ");
  lcd.print(millis() / 1000);
  delay(200);
}`,
    codigoESP32: `// LCD 16x2 I2C con ESP32 (SDA 21, SCL 22)
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() { lcd.init(); lcd.backlight(); lcd.print("ESP32 + LCD"); }

void loop() {
  lcd.setCursor(0, 1);
  lcd.print("t = "); lcd.print(millis() / 1000); lcd.print(" s   ");
  delay(200);
}`,
    advertencias: ['Si se enciende la luz pero no ves letras, gira el potenciómetro de contraste.', 'Si no funciona, usa un escáner I2C para conocer la dirección real.', 'Con ESP32, el adaptador sube SDA/SCL a 5 V: lo correcto es usar un conversor de nivel (aunque muchas veces funciona sin él).'],
    aplicaciones: ['Mostrar la temperatura', 'Menú de un proyecto', 'Contador de puntos de un juego']
  });

  agregar({
    id: 'oled-ssd1306', nombre: 'OLED SSD1306 0,96"', categoria: 'visualizacion',
    descripcion: 'Pantalla pequeña de 128 × 64 píxeles muy nítida. Puede mostrar texto, gráficos y dibujos.',
    funcionamiento: 'Cada píxel es un diminuto LED orgánico que brilla por sí solo, por eso no necesita luz de fondo y el negro es negro de verdad. El chip SSD1306 recibe la imagen por I2C.',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: '≈ 10–20 mA (depende de cuántos píxeles estén encendidos)', logica: '3.3 V y 5 V',
    datos: [['Resolución', '128 × 64 píxeles'], ['Dirección I2C', '0x3C (a veces 0x3D)']],
    pines: [P('GND', 'GND', '0 V', 'Tierra'), P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('SCL', 'I2C', '3,3–5 V', 'Reloj'), P('SDA', 'I2C', '3,3–5 V', 'Datos')],
    conexionArduino: [K('GND', 'GND'), K('VCC', '5V'), K('SCL', 'A5'), K('SDA', 'A4')],
    conexionESP32: [K('GND', 'GND'), K('VCC', '3V3'), K('SCL', 'GPIO 22'), K('SDA', 'GPIO 21')],
    codigoArduino: `// OLED SSD1306: texto y un círculo
// Librerías: "Adafruit SSD1306" y "Adafruit GFX"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);

void setup() {
  Serial.begin(9600);
  if (!pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("No encuentro la pantalla OLED");
    while (true) {}
  }
  pantalla.clearDisplay();
  pantalla.setTextSize(2);
  pantalla.setTextColor(SSD1306_WHITE);
  pantalla.setCursor(0, 0);
  pantalla.println("ELECTRO");
  pantalla.println("VERSE");
  pantalla.drawCircle(100, 40, 15, SSD1306_WHITE);
  pantalla.display();   // ¡sin esto no se ve nada!
}

void loop() {}`,
    codigoESP32: `// OLED SSD1306 con ESP32 (SDA 21, SCL 22)
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);

void setup() {
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  pantalla.setTextColor(SSD1306_WHITE);
}

void loop() {
  pantalla.clearDisplay();
  pantalla.setTextSize(2);
  pantalla.setCursor(0, 20);
  pantalla.printf("t = %lu s", millis() / 1000);
  pantalla.display();
  delay(500);
}`,
    advertencias: ['Recuerda llamar a display() después de dibujar.', 'La librería usa 1 KB de RAM: en el UNO (2 KB) deja poco espacio para lo demás.', 'Algunas pantallas tienen VCC y GND en orden inverso: revisa la serigrafía antes de conectar.'],
    aplicaciones: ['Reloj digital', 'Gráfica en vivo de un sensor', 'Videojuego sencillo con el joystick']
  });

  agregar({
    id: 'tft-24', nombre: 'Pantalla TFT 2,4" (ILI9341, SPI)', categoria: 'visualizacion',
    descripcion: 'Pantalla a color de 240 × 320 píxeles. Algunas versiones incluyen panel táctil y ranura para microSD.',
    funcionamiento: 'Cada píxel tiene tres subpíxeles (rojo, verde y azul) de cristal líquido delante de una luz blanca. El chip ILI9341 guarda la imagen y la actualiza; la placa le envía los píxeles por SPI.',
    voltajeOperacion: '3,3 V a 5 V en VCC (lógica de 3,3 V)', corrienteTipica: '≈ 50–100 mA con luz de fondo', logica: '3.3 V',
    datos: [['Resolución', '240 × 320 píxeles, 65 000 colores'], ['Controlador', 'ILI9341'], ['Variante "shield"', 'Existe también como shield paralelo de 8 bits para el UNO (otra conexión y otra librería)']],
    pines: [P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('CS', 'SPI', '3,3 V', 'Selección'), P('RESET', 'digital', '3,3 V', 'Reinicio'), P('DC (RS)', 'digital', '3,3 V', 'Dato o comando'), P('SDI (MOSI)', 'SPI', '3,3 V', 'Datos hacia la pantalla'), P('SCK', 'SPI', '3,3 V', 'Reloj'), P('LED', 'alimentación', '3,3 V', 'Luz de fondo'), P('SDO (MISO)', 'SPI', '3,3 V', 'Datos desde la pantalla (opcional)'), P('T_CLK, T_CS, T_DIN, T_DO, T_IRQ', 'SPI', '3,3 V', 'Panel táctil (si lo tiene)')],
    conexionArduino: [K('CS', 'D10', 'Todas las señales con conversor de nivel o divisor'), K('DC', 'D9'), K('RESET', 'D8'), K('SDI (MOSI)', 'D11'), K('SCK', 'D13'), K('VCC / LED', '3.3V (o 5V si el módulo trae regulador)'), K('GND', 'GND')],
    conexionESP32: [K('CS', 'GPIO 5'), K('DC', 'GPIO 4'), K('RESET', 'GPIO 27'), K('SDI (MOSI)', 'GPIO 23'), K('SCK', 'GPIO 18'), K('SDO (MISO)', 'GPIO 19'), K('VCC / LED', '3V3'), K('GND', 'GND')],
    codigoArduino: `// TFT 2,4" ILI9341: fondo de color y texto
// Librerías: "Adafruit ILI9341" y "Adafruit GFX"
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>

const int TFT_CS = 10, TFT_DC = 9, TFT_RST = 8;
Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);

void setup() {
  tft.begin();
  tft.setRotation(1);                 // horizontal
  tft.fillScreen(ILI9341_NAVY);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setTextSize(3);
  tft.setCursor(20, 100);
  tft.print("ELECTROVERSE");
}

void loop() {}`,
    codigoESP32: `// TFT 2,4" ILI9341 con ESP32 (SPI: SCK 18, MOSI 23, MISO 19)
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>

Adafruit_ILI9341 tft(5, 4, 27);   // CS, DC, RST

void setup() {
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  tft.fillCircle(160, 120, 60, ILI9341_CYAN);
}

void loop() {}`,
    advertencias: ['La lógica es de 3,3 V: con el UNO necesitas conversor de nivel (o resistencias en serie) en CS, DC, RESET, MOSI y SCK.', 'Si la pantalla queda blanca, revisa el pin DC y el RESET.', 'Con el ESP32 la librería TFT_eSPI es mucho más rápida (se configura en su archivo User_Setup.h).'],
    aplicaciones: ['Panel de control a color', 'Mostrar gráficas de sensores', 'Juegos sencillos', 'Marco de fotos desde la microSD'],
    porVerificar: ['Existen varias pantallas de 2,4" con distinto chip (ILI9341, ILI9325, ST7789) y formato (SPI o shield paralelo). Confirma el modelo de la tuya.', 'Algunos módulos traen regulador y conversor de nivel; otros no.']
  });

  agregar({
    id: 'matriz-max7219', nombre: 'Matriz LED 8x8 con MAX7219', categoria: 'visualizacion',
    descripcion: 'Cuadrícula de 64 LEDs rojos controlada por el chip MAX7219. Varios módulos se pueden encadenar para hacer letreros.',
    funcionamiento: 'El MAX7219 enciende las filas una por una muy rápido (multiplexado). Tus ojos no notan el cambio y ven la imagen completa. Solo necesita 3 cables de datos.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 50–300 mA (depende del brillo y de los LEDs encendidos)', logica: '5 V',
    datos: [['Registros principales', '0x01–0x08 filas · 0x09 decodificación · 0x0A brillo · 0x0B filas activas · 0x0C encendido · 0x0F prueba']],
    pines: [P('VCC', 'alimentación', '5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('DIN', 'SPI', '5 V', 'Datos de entrada'), P('CS (LOAD)', 'SPI', '5 V', 'Carga de datos'), P('CLK', 'SPI', '5 V', 'Reloj'), P('DOUT', 'SPI', '5 V', 'Salida hacia el siguiente módulo')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('DIN', 'D11'), K('CS', 'D10'), K('CLK', 'D13')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('DIN', 'GPIO 23'), K('CS', 'GPIO 5'), K('CLK', 'GPIO 18')],
    codigoArduino: `// Matriz 8x8 MAX7219 sin librerías: dibuja una carita feliz
const int PIN_DIN = 11, PIN_CS = 10, PIN_CLK = 13;

// Cada número es una fila: 1 = LED encendido
const byte CARITA[8] = {
  0b00111100, 0b01000010, 0b10100101, 0b10000001,
  0b10100101, 0b10011001, 0b01000010, 0b00111100
};

void enviar(byte registro, byte dato) {
  digitalWrite(PIN_CS, LOW);
  shiftOut(PIN_DIN, PIN_CLK, MSBFIRST, registro);
  shiftOut(PIN_DIN, PIN_CLK, MSBFIRST, dato);
  digitalWrite(PIN_CS, HIGH);   // el MAX7219 guarda el dato
}

void setup() {
  pinMode(PIN_DIN, OUTPUT); pinMode(PIN_CS, OUTPUT); pinMode(PIN_CLK, OUTPUT);
  enviar(0x0F, 0);   // sin modo prueba
  enviar(0x09, 0);   // sin decodificación (controlamos cada LED)
  enviar(0x0B, 7);   // usar las 8 filas
  enviar(0x0A, 3);   // brillo bajo (0 a 15)
  enviar(0x0C, 1);   // encender
  for (int fila = 0; fila < 8; fila++) enviar(fila + 1, CARITA[fila]);
}

void loop() {}`,
    codigoESP32: `// Matriz 8x8 MAX7219 con ESP32
const int PIN_DIN = 23, PIN_CS = 5, PIN_CLK = 18;
const byte CORAZON[8] = { 0b00000000, 0b01100110, 0b11111111, 0b11111111, 0b01111110, 0b00111100, 0b00011000, 0b00000000 };

void enviar(byte reg, byte dato) {
  digitalWrite(PIN_CS, LOW);
  shiftOut(PIN_DIN, PIN_CLK, MSBFIRST, reg);
  shiftOut(PIN_DIN, PIN_CLK, MSBFIRST, dato);
  digitalWrite(PIN_CS, HIGH);
}

void setup() {
  pinMode(PIN_DIN, OUTPUT); pinMode(PIN_CS, OUTPUT); pinMode(PIN_CLK, OUTPUT);
  enviar(0x0F, 0); enviar(0x09, 0); enviar(0x0B, 7); enviar(0x0A, 3); enviar(0x0C, 1);
  for (int f = 0; f < 8; f++) enviar(f + 1, CORAZON[f]);
}

void loop() {}`,
    advertencias: ['Con el brillo al máximo y todos los LEDs encendidos consume mucho: usa brillo bajo con el USB.', 'Con ESP32 la señal de 3,3 V está en el límite de lo que el MAX7219 reconoce como HIGH: si falla, usa un conversor de nivel.', 'Para letreros con varios módulos es más cómodo usar la librería "MD_Parola".'],
    aplicaciones: ['Letrero de mensajes', 'Dado electrónico', 'Caritas y animaciones', 'Marcador de puntos'],
    porVerificar: ['Funcionamiento del MAX7219 alimentado a 5 V con lógica de 3,3 V del ESP32: depende del lote del chip.']
  });

  agregar({
    id: 'display-7seg-1', nombre: 'Display de 7 segmentos (1 dígito)', categoria: 'visualizacion',
    descripcion: 'Siete LEDs en forma de "8" (más un punto) para mostrar números del 0 al 9.',
    funcionamiento: 'Cada segmento (a, b, c, d, e, f, g) es un LED. Encendiendo algunos y otros no se forman los números. En el de cátodo común, todos los negativos están unidos a GND.',
    voltajeOperacion: '≈ 2 V por segmento', corrienteTipica: '≈ 10 mA por segmento', logica: '—',
    datos: [['Distribución (vista de frente, punto abajo a la derecha)', 'Arriba: g, f, COM, a, b · Abajo: e, d, COM, c, DP'], ['Tipos', 'Cátodo común (COM a GND) o ánodo común (COM a VCC)']],
    pines: [P('1 · e', 'digital', '—', 'Segmento inferior izquierdo'), P('2 · d', 'digital', '—', 'Segmento inferior'), P('3 · COM', 'GND', '0 V', 'Común'), P('4 · c', 'digital', '—', 'Segmento inferior derecho'), P('5 · DP', 'digital', '—', 'Punto decimal'), P('6 · b', 'digital', '—', 'Segmento superior derecho'), P('7 · a', 'digital', '—', 'Segmento superior'), P('8 · COM', 'GND', '0 V', 'Común'), P('9 · f', 'digital', '—', 'Segmento superior izquierdo'), P('10 · g', 'digital', '—', 'Segmento del medio')],
    conexionArduino: [K('a – g', 'D2 – D8', 'Cada uno con su resistencia de 220 Ω'), K('DP', 'D9', 'Con 220 Ω'), K('COM', 'GND', 'Si es cátodo común')],
    conexionESP32: [K('a, b, c, d, e, f, g', 'GPIO 32, 33, 25, 26, 27, 14, 13', 'Cada uno con 150–220 Ω'), K('COM', 'GND')],
    codigoArduino: `// Display de 7 segmentos (cátodo común): cuenta de 0 a 9
const int SEGMENTOS[7] = {2, 3, 4, 5, 6, 7, 8};   // a, b, c, d, e, f, g

// Qué segmentos encender para cada número (1 = encendido), orden abcdefg
const byte NUMEROS[10] = {
  0b1111110, 0b0110000, 0b1101101, 0b1111001, 0b0110011,
  0b1011011, 0b1011111, 0b1110000, 0b1111111, 0b1111011
};

void mostrar(int n) {
  for (int s = 0; s < 7; s++) {
    bool encender = NUMEROS[n] & (1 << (6 - s));   // lee el bit del segmento
    digitalWrite(SEGMENTOS[s], encender);
  }
}

void setup() { for (int s = 0; s < 7; s++) pinMode(SEGMENTOS[s], OUTPUT); }

void loop() {
  for (int n = 0; n <= 9; n++) { mostrar(n); delay(1000); }
}`,
    codigoESP32: `// Display de 7 segmentos con ESP32
const int SEGMENTOS[7] = {32, 33, 25, 26, 27, 14, 13};   // a..g
const byte NUMEROS[10] = { 0b1111110, 0b0110000, 0b1101101, 0b1111001, 0b0110011, 0b1011011, 0b1011111, 0b1110000, 0b1111111, 0b1111011 };

void mostrar(int n) { for (int s = 0; s < 7; s++) digitalWrite(SEGMENTOS[s], NUMEROS[n] & (1 << (6 - s))); }

void setup() { for (int s = 0; s < 7; s++) pinMode(SEGMENTOS[s], OUTPUT); }

void loop() { for (int n = 0; n <= 9; n++) { mostrar(n); delay(1000); } }`,
    advertencias: ['Una resistencia por segmento: si pones una sola en el común, los números con más segmentos brillan menos.', 'Si es de ánodo común, conecta COM a 5 V e invierte la lógica (LOW = encendido).', 'Comprueba el tipo con el multímetro en modo diodo antes de conectar.'],
    aplicaciones: ['Dado electrónico', 'Contador de personas', 'Cuenta regresiva'],
    porVerificar: ['La distribución corresponde a modelos comunes como el 5161AS / 5161BS; otros modelos pueden diferir.']
  });

  agregar({
    id: 'display-7seg-4', nombre: 'Display de 7 segmentos (4 dígitos)', categoria: 'visualizacion',
    descripcion: 'Cuatro dígitos de 7 segmentos en un solo encapsulado de 12 pines. Los segmentos están compartidos entre los dígitos.',
    funcionamiento: 'Como todos los dígitos comparten los segmentos, se enciende un dígito a la vez muy rápido (multiplexado). Si cambias de dígito cada 5 ms, el ojo ve los cuatro encendidos al mismo tiempo.',
    voltajeOperacion: '≈ 2 V por segmento', corrienteTipica: '≈ 10 mA por segmento', logica: '—',
    datos: [['Distribución común (vista de frente)', 'Arriba (12→7): D1, a, f, D2, D3, b · Abajo (1→6): e, d, DP, c, g, D4'], ['Alternativa fácil', 'El módulo TM1637 solo necesita 2 cables']],
    pines: [P('1 · e', 'digital', '—', 'Segmento'), P('2 · d', 'digital', '—', 'Segmento'), P('3 · DP', 'digital', '—', 'Punto'), P('4 · c', 'digital', '—', 'Segmento'), P('5 · g', 'digital', '—', 'Segmento'), P('6 · D4', 'digital', '—', 'Común del dígito 4'), P('7 · b', 'digital', '—', 'Segmento'), P('8 · D3', 'digital', '—', 'Común del dígito 3'), P('9 · D2', 'digital', '—', 'Común del dígito 2'), P('10 · f', 'digital', '—', 'Segmento'), P('11 · a', 'digital', '—', 'Segmento'), P('12 · D1', 'digital', '—', 'Común del dígito 1')],
    conexionArduino: [K('a – g', 'D2 – D8', 'Con resistencias de 1 kΩ (así cada dígito consume poco)'), K('D1, D2, D3, D4', 'D9, D10, D11, D12')],
    conexionESP32: [K('a – g', 'GPIO 32, 33, 25, 26, 27, 14, 13', 'Con 1 kΩ'), K('D1 – D4', 'GPIO 23, 22, 21, 19')],
    codigoArduino: `// Display de 4 dígitos (cátodo común): muestra 2026 con multiplexado
const int SEG[7] = {2, 3, 4, 5, 6, 7, 8};    // a..g
const int DIG[4] = {9, 10, 11, 12};          // D1..D4
const byte NUM[10] = { 0b1111110, 0b0110000, 0b1101101, 0b1111001, 0b0110011,
                       0b1011011, 0b1011111, 0b1110000, 0b1111111, 0b1111011 };
const int CIFRAS[4] = {2, 0, 2, 6};

void setup() {
  for (int i = 0; i < 7; i++) pinMode(SEG[i], OUTPUT);
  for (int i = 0; i < 4; i++) { pinMode(DIG[i], OUTPUT); digitalWrite(DIG[i], HIGH); }  // HIGH = dígito apagado
}

void loop() {
  for (int d = 0; d < 4; d++) {
    for (int s = 0; s < 7; s++) digitalWrite(SEG[s], NUM[CIFRAS[d]] & (1 << (6 - s)));
    digitalWrite(DIG[d], LOW);    // enciende solo este dígito
    delay(4);
    digitalWrite(DIG[d], HIGH);   // y lo apaga antes del siguiente
  }
}`,
    codigoESP32: `// Display de 4 dígitos con ESP32
const int SEG[7] = {32, 33, 25, 26, 27, 14, 13};
const int DIG[4] = {23, 22, 21, 19};
const byte NUM[10] = { 0b1111110, 0b0110000, 0b1101101, 0b1111001, 0b0110011, 0b1011011, 0b1011111, 0b1110000, 0b1111111, 0b1111011 };

void setup() {
  for (int i = 0; i < 7; i++) pinMode(SEG[i], OUTPUT);
  for (int i = 0; i < 4; i++) { pinMode(DIG[i], OUTPUT); digitalWrite(DIG[i], HIGH); }
}

void loop() {
  int valor = (millis() / 1000) % 10000;          // segundos desde el arranque
  int cifras[4] = { valor / 1000, valor / 100 % 10, valor / 10 % 10, valor % 10 };
  for (int d = 0; d < 4; d++) {
    for (int s = 0; s < 7; s++) digitalWrite(SEG[s], NUM[cifras[d]] & (1 << (6 - s)));
    digitalWrite(DIG[d], LOW); delay(4); digitalWrite(DIG[d], HIGH);
  }
}`,
    advertencias: ['Cada pin de dígito recibe la corriente de hasta 8 segmentos: con resistencias de 220 Ω supera el límite del pin. Usa 1 kΩ o transistores en los dígitos.', 'No uses delay() largos en el loop: el display se apagaría.', 'Si es de ánodo común, invierte toda la lógica.'],
    aplicaciones: ['Reloj digital', 'Cronómetro', 'Voltímetro con Arduino'],
    porVerificar: ['La distribución corresponde a modelos comunes como el 5461AS / 3461BS; verifica la tuya con el multímetro en modo diodo.']
  });

  agregar({
    id: 'led-rgb-ky016', nombre: 'LED RGB KY-016', categoria: 'visualizacion',
    descripcion: 'Un solo LED con tres colores (rojo, verde y azul). Mezclándolos con PWM se obtiene casi cualquier color.',
    funcionamiento: 'Son tres LEDs dentro de la misma cápsula. Igual que en una pantalla, sumando rojo, verde y azul en distintas cantidades se forman los demás colores: rojo + verde = amarillo, todos = blanco.',
    voltajeOperacion: '≈ 2 V (rojo) · ≈ 3 V (verde y azul)', corrienteTipica: '≈ 20 mA por color', logica: '3.3 V y 5 V',
    pines: [P('R', 'PWM', '3,3–5 V', 'Rojo'), P('G', 'PWM', '3,3–5 V', 'Verde'), P('B', 'PWM', '3,3–5 V', 'Azul'), P('−', 'GND', '0 V', 'Cátodo común')],
    conexionArduino: [K('R', 'D9', 'Con 220 Ω si el módulo no las trae'), K('G', 'D10'), K('B', 'D11'), K('−', 'GND')],
    conexionESP32: [K('R', 'GPIO 25'), K('G', 'GPIO 26'), K('B', 'GPIO 27'), K('−', 'GND')],
    codigoArduino: `// LED RGB: recorre varios colores
const int PIN_R = 9, PIN_G = 10, PIN_B = 11;   // pines con PWM

void color(int r, int g, int b) {   // cada valor de 0 a 255
  analogWrite(PIN_R, r);
  analogWrite(PIN_G, g);
  analogWrite(PIN_B, b);
}

void setup() { pinMode(PIN_R, OUTPUT); pinMode(PIN_G, OUTPUT); pinMode(PIN_B, OUTPUT); }

void loop() {
  color(255, 0, 0);   delay(700);   // rojo
  color(0, 255, 0);   delay(700);   // verde
  color(0, 0, 255);   delay(700);   // azul
  color(255, 180, 0); delay(700);   // amarillo
  color(160, 0, 255); delay(700);   // morado
}`,
    codigoESP32: `// LED RGB con ESP32 (analogWrite en el núcleo ESP32 2.x o 3.x)
const int PIN_R = 25, PIN_G = 26, PIN_B = 27;

void color(int r, int g, int b) { analogWrite(PIN_R, r); analogWrite(PIN_G, g); analogWrite(PIN_B, b); }

void setup() {}

void loop() {
  for (int i = 0; i < 256; i++) { color(i, 255 - i, 0); delay(10); }   // de verde a rojo
  for (int i = 0; i < 256; i++) { color(255 - i, 0, i); delay(10); }   // de rojo a azul
}`,
    advertencias: ['Si tu módulo no trae resistencias, pon una de 220 Ω en cada color.', 'Existen LEDs RGB de ánodo común: con ellos el pin común va a VCC y 255 = apagado.'],
    aplicaciones: ['Lámpara de ambiente', 'Indicador de temperatura por colores', 'Semáforo con un solo LED'],
    porVerificar: ['Algunos KY-016 traen resistencias limitadoras y otros no; revisa tu módulo.']
  });

  agregar({
    id: 'mp3-tf-16p', nombre: 'Reproductor MP3-TF-16P (tipo DFPlayer Mini)', categoria: 'actuador',
    descripcion: 'Módulo que reproduce archivos MP3 desde una tarjeta microSD y puede mover un parlante pequeño directamente.',
    funcionamiento: 'Tiene un chip que lee la microSD y decodifica el MP3, y un pequeño amplificador de 3 W. La placa le da órdenes por el puerto serie: "reproduce la pista 1", "sube el volumen".',
    voltajeOperacion: '3,2 V a 5 V', corrienteTipica: '≈ 20 mA en reposo · hasta varios cientos de mA con el parlante a todo volumen', logica: '3.3 V',
    datos: [['Velocidad serie', '9600 baudios'], ['microSD', 'Hasta 32 GB, formato FAT32'], ['Archivos', 'Carpeta "mp3" con nombres 0001.mp3, 0002.mp3…'], ['Parlante', '3 W máx., 4 u 8 Ω']],
    pines: [P('1 · VCC', 'alimentación', '3,2–5 V', 'Alimentación'), P('2 · RX', 'UART', '3,3 V', 'Recibe órdenes (resistencia de 1 kΩ en serie con 5 V)'), P('3 · TX', 'UART', '3,3 V', 'Envía respuestas'), P('4 · DAC_R / 5 · DAC_L', 'otro', '—', 'Salida de audio para amplificador o audífonos'), P('6 · SPK_1 / 8 · SPK_2', 'otro', '—', 'Parlante directo'), P('7 · GND / 10 · GND', 'GND', '0 V', 'Tierra'), P('16 · BUSY', 'digital', '3,3 V', 'LOW mientras reproduce'), P('IO1, IO2, ADKEY1, ADKEY2', 'otro', '—', 'Botones sin placa (opcional)')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('TX', 'D10'), K('RX', 'D11', 'Con resistencia de 1 kΩ en serie'), K('SPK_1 / SPK_2', 'Parlante de 8 Ω')],
    conexionESP32: [K('VCC', 'VIN (5 V)'), K('GND', 'GND'), K('TX', 'GPIO 16 (RX2)'), K('RX', 'GPIO 17 (TX2)'), K('SPK_1 / SPK_2', 'Parlante')],
    codigoArduino: `// MP3-TF-16P: reproduce la pista 1 de la microSD
// Librería: "DFRobotDFPlayerMini"
#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>

SoftwareSerial mp3Serial(10, 11);   // RX (al TX del módulo), TX (al RX con 1 kΩ)
DFRobotDFPlayerMini mp3;

void setup() {
  Serial.begin(9600);
  mp3Serial.begin(9600);
  if (!mp3.begin(mp3Serial)) {
    Serial.println("No encuentro el módulo o la microSD");
    while (true) {}
  }
  mp3.volume(20);   // de 0 a 30
  mp3.play(1);      // pista 0001.mp3
}

void loop() {}`,
    codigoESP32: `// MP3-TF-16P con ESP32 (UART2)
#include <DFRobotDFPlayerMini.h>

DFRobotDFPlayerMini mp3;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  if (!mp3.begin(Serial2)) { Serial.println("Módulo no encontrado"); while (true) delay(10); }
  mp3.volume(20);
  mp3.play(1);
}

void loop() {}`,
    advertencias: ['La resistencia de 1 kΩ en RX elimina el zumbido y protege el módulo con el UNO.', 'Formatea la microSD en FAT32 y copia los archivos en orden: el módulo los numera por orden de copia.', 'Con el parlante a todo volumen puede reiniciar la placa: usa una fuente externa.'],
    aplicaciones: ['Timbre escolar con música', 'Guía de voz para un proyecto', 'Alarma que dice mensajes', 'Caja musical']
  });

  agregar({
    id: 'rtc-ds1302', nombre: 'RTC DS1302 · reloj de tiempo real', categoria: 'comunicacion',
    descripcion: 'Reloj que guarda la fecha y la hora aunque la placa se apague, gracias a una pila de botón.',
    funcionamiento: 'Tiene un cristal de cuarzo que vibra exactamente 32 768 veces por segundo; el chip cuenta esas vibraciones para avanzar los segundos. Se comunica por 3 cables (CLK, DAT y RST).',
    voltajeOperacion: '2 V a 5,5 V', corrienteTipica: '≈ 0,3 mA funcionando · menos de 1 µA con la pila', logica: '3.3 V y 5 V',
    datos: [['Precisión', 'Depende del cristal: puede atrasarse o adelantarse varios segundos al día'], ['Memoria extra', '31 bytes de RAM'], ['Pila', 'CR2032']],
    pines: [P('VCC', 'alimentación', '2–5,5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra'), P('CLK', 'digital', 'VCC', 'Reloj de la comunicación'), P('DAT', 'digital', 'VCC', 'Datos'), P('RST (CE)', 'digital', 'VCC', 'Habilitación de la comunicación')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('CLK', 'D6'), K('DAT', 'D7'), K('RST', 'D8')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('CLK', 'GPIO 25'), K('DAT', 'GPIO 26'), K('RST', 'GPIO 27')],
    codigoArduino: `// DS1302: pone la hora de la compilación y la muestra cada segundo
// Librería: "Rtc by Makuna"
#include <ThreeWire.h>
#include <RtcDS1302.h>

ThreeWire cables(7, 6, 8);          // DAT, CLK, RST
RtcDS1302<ThreeWire> reloj(cables);

void setup() {
  Serial.begin(9600);
  reloj.Begin();
  reloj.SetIsWriteProtected(false);
  reloj.SetIsRunning(true);
  RtcDateTime compilado(__DATE__, __TIME__);
  if (!reloj.IsDateTimeValid() || reloj.GetDateTime() < compilado) reloj.SetDateTime(compilado);
}

void loop() {
  RtcDateTime ahora = reloj.GetDateTime();
  char texto[20];
  snprintf(texto, sizeof(texto), "%02u/%02u/%04u %02u:%02u:%02u",
           ahora.Day(), ahora.Month(), ahora.Year(), ahora.Hour(), ahora.Minute(), ahora.Second());
  Serial.println(texto);
  delay(1000);
}`,
    codigoESP32: `// DS1302 con ESP32
#include <ThreeWire.h>
#include <RtcDS1302.h>

ThreeWire cables(26, 25, 27);       // DAT, CLK, RST
RtcDS1302<ThreeWire> reloj(cables);

void setup() {
  Serial.begin(115200);
  reloj.Begin();
  reloj.SetIsWriteProtected(false);
  reloj.SetIsRunning(true);
  RtcDateTime compilado(__DATE__, __TIME__);
  if (!reloj.IsDateTimeValid()) reloj.SetDateTime(compilado);
}

void loop() {
  RtcDateTime t = reloj.GetDateTime();
  Serial.printf("%02u:%02u:%02u\\n", t.Hour(), t.Minute(), t.Second());
  delay(1000);
}`,
    advertencias: ['Es menos preciso que el DS3231: para relojes que deben ir exactos, prefiere el DS3231.', 'Si la hora vuelve a 2000 al desconectar, revisa la pila CR2032.'],
    aplicaciones: ['Horario de timbres del colegio', 'Registro de datos con fecha y hora', 'Encender luces a una hora fija']
  });

  agregar({
    id: 'rtc-ds3231', nombre: 'RTC DS3231 · reloj de precisión', categoria: 'comunicacion',
    descripcion: 'Reloj de tiempo real muy preciso por I2C, con pila de respaldo y termómetro interno.',
    funcionamiento: 'Su cristal está dentro del chip y un termómetro corrige la frecuencia cuando cambia la temperatura (por eso se llama "TCXO"). Así casi no se atrasa: unos pocos minutos al año.',
    voltajeOperacion: '2,3 V a 5,5 V', corrienteTipica: '≈ 0,2 mA', logica: '3.3 V y 5 V',
    datos: [['Precisión', '± 2 ppm (≈ 1 minuto al año)'], ['Dirección I2C', '0x68 (la memoria AT24C32 del módulo está en 0x57)'], ['Extra', 'Termómetro interno (± 3 °C) y 2 alarmas']],
    pines: [P('32K', 'digital', '—', 'Salida de 32 kHz (opcional)'), P('SQW', 'digital', '—', 'Onda cuadrada o alarma (opcional)'), P('SCL', 'I2C', 'VCC', 'Reloj I2C'), P('SDA', 'I2C', 'VCC', 'Datos I2C'), P('VCC', 'alimentación', '3,3–5 V', 'Alimentación'), P('GND', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('VCC', '5V'), K('GND', 'GND'), K('SDA', 'A4'), K('SCL', 'A5')],
    conexionESP32: [K('VCC', '3V3'), K('GND', 'GND'), K('SDA', 'GPIO 21'), K('SCL', 'GPIO 22')],
    codigoArduino: `// DS3231: fecha, hora y temperatura
// Librería: "RTClib" de Adafruit
#include <RTClib.h>

RTC_DS3231 reloj;

void setup() {
  Serial.begin(9600);
  if (!reloj.begin()) { Serial.println("No encuentro el DS3231"); while (true) {} }
  if (reloj.lostPower()) reloj.adjust(DateTime(F(__DATE__), F(__TIME__)));   // pone la hora de la PC
}

void loop() {
  DateTime t = reloj.now();
  Serial.print(t.day()); Serial.print('/'); Serial.print(t.month()); Serial.print('/'); Serial.print(t.year());
  Serial.print("  "); Serial.print(t.hour()); Serial.print(':'); Serial.print(t.minute()); Serial.print(':'); Serial.print(t.second());
  Serial.print("  "); Serial.print(reloj.getTemperature()); Serial.println(" °C");
  delay(1000);
}`,
    codigoESP32: `// DS3231 con ESP32 (SDA 21, SCL 22)
#include <RTClib.h>

RTC_DS3231 reloj;

void setup() {
  Serial.begin(115200);
  if (!reloj.begin()) { Serial.println("DS3231 no encontrado"); while (true) delay(10); }
  if (reloj.lostPower()) reloj.adjust(DateTime(F(__DATE__), F(__TIME__)));
}

void loop() {
  DateTime t = reloj.now();
  Serial.printf("%02d:%02d:%02d  %.1f °C\\n", t.hour(), t.minute(), t.second(), reloj.getTemperature());
  delay(1000);
}`,
    advertencias: ['Muchos módulos (ZS-042) intentan cargar la pila: si usas una CR2032 normal (no recargable), retira el diodo o la resistencia de carga para evitar que se hinche.', 'La hora se toma de la computadora al compilar: queda unos segundos atrasada.'],
    aplicaciones: ['Reloj despertador', 'Sistema de timbres por horario', 'Registro de temperatura con hora exacta']
  });

  agregar({
    id: 'conversor-nivel', nombre: 'Conversor de nivel lógico (4 canales)', categoria: 'alimentacion',
    descripcion: 'Pequeño módulo que traduce señales entre 3,3 V y 5 V en ambos sentidos. Indispensable para unir módulos de 5 V con el ESP32.',
    funcionamiento: 'Cada canal tiene un transistor MOSFET (BSS138) y dos resistencias. Cuando un lado pone LOW, el transistor también baja el otro lado; cuando está en HIGH, cada lado sube a su propio voltaje. Es como un traductor entre dos personas que hablan idiomas distintos.',
    voltajeOperacion: 'LV: 1,8 a 3,3 V · HV: hasta 5 V', corrienteTipica: 'Mínima (solo las resistencias de 10 kΩ)', logica: '3.3 V y 5 V',
    datos: [['Velocidad', 'Bien para I2C, UART y SPI lento (hasta ≈ 400 kHz con seguridad)'], ['Canales', '4 bidireccionales']],
    pines: [P('HV', 'alimentación', '5 V', 'Voltaje del lado alto'), P('LV', 'alimentación', '3,3 V', 'Voltaje del lado bajo'), P('GND (x2)', 'GND', '0 V', 'Tierra común'), P('HV1–HV4', 'digital', '5 V', 'Señales del lado de 5 V'), P('LV1–LV4', 'digital', '3,3 V', 'Señales del lado de 3,3 V')],
    conexionArduino: [K('HV', '5V del UNO'), K('LV', '3.3V del UNO'), K('GND', 'GND'), K('HV1 / HV2', 'A4 (SDA) / A5 (SCL)'), K('LV1 / LV2', 'SDA / SCL de un módulo de 3,3 V (ej. BMP280)')],
    conexionESP32: [K('HV', 'VIN (5 V)'), K('LV', '3V3'), K('GND', 'GND'), K('LV1 / LV2', 'GPIO 21 (SDA) / GPIO 22 (SCL)'), K('HV1 / HV2', 'SDA / SCL de un módulo de 5 V (ej. LCD I2C)')],
    codigoArduino: `// Escáner I2C: comprueba que el conversor deja pasar la comunicación
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Serial.println("Buscando dispositivos I2C...");
  for (byte direccion = 1; direccion < 127; direccion++) {
    Wire.beginTransmission(direccion);
    if (Wire.endTransmission() == 0) {
      Serial.print("Encontrado en 0x");
      Serial.println(direccion, HEX);
    }
  }
  Serial.println("Listo.");
}

void loop() {}`,
    codigoESP32: `// Escáner I2C con ESP32 (SDA 21, SCL 22)
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  for (byte d = 1; d < 127; d++) {
    Wire.beginTransmission(d);
    if (Wire.endTransmission() == 0) Serial.printf("Encontrado en 0x%02X\\n", d);
  }
  Serial.println("Listo.");
}

void loop() {}`,
    advertencias: ['Conecta siempre HV, LV y GND: sin alimentación en los dos lados no traduce.', 'No sirve para mover cargas (LEDs potentes, motores): solo para señales.', 'Para señales muy rápidas (pantallas SPI a muchos MHz) usa un chip como el 74LVC245.'],
    aplicaciones: ['Conectar una LCD I2C de 5 V al ESP32', 'Leer el HC-SR04 con ESP32', 'Usar un BMP280 de 3,3 V con el UNO']
  });

  agregar({
    id: 'teclado-4x4', nombre: 'Teclado matricial 4x4', categoria: 'basico',
    descripcion: 'Teclado de membrana con 16 teclas (0–9, A–D, * y #). Usa solo 8 pines gracias a su conexión en matriz.',
    funcionamiento: 'Las teclas están en una cuadrícula de 4 filas y 4 columnas. La placa activa una fila a la vez y revisa qué columna responde: así sabe exactamente qué tecla presionaste, como buscar un asiento por fila y columna en el cine.',
    voltajeOperacion: '3,3 V o 5 V (es solo un conjunto de interruptores)', corrienteTipica: 'Casi nula', logica: '3.3 V y 5 V',
    pines: [P('R1–R4', 'digital', '—', 'Filas (los 4 primeros cables)'), P('C1–C4', 'digital', '—', 'Columnas (los 4 últimos cables)')],
    conexionArduino: [K('R1, R2, R3, R4', 'D9, D8, D7, D6'), K('C1, C2, C3, C4', 'D5, D4, D3, D2')],
    conexionESP32: [K('R1, R2, R3, R4', 'GPIO 32, 33, 25, 26'), K('C1, C2, C3, C4', 'GPIO 27, 14, 16, 17')],
    codigoArduino: `// Teclado 4x4: muestra la tecla presionada
// Librería: "Keypad" de Mark Stanley
#include <Keypad.h>

const byte FILAS = 4, COLUMNAS = 4;
char teclas[FILAS][COLUMNAS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte pinesFilas[FILAS] = {9, 8, 7, 6};
byte pinesColumnas[COLUMNAS] = {5, 4, 3, 2};
Keypad teclado = Keypad(makeKeymap(teclas), pinesFilas, pinesColumnas, FILAS, COLUMNAS);

void setup() { Serial.begin(9600); }

void loop() {
  char tecla = teclado.getKey();
  if (tecla) { Serial.print("Tecla: "); Serial.println(tecla); }
}`,
    codigoESP32: `// Teclado 4x4 con ESP32
#include <Keypad.h>

const byte FILAS = 4, COLUMNAS = 4;
char teclas[FILAS][COLUMNAS] = { {'1','2','3','A'}, {'4','5','6','B'}, {'7','8','9','C'}, {'*','0','#','D'} };
byte pinesFilas[FILAS] = {32, 33, 25, 26};
byte pinesColumnas[COLUMNAS] = {27, 14, 16, 17};
Keypad teclado = Keypad(makeKeymap(teclas), pinesFilas, pinesColumnas, FILAS, COLUMNAS);

void setup() { Serial.begin(115200); }

void loop() {
  char tecla = teclado.getKey();
  if (tecla) Serial.printf("Tecla: %c\\n", tecla);
}`,
    advertencias: ['Si las teclas salen cambiadas, revisa el orden de los cables o la tabla de teclas.', 'No uses D0 y D1 en el UNO: interfieren con la carga del programa.'],
    aplicaciones: ['Cerradura con clave', 'Calculadora', 'Menú de opciones para un proyecto']
  });

  agregar({
    id: 'laser-ky008', nombre: 'Láser KY-008', categoria: 'actuador',
    descripcion: 'Módulo con un diodo láser rojo de 650 nm y baja potencia, que se enciende con un pin digital.',
    funcionamiento: 'Un diodo láser produce luz de un solo color con todos los rayos "marchando al paso", por eso el haz casi no se abre y forma un punto pequeño incluso a varios metros.',
    voltajeOperacion: '5 V', corrienteTipica: '≈ 30–40 mA', logica: '3.3 V y 5 V',
    pines: [P('S', 'digital', '3,3–5 V', 'Señal: HIGH = encendido'), P('Centro', 'otro', '—', 'Según el módulo: +5 V o sin conexión'), P('−', 'GND', '0 V', 'Tierra')],
    conexionArduino: [K('S', 'D7'), K('−', 'GND')],
    conexionESP32: [K('S', 'GPIO 26'), K('−', 'GND')],
    codigoArduino: `// Láser KY-008: pulsos cortos
const int PIN_LASER = 7;

void setup() { pinMode(PIN_LASER, OUTPUT); }

void loop() {
  digitalWrite(PIN_LASER, HIGH); delay(200);
  digitalWrite(PIN_LASER, LOW);  delay(800);
}`,
    codigoESP32: `// Láser KY-008 con ESP32
const int PIN_LASER = 26;

void setup() { pinMode(PIN_LASER, OUTPUT); }

void loop() {
  digitalWrite(PIN_LASER, HIGH); delay(200);
  digitalWrite(PIN_LASER, LOW);  delay(800);
}`,
    advertencias: ['NUNCA apuntes el láser a los ojos de nadie (ni a espejos o vidrios): puede causar daño permanente.', 'Úsalo siempre con supervisión del docente.'],
    aplicaciones: ['Barrera láser con una LDR (alarma)', 'Puntero para un brazo robótico', 'Experimentos de óptica: reflexión y refracción'],
    porVerificar: ['La función del pin central varía entre fabricantes.']
  });

  agregar({
    id: 'buzzer', nombre: 'Buzzer (activo y pasivo)', categoria: 'actuador',
    descripcion: 'Pequeño parlante que emite sonidos. El ACTIVO suena solo con darle voltaje; el PASIVO necesita una señal para tocar notas.',
    funcionamiento: 'Tiene una lámina que vibra con la electricidad. El activo trae un oscilador dentro (siempre la misma nota). El pasivo vibra a la frecuencia que le envíes: 440 Hz es la nota La.',
    voltajeOperacion: '3,3 V a 5 V', corrienteTipica: '≈ 20–30 mA', logica: '3.3 V y 5 V',
    datos: [['Cómo distinguirlos', 'El activo suele tener la parte de abajo sellada y una pegatina; el pasivo deja ver la placa verde'], ['Prueba rápida', 'Con 5 V fijos: el activo suena, el pasivo solo hace "clic"']],
    pines: [P('+', 'digital', '3,3–5 V', 'Positivo (pata larga)'), P('−', 'GND', '0 V', 'Negativo')],
    conexionArduino: [K('+', 'D8'), K('−', 'GND')],
    conexionESP32: [K('+', 'GPIO 25'), K('−', 'GND')],
    codigoArduino: `// Buzzer PASIVO: toca una pequeña melodía
const int PIN_BUZZER = 8;
const int NOTAS[] = {262, 294, 330, 349, 392, 440, 494, 523};   // Do Re Mi Fa Sol La Si Do

void setup() {
  for (int i = 0; i < 8; i++) {
    tone(PIN_BUZZER, NOTAS[i], 250);   // pin, frecuencia (Hz), duración (ms)
    delay(300);
  }
}

void loop() {}
// Con un buzzer ACTIVO basta: digitalWrite(PIN_BUZZER, HIGH);`,
    codigoESP32: `// Buzzer pasivo con ESP32 (tone() funciona en el núcleo ESP32 2.x o 3.x)
const int PIN_BUZZER = 25;

void setup() {
  tone(PIN_BUZZER, 440, 500);   // La durante medio segundo
  delay(600);
  tone(PIN_BUZZER, 880, 500);   // La una octava más arriba
}

void loop() {}`,
    advertencias: ['El buzzer pasivo conectado a un voltaje fijo no suena: necesita tone().', 'Si consume más de 30 mA, contrólalo con un transistor.'],
    aplicaciones: ['Alarma', 'Timbre con melodía', 'Aviso sonoro de un sensor', 'Piano con pulsadores']
  });

  /* =====================================================================
     5. CIRCUITOS INTEGRADOS LÓGICOS
     ===================================================================== */

  /* Convierte la lista de nombres de pines del chip (en orden 1, 2, 3…) en pines con tipo.
     "descripciones" explica el significado de cada nombre. */
  function pinesDeChip(nombres, descripciones) {
    return nombres.map((n, i) => {
      const tipo = n === 'VCC' || n === 'VDD' ? 'alimentación' : n === 'GND' || n === 'VSS' ? 'GND' : 'digital';
      return P((i + 1) + ' · ' + n, tipo, tipo === 'GND' ? '0 V' : 'VCC', descripciones[n] || descripciones[n.replace(/^\d/, '')] || '');
    });
  }

  const DESC_COMPUERTA = { A: 'Entrada A de la compuerta', B: 'Entrada B de la compuerta', Y: 'Salida de la compuerta', VCC: 'Alimentación +5 V', GND: 'Tierra' };

  const AVISOS_74LS = [
    'Los chips 74LS funcionan con 5 V (de 4,75 a 5,25 V): no los alimentes con 9 V.',
    'Pon un capacitor de 100 nF entre VCC y GND, cerca del chip, para evitar fallas raras.',
    'Las entradas que no uses van a GND o a VCC: una entrada "al aire" en la familia LS se comporta como HIGH, pero puede captar ruido.',
    'La muesca o el punto marcan el pin 1. Los pines se cuentan en sentido contrario a las agujas del reloj, vistos desde arriba.'
  ];

  const AVISO_LS_ESP32 = 'Con ESP32: las salidas del ESP32 (3,3 V) sí se reconocen como HIGH en un 74LS, pero la salida del 74LS puede pasar de 3,3 V. Léela a través del conversor de nivel lógico, o usa la versión 74HC del chip alimentada con 3,3 V.';

  /* Programa de prueba que recorre todas las combinaciones de entrada y muestra la tabla de verdad */
  function codigoPruebaCompuerta(chip, nombreCompuerta, pinesChip, esNot, esESP32) {
    const pA = esESP32 ? 25 : 2, pB = esESP32 ? 26 : 3, pY = esESP32 ? 27 : 4, baud = esESP32 ? 115200 : 9600;
    if (esNot) {
      return `// Prueba de la compuerta ${nombreCompuerta} del ${chip}
// Pin ${pinesChip[0]} del chip (entrada A) → pin ${pA} de la placa
// Pin ${pinesChip[1]} del chip (salida Y)  → pin ${pY} de la placa${esESP32 ? ' (a través del conversor de nivel)' : ''}
const int PIN_A = ${pA}, PIN_Y = ${pY};

void setup() {
  Serial.begin(${baud});
  pinMode(PIN_A, OUTPUT);
  pinMode(PIN_Y, INPUT);
  Serial.println("A | Y");
  for (int a = 0; a <= 1; a++) {
    digitalWrite(PIN_A, a);
    delay(5);                       // el chip responde en nanosegundos; esto es de sobra
    Serial.print(a); Serial.print(" | ");
    Serial.println(digitalRead(PIN_Y));
  }
}

void loop() {}`;
    }
    return `// Prueba de la compuerta ${nombreCompuerta} del ${chip}: imprime su tabla de verdad
// Pin ${pinesChip[0]} (entrada A) → pin ${pA} · pin ${pinesChip[1]} (entrada B) → pin ${pB}
// Pin ${pinesChip[2]} (salida Y)  → pin ${pY}${esESP32 ? ' (a través del conversor de nivel)' : ''}
const int PIN_A = ${pA}, PIN_B = ${pB}, PIN_Y = ${pY};

void setup() {
  Serial.begin(${baud});
  pinMode(PIN_A, OUTPUT);
  pinMode(PIN_B, OUTPUT);
  pinMode(PIN_Y, INPUT);
  Serial.println("A B | Y");
  for (int a = 0; a <= 1; a++) {
    for (int b = 0; b <= 1; b++) {
      digitalWrite(PIN_A, a);
      digitalWrite(PIN_B, b);
      delay(5);
      Serial.print(a); Serial.print(" "); Serial.print(b); Serial.print(" | ");
      Serial.println(digitalRead(PIN_Y));
    }
  }
}

void loop() {}`;
  }

  /* Fábrica de chips de compuertas de 14 pines */
  function chipCompuertas(o) {
    const primera = o.compuertas[0];
    const pinesPrueba = primera.entradas.concat([primera.salida]);
    const esNot = primera.entradas.length === 1;
    agregar({
      id: o.id, nombre: o.nombre, categoria: 'ci',
      descripcion: o.descripcion, funcionamiento: o.funcionamiento,
      voltajeOperacion: '5 V (4,75 a 5,25 V)', corrienteTipica: o.corriente || '≈ 1 a 6 mA el chip completo · salida: hasta 8 mA en LOW', logica: '5 V',
      datos: [['Familia', 'TTL Schottky de baja potencia (74LS)'], ['Encapsulado', 'DIP-14'], ['Compuertas', o.cantidad], ['Equivalente CMOS', o.equivalente]],
      pines: pinesDeChip(o.nombresPines, DESC_COMPUERTA),
      compuertas: o.compuertas.map(c => ({ tipo: o.tipo, entradas: c.entradas, salida: c.salida })),
      tablaVerdad: o.tablaVerdad,
      conexionArduino: [K('Pin 14 (VCC)', '5V'), K('Pin 7 (GND)', 'GND')].concat(
        esNot ? [K('Pin ' + pinesPrueba[0] + ' (1A)', 'D2'), K('Pin ' + pinesPrueba[1] + ' (1Y)', 'D4', 'Opcional: también un LED con 330 Ω a GND')]
              : [K('Pin ' + pinesPrueba[0] + ' (1A)', 'D2'), K('Pin ' + pinesPrueba[1] + ' (1B)', 'D3'), K('Pin ' + pinesPrueba[2] + ' (1Y)', 'D4', 'Opcional: también un LED con 330 Ω a GND')]),
      conexionESP32: [K('Pin 14 (VCC)', 'VIN (5 V)'), K('Pin 7 (GND)', 'GND')].concat(
        esNot ? [K('Pin ' + pinesPrueba[0] + ' (1A)', 'GPIO 25'), K('Pin ' + pinesPrueba[1] + ' (1Y)', 'GPIO 27', 'A través del conversor de nivel (lado HV → lado LV)')]
              : [K('Pin ' + pinesPrueba[0] + ' (1A)', 'GPIO 25'), K('Pin ' + pinesPrueba[1] + ' (1B)', 'GPIO 26'), K('Pin ' + pinesPrueba[2] + ' (1Y)', 'GPIO 27', 'A través del conversor de nivel (lado HV → lado LV)')]),
      codigoArduino: codigoPruebaCompuerta(o.chip, o.tipo, pinesPrueba, esNot, false),
      codigoESP32: codigoPruebaCompuerta(o.chip, o.tipo, pinesPrueba, esNot, true),
      advertencias: AVISOS_74LS.concat([AVISO_LS_ESP32]),
      aplicaciones: o.aplicaciones
    });
  }

  // Distribución de pines de los chips de 4 compuertas de 2 entradas (00, 08, 32, 86)
  const PINES_QUAD = ['1A', '1B', '1Y', '2A', '2B', '2Y', 'GND', '3Y', '3A', '3B', '4Y', '4A', '4B', 'VCC'];
  const COMP_QUAD = [{ entradas: [1, 2], salida: 3 }, { entradas: [4, 5], salida: 6 }, { entradas: [9, 10], salida: 8 }, { entradas: [12, 13], salida: 11 }];
  const TABLA_2 = (f) => ({ columnas: ['A', 'B', 'Y'], salidas: 1, filas: [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => [a, b, f(a, b)]) });

  chipCompuertas({
    id: '74ls00', chip: '74LS00', nombre: '74LS00 · 4 compuertas NAND', tipo: 'NAND', cantidad: '4 NAND de 2 entradas', equivalente: '74HC00',
    descripcion: 'Cuatro compuertas NAND (Y NEGADA) en un chip. La NAND es "universal": con ella sola se puede construir cualquier otra compuerta.',
    funcionamiento: 'La salida es 0 solo cuando las DOS entradas son 1; en cualquier otro caso es 1. Es como una alarma que se apaga únicamente si la puerta Y la ventana están cerradas.',
    nombresPines: PINES_QUAD, compuertas: COMP_QUAD, tablaVerdad: TABLA_2((a, b) => (a & b) ? 0 : 1),
    aplicaciones: ['Construir NOT, AND y OR solo con NAND', 'Latch SR (memoria de 1 bit)', 'Oscilador sencillo con capacitor']
  });

  chipCompuertas({
    id: '74ls02', chip: '74LS02', nombre: '74LS02 · 4 compuertas NOR', tipo: 'NOR', cantidad: '4 NOR de 2 entradas', equivalente: '74HC02',
    descripcion: 'Cuatro compuertas NOR (O NEGADA). Ojo: su distribución de pines es distinta a la del 74LS00 (las salidas van primero).',
    funcionamiento: 'La salida es 1 solo cuando las DOS entradas son 0. Basta que una entrada sea 1 para que la salida sea 0. Es como una luz de "aula vacía" que se apaga si entra cualquier persona.',
    nombresPines: ['1Y', '1A', '1B', '2Y', '2A', '2B', 'GND', '3A', '3B', '3Y', '4A', '4B', '4Y', 'VCC'],
    compuertas: [{ entradas: [2, 3], salida: 1 }, { entradas: [5, 6], salida: 4 }, { entradas: [8, 9], salida: 10 }, { entradas: [11, 12], salida: 13 }],
    tablaVerdad: TABLA_2((a, b) => (a | b) ? 0 : 1),
    aplicaciones: ['Latch SR con NOR', 'Detector de "ninguna entrada activa"', 'También es universal: arma cualquier compuerta']
  });

  chipCompuertas({
    id: '74ls04', chip: '74LS04', nombre: '74LS04 · 6 inversores NOT', tipo: 'NOT', cantidad: '6 NOT (inversores)', equivalente: '74HC04',
    descripcion: 'Seis compuertas NOT. Cada una invierte su entrada: lo que entra como 1 sale como 0, y al revés.',
    funcionamiento: 'Es la compuerta más simple: dice siempre lo contrario. Como un niño que juega a "lo opuesto": si le dices "sí", responde "no".',
    corriente: '≈ 2 a 7 mA el chip completo',
    nombresPines: ['1A', '1Y', '2A', '2Y', '3A', '3Y', 'GND', '4Y', '4A', '5Y', '5A', '6Y', '6A', 'VCC'],
    compuertas: [{ entradas: [1], salida: 2 }, { entradas: [3], salida: 4 }, { entradas: [5], salida: 6 }, { entradas: [9], salida: 8 }, { entradas: [11], salida: 10 }, { entradas: [13], salida: 12 }],
    tablaVerdad: { columnas: ['A', 'Y'], salidas: 1, filas: [[0, 1], [1, 0]] },
    aplicaciones: ['Invertir la señal de un sensor', 'Oscilador en anillo (3 inversores)', 'Convertir un botón activo en LOW en activo en HIGH']
  });

  chipCompuertas({
    id: '74ls08', chip: '74LS08', nombre: '74LS08 · 4 compuertas AND', tipo: 'AND', cantidad: '4 AND de 2 entradas', equivalente: '74HC08',
    descripcion: 'Cuatro compuertas AND (Y). La salida se activa solo si todas las entradas están activas.',
    funcionamiento: 'La salida es 1 únicamente cuando A Y B son 1. Es como una máquina que solo arranca si presionas dos botones a la vez (por seguridad, para que ambas manos estén fuera).',
    nombresPines: PINES_QUAD, compuertas: COMP_QUAD, tablaVerdad: TABLA_2((a, b) => a & b),
    aplicaciones: ['Arranque de seguridad con dos botones', 'Habilitar una señal solo si se cumple una condición', 'Sumador binario (junto con XOR)']
  });

  chipCompuertas({
    id: '74ls32', chip: '74LS32', nombre: '74LS32 · 4 compuertas OR', tipo: 'OR', cantidad: '4 OR de 2 entradas', equivalente: '74HC32',
    descripcion: 'Cuatro compuertas OR (O). La salida se activa si al menos una entrada está activa.',
    funcionamiento: 'La salida es 1 cuando A O B (o las dos) son 1. Es como el timbre de un bus: suena si cualquier pasajero presiona su botón.',
    nombresPines: PINES_QUAD, compuertas: COMP_QUAD, tablaVerdad: TABLA_2((a, b) => a | b),
    aplicaciones: ['Alarma con varios sensores', 'Encender una luz desde dos interruptores distintos', 'Unir señales de varios botones']
  });

  chipCompuertas({
    id: '74ls86', chip: '74LS86', nombre: '74LS86 · 4 compuertas XOR', tipo: 'XOR', cantidad: '4 XOR de 2 entradas', equivalente: '74HC86',
    descripcion: 'Cuatro compuertas XOR (O EXCLUSIVA). La salida se activa cuando las entradas son DIFERENTES.',
    funcionamiento: 'La salida es 1 si una entrada es 1 y la otra 0, pero no si ambas son iguales. Es como la luz de una escalera con dos interruptores: cambiar cualquiera de los dos la enciende o apaga.',
    nombresPines: PINES_QUAD, compuertas: COMP_QUAD, tablaVerdad: TABLA_2((a, b) => a ^ b),
    aplicaciones: ['Interruptor de escalera (conmutado)', 'Sumador binario (semisumador)', 'Comparador de bits: ¿son iguales?', 'Detector de paridad']
  });

  agregar({
    id: '74ls47', nombre: '74LS47 · decodificador BCD a 7 segmentos', categoria: 'ci',
    descripcion: 'Convierte un número binario de 4 bits (0 a 9) en las señales para encender un display de 7 segmentos de ÁNODO COMÚN.',
    funcionamiento: 'Recibe el número en binario por las entradas A, B, C y D (A es el bit de menor peso) y, con compuertas internas, decide qué segmentos encender. Sus salidas son activas en LOW: un 0 enciende el segmento.',
    voltajeOperacion: '5 V (4,75 a 5,25 V)', corrienteTipica: '≈ 7 a 13 mA el chip · cada salida soporta hasta 24 mA en LOW', logica: '5 V',
    datos: [['Encapsulado', 'DIP-16'], ['Display', 'ÁNODO común (para cátodo común se usa el 74LS48 o el CD4511)'], ['Salidas', 'Colector abierto, activas en LOW'], ['Detalle', 'El 6 y el 9 se muestran "sin colita" (sin el segmento a en el 6 y sin el d en el 9)']],
    pines: pinesDeChip(['B', 'C', 'LT', 'BI/RBO', 'RBI', 'D', 'A', 'GND', 'e', 'd', 'c', 'b', 'a', 'g', 'f', 'VCC'], {
      A: 'Entrada BCD, bit de peso 1', B: 'Entrada BCD, bit de peso 2', C: 'Entrada BCD, bit de peso 4', D: 'Entrada BCD, bit de peso 8',
      LT: 'Prueba de lámpara: en LOW enciende todos los segmentos', 'BI/RBO': 'Apagado (en LOW apaga todo) / salida de supresión de ceros',
      RBI: 'Supresión de ceros a la izquierda (normalmente a HIGH)', a: 'Salida segmento a (activa en LOW)', b: 'Salida segmento b', c: 'Salida segmento c',
      d: 'Salida segmento d', e: 'Salida segmento e', f: 'Salida segmento f', g: 'Salida segmento g', VCC: 'Alimentación +5 V', GND: 'Tierra'
    }),
    bloque: 'Decodificador BCD → 7 segmentos',
    tablaVerdad: {
      columnas: ['D', 'C', 'B', 'A', 'a', 'b', 'c', 'd', 'e', 'f', 'g'], salidas: 7,
      nota: '0 = segmento ENCENDIDO (salidas activas en LOW). LT, BI/RBO y RBI en HIGH.',
      filas: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1], [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0], [0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0], [0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]
      ]
    },
    conexionArduino: [K('Pin 16 (VCC) y pines 3, 4, 5 (LT, BI, RBI)', '5V'), K('Pin 8 (GND)', 'GND'), K('A, B, C, D (pines 7, 1, 2, 6)', 'D2, D3, D4, D5'), K('Salidas a–g', 'Segmentos del display de ánodo común', 'Cada una con resistencia de 330 Ω; el común del display a 5 V')],
    conexionESP32: [K('Pin 16 (VCC) y pines 3, 4, 5', 'VIN (5 V)'), K('Pin 8 (GND)', 'GND'), K('A, B, C, D', 'GPIO 25, 26, 27, 14', 'Directo: 3,3 V es HIGH para el 74LS47 y el ESP32 no lee nada del chip'), K('Salidas a–g', 'Display de ánodo común con 330 Ω')],
    codigoArduino: `// 74LS47: cuenta de 0 a 9 enviando el número en binario
const int PINES_BCD[4] = {2, 3, 4, 5};   // A (peso 1), B (2), C (4), D (8)

void mostrarNumero(int n) {
  for (int bit = 0; bit < 4; bit++) {
    digitalWrite(PINES_BCD[bit], (n >> bit) & 1);   // saca cada bit del número
  }
}

void setup() { for (int i = 0; i < 4; i++) pinMode(PINES_BCD[i], OUTPUT); }

void loop() {
  for (int n = 0; n <= 9; n++) { mostrarNumero(n); delay(1000); }
}`,
    codigoESP32: `// 74LS47 con ESP32: cuenta de 0 a 9
const int PINES_BCD[4] = {25, 26, 27, 14};

void mostrarNumero(int n) { for (int bit = 0; bit < 4; bit++) digitalWrite(PINES_BCD[bit], (n >> bit) & 1); }

void setup() { for (int i = 0; i < 4; i++) pinMode(PINES_BCD[i], OUTPUT); }

void loop() { for (int n = 0; n <= 9; n++) { mostrarNumero(n); delay(1000); } }`,
    advertencias: AVISOS_74LS.slice(0, 2).concat(['Solo sirve para displays de ÁNODO común. Con uno de cátodo común no se ve nada.', 'Pon una resistencia (≈ 330 Ω) en cada segmento: el chip no limita la corriente.', 'Los números del 10 al 15 muestran símbolos raros: es normal.']),
    aplicaciones: ['Contador de 0 a 9 con pulsador', 'Mostrar el resultado de un sumador binario', 'Dado electrónico con lógica digital']
  });

  agregar({
    id: '74ls74', nombre: '74LS74 · 2 flip-flops tipo D', categoria: 'ci',
    descripcion: 'Dos flip-flops tipo D: cada uno es una memoria de 1 bit que guarda el valor de D en el instante en que el reloj sube.',
    funcionamiento: 'Es como una cámara de fotos: en el momento del "clic" (flanco de subida del reloj) toma una foto de la entrada D y la muestra en Q hasta el siguiente clic. PRE y CLR fuerzan la salida a 1 o a 0 sin esperar el reloj.',
    voltajeOperacion: '5 V (4,75 a 5,25 V)', corrienteTipica: '≈ 4 a 8 mA', logica: '5 V',
    datos: [['Encapsulado', 'DIP-14'], ['Disparo', 'Flanco de subida del reloj (↑)'], ['PRE y CLR', 'Activos en LOW (si no los usas, a HIGH)']],
    pines: pinesDeChip(['1CLR', '1D', '1CLK', '1PRE', '1Q', '1Q̅', 'GND', '2Q̅', '2Q', '2PRE', '2CLK', '2D', '2CLR', 'VCC'], {
      '1CLR': 'Borrado del flip-flop 1 (LOW → Q = 0)', '1D': 'Dato del flip-flop 1', '1CLK': 'Reloj del flip-flop 1', '1PRE': 'Puesta a 1 del flip-flop 1 (LOW → Q = 1)',
      '1Q': 'Salida del flip-flop 1', '1Q̅': 'Salida negada del flip-flop 1', '2Q̅': 'Salida negada del flip-flop 2', '2Q': 'Salida del flip-flop 2',
      '2PRE': 'Puesta a 1 del flip-flop 2', '2CLK': 'Reloj del flip-flop 2', '2D': 'Dato del flip-flop 2', '2CLR': 'Borrado del flip-flop 2', VCC: 'Alimentación +5 V', GND: 'Tierra'
    }),
    bloque: '2 × flip-flop D',
    tablaVerdad: {
      columnas: ['PRE', 'CLR', 'CLK', 'D', 'Q', 'Q̅'], salidas: 2,
      nota: '↑ = flanco de subida · X = no importa · Q₀ = el valor anterior se mantiene',
      filas: [[0, 1, 'X', 'X', 1, 0], [1, 0, 'X', 'X', 0, 1], [0, 0, 'X', 'X', '1*', '1*'], [1, 1, '↑', 1, 1, 0], [1, 1, '↑', 0, 0, 1], [1, 1, 0, 'X', 'Q₀', 'Q̅₀']]
    },
    conexionArduino: [K('Pin 14 (VCC), pin 1 (1CLR) y pin 4 (1PRE)', '5V'), K('Pin 7 (GND)', 'GND'), K('Pin 2 (1D)', 'D2'), K('Pin 3 (1CLK)', 'D3'), K('Pin 5 (1Q)', 'D4', 'Y un LED con 330 Ω para verlo')],
    conexionESP32: [K('Pin 14, pin 1 y pin 4', 'VIN (5 V)'), K('Pin 7', 'GND'), K('Pin 2 (1D)', 'GPIO 25'), K('Pin 3 (1CLK)', 'GPIO 26'), K('Pin 5 (1Q)', 'GPIO 27', 'A través del conversor de nivel')],
    codigoArduino: `// 74LS74: comprueba que Q "copia" a D solo cuando el reloj sube
const int PIN_D = 2, PIN_CLK = 3, PIN_Q = 4;

void pulsoDeReloj() {
  digitalWrite(PIN_CLK, HIGH);   // ¡clic! (flanco de subida)
  delay(1);
  digitalWrite(PIN_CLK, LOW);
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_D, OUTPUT); pinMode(PIN_CLK, OUTPUT); pinMode(PIN_Q, INPUT);

  digitalWrite(PIN_D, HIGH);
  Serial.print("D = 1 sin reloj → Q = "); Serial.println(digitalRead(PIN_Q));  // aún no cambia
  pulsoDeReloj();
  Serial.print("D = 1 tras el reloj → Q = "); Serial.println(digitalRead(PIN_Q));  // ahora 1

  digitalWrite(PIN_D, LOW);
  Serial.print("D = 0 sin reloj → Q = "); Serial.println(digitalRead(PIN_Q));  // sigue en 1: ¡recuerda!
  pulsoDeReloj();
  Serial.print("D = 0 tras el reloj → Q = "); Serial.println(digitalRead(PIN_Q));  // ahora 0
}

void loop() {}`,
    codigoESP32: `// 74LS74 con ESP32 (Q leído a través del conversor de nivel)
const int PIN_D = 25, PIN_CLK = 26, PIN_Q = 27;

void pulsoDeReloj() { digitalWrite(PIN_CLK, HIGH); delay(1); digitalWrite(PIN_CLK, LOW); }

void setup() {
  Serial.begin(115200);
  pinMode(PIN_D, OUTPUT); pinMode(PIN_CLK, OUTPUT); pinMode(PIN_Q, INPUT);
  for (int d = 1; d >= 0; d--) {
    digitalWrite(PIN_D, d);
    Serial.printf("D = %d, antes del reloj Q = %d", d, digitalRead(PIN_Q));
    pulsoDeReloj();
    Serial.printf(", después Q = %d\\n", digitalRead(PIN_Q));
  }
}

void loop() {}`,
    advertencias: AVISOS_74LS.concat(['* PRE y CLR en LOW a la vez dejan Q y Q̅ en 1: es un estado no válido, evítalo.', 'Un botón mecánico como reloj "rebota" y da varios pulsos: usa un circuito antirrebote.']),
    aplicaciones: ['Memoria de 1 bit', 'Divisor de frecuencia entre 2 (Q̅ unido a D)', 'Contador binario y registros de desplazamiento']
  });

  agregar({
    id: '74hc595', nombre: '74HC595 · registro de desplazamiento', categoria: 'ci',
    descripcion: 'Convierte 3 pines de la placa en 8 salidas. Ideal para controlar muchos LEDs. Se pueden encadenar varios chips.',
    funcionamiento: 'Los bits entran uno por uno por SER, como personas haciendo fila: con cada pulso de SRCLK todos avanzan un lugar. Cuando la fila está completa, un pulso en RCLK (latch) "toma la foto" y la muestra en las 8 salidas a la vez.',
    voltajeOperacion: '2 V a 6 V (funciona con 3,3 V y con 5 V)', corrienteTipica: 'Hasta 6 mA por salida recomendado · máx. 70 mA en total por el chip', logica: '3.3 V y 5 V',
    datos: [['Encapsulado', 'DIP-16'], ['Familia', 'CMOS de alta velocidad (74HC)'], ['Encadenado', 'QH\' (pin 9) va al SER del siguiente chip']],
    pines: pinesDeChip(['QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH', 'GND', "QH'", 'SRCLR̅', 'SRCLK', 'RCLK', 'OE̅', 'SER', 'QA', 'VCC'], {
      QA: 'Salida 0', QB: 'Salida 1', QC: 'Salida 2', QD: 'Salida 3', QE: 'Salida 4', QF: 'Salida 5', QG: 'Salida 6', QH: 'Salida 7',
      "QH'": 'Salida serie para encadenar otro chip', 'SRCLR̅': 'Borra el registro en LOW (normalmente a VCC)', SRCLK: 'Reloj de desplazamiento',
      RCLK: 'Latch: copia el registro a las salidas', 'OE̅': 'Habilita las salidas en LOW (normalmente a GND)', SER: 'Entrada de datos en serie', VCC: 'Alimentación', GND: 'Tierra'
    }),
    bloque: 'Registro de 8 bits + latch',
    tablaVerdad: {
      columnas: ['SER', 'SRCLK', 'SRCLR̅', 'RCLK', 'OE̅', 'Resultado'], salidas: 1,
      nota: '↑ = flanco de subida · X = no importa',
      filas: [['X', 'X', 'X', 'X', 1, 'Salidas desconectadas (alta impedancia)'], ['X', 'X', 0, 'X', 0, 'Registro borrado'], [1, '↑', 1, 'X', 0, 'Entra un 1 y todo avanza'], [0, '↑', 1, 'X', 0, 'Entra un 0 y todo avanza'], ['X', 'X', 1, '↑', 0, 'El registro pasa a las salidas']]
    },
    conexionArduino: [K('Pin 16 (VCC) y pin 10 (SRCLR̅)', '5V'), K('Pin 8 (GND) y pin 13 (OE̅)', 'GND'), K('Pin 14 (SER)', 'D11'), K('Pin 12 (RCLK)', 'D8'), K('Pin 11 (SRCLK)', 'D12'), K('QA–QH', '8 LEDs con 330 Ω a GND')],
    conexionESP32: [K('Pin 16 (VCC) y pin 10', '3V3', 'Alimentado a 3,3 V se conecta directo al ESP32'), K('Pin 8 y pin 13', 'GND'), K('Pin 14 (SER)', 'GPIO 23'), K('Pin 12 (RCLK)', 'GPIO 5'), K('Pin 11 (SRCLK)', 'GPIO 18'), K('QA–QH', '8 LEDs con 220 Ω a GND')],
    codigoArduino: `// 74HC595: contador binario en 8 LEDs con solo 3 pines
const int PIN_DATOS = 11;   // SER (pin 14)
const int PIN_LATCH = 8;    // RCLK (pin 12)
const int PIN_RELOJ = 12;   // SRCLK (pin 11)

void mostrar(byte valor) {
  digitalWrite(PIN_LATCH, LOW);
  shiftOut(PIN_DATOS, PIN_RELOJ, MSBFIRST, valor);   // envía los 8 bits
  digitalWrite(PIN_LATCH, HIGH);                     // ¡foto! aparecen en los LEDs
}

void setup() {
  pinMode(PIN_DATOS, OUTPUT); pinMode(PIN_LATCH, OUTPUT); pinMode(PIN_RELOJ, OUTPUT);
}

void loop() {
  for (int n = 0; n < 256; n++) { mostrar(n); delay(200); }
}`,
    codigoESP32: `// 74HC595 con ESP32 (chip alimentado a 3,3 V): luz que va y viene
const int PIN_DATOS = 23, PIN_LATCH = 5, PIN_RELOJ = 18;

void mostrar(byte valor) {
  digitalWrite(PIN_LATCH, LOW);
  shiftOut(PIN_DATOS, PIN_RELOJ, MSBFIRST, valor);
  digitalWrite(PIN_LATCH, HIGH);
}

void setup() { pinMode(PIN_DATOS, OUTPUT); pinMode(PIN_LATCH, OUTPUT); pinMode(PIN_RELOJ, OUTPUT); }

void loop() {
  for (int i = 0; i < 8; i++) { mostrar(1 << i); delay(100); }
  for (int i = 6; i > 0; i--) { mostrar(1 << i); delay(100); }
}`,
    advertencias: ['No pases de ≈ 70 mA en total: con 8 LEDs usa resistencias de 330 Ω o más.', 'Si los LEDs muestran basura al arrancar, conecta SRCLR̅ y OE̅ como se indica.', 'Pon un capacitor de 100 nF entre VCC y GND.'],
    aplicaciones: ['Juego de luces con 8 o más LEDs', 'Controlar displays de 7 segmentos', 'Matriz de LEDs casera', 'Ampliar salidas del ESP32']
  });

  agregar({
    id: 'cd4017', nombre: 'CD4017 · contador de décadas', categoria: 'ci',
    descripcion: 'Contador con 10 salidas: con cada pulso de reloj se enciende la siguiente salida (Q0, Q1, Q2… Q9) y vuelve a empezar.',
    funcionamiento: 'Funciona como una "papa caliente": solo una salida está en HIGH y con cada pulso pasa el turno a la siguiente. Junto con un NE555 como reloj forma el clásico juego de luces sin microcontrolador.',
    voltajeOperacion: '3 V a 15 V', corrienteTipica: 'Salidas débiles: ≈ 1 a 10 mA según el voltaje (con 5 V, menos de 5 mA)', logica: '3.3 V y 5 V',
    datos: [['Encapsulado', 'DIP-16'], ['Familia', 'CMOS serie 4000'], ['Salida CO', 'HIGH durante Q0–Q4, LOW durante Q5–Q9 (sirve para encadenar)']],
    pines: pinesDeChip(['Q5', 'Q1', 'Q0', 'Q2', 'Q6', 'Q7', 'Q3', 'VSS', 'Q8', 'Q4', 'Q9', 'CO', 'CLK INH', 'CLK', 'RESET', 'VDD'], {
      Q0: 'Salida 0 (activa tras el reinicio)', Q1: 'Salida 1', Q2: 'Salida 2', Q3: 'Salida 3', Q4: 'Salida 4', Q5: 'Salida 5', Q6: 'Salida 6', Q7: 'Salida 7', Q8: 'Salida 8', Q9: 'Salida 9',
      CO: 'Salida de acarreo (÷10)', 'CLK INH': 'Inhibe el conteo en HIGH (normalmente a GND)', CLK: 'Entrada de reloj (cuenta en el flanco de subida)', RESET: 'En HIGH vuelve a Q0 (normalmente a GND)',
      VDD: 'Alimentación (3 a 15 V)', VSS: 'Tierra'
    }),
    bloque: 'Contador Johnson de 5 etapas + decodificador de 10 salidas',
    tablaVerdad: {
      columnas: ['CLK', 'CLK INH', 'RESET', 'Resultado'], salidas: 1,
      nota: '↑ = flanco de subida · X = no importa',
      filas: [['X', 'X', 1, 'Q0 = 1, las demás en 0'], ['↑', 0, 0, 'Avanza a la siguiente salida'], ['X', 1, 0, 'No cuenta (se queda donde está)'], [0, 0, 0, 'Sin cambio']]
    },
    conexionArduino: [K('Pin 16 (VDD)', '5V'), K('Pin 8 (VSS) y pin 13 (CLK INH)', 'GND'), K('Pin 14 (CLK)', 'D2'), K('Pin 15 (RESET)', 'D3'), K('Q0–Q9', '10 LEDs con 470 Ω a GND')],
    conexionESP32: [K('Pin 16 (VDD)', '3V3', 'A 3,3 V se conecta directo al ESP32'), K('Pin 8 y pin 13', 'GND'), K('Pin 14 (CLK)', 'GPIO 25'), K('Pin 15 (RESET)', 'GPIO 26'), K('Q0–Q9', 'LEDs con 220 Ω (a 3,3 V brillan poco)')],
    codigoArduino: `// CD4017: la placa genera el reloj y las luces avanzan una a una
const int PIN_RELOJ = 2;    // al pin 14 (CLK)
const int PIN_RESET = 3;    // al pin 15 (RESET)

void setup() {
  pinMode(PIN_RELOJ, OUTPUT);
  pinMode(PIN_RESET, OUTPUT);
  digitalWrite(PIN_RESET, HIGH);   // empieza en Q0
  delay(10);
  digitalWrite(PIN_RESET, LOW);
}

void loop() {
  digitalWrite(PIN_RELOJ, HIGH);   // flanco de subida: avanza una salida
  delay(150);
  digitalWrite(PIN_RELOJ, LOW);
  delay(150);
}`,
    codigoESP32: `// CD4017 con ESP32 (chip alimentado a 3,3 V)
const int PIN_RELOJ = 25, PIN_RESET = 26;
int velocidad = 300;

void setup() {
  pinMode(PIN_RELOJ, OUTPUT); pinMode(PIN_RESET, OUTPUT);
  digitalWrite(PIN_RESET, HIGH); delay(10); digitalWrite(PIN_RESET, LOW);
}

void loop() {
  digitalWrite(PIN_RELOJ, HIGH); delay(velocidad / 2);
  digitalWrite(PIN_RELOJ, LOW);  delay(velocidad / 2);
  velocidad = velocidad > 60 ? velocidad - 10 : 300;   // cada vez más rápido
}`,
    advertencias: ['Sus salidas dan poca corriente: usa resistencias de 470 Ω a 1 kΩ en los LEDs o transistores.', 'Nunca dejes RESET ni CLK INH al aire: los chips CMOS se vuelven locos con entradas flotantes.', 'Es sensible a la electricidad estática: tócalo lo menos posible por las patas.'],
    aplicaciones: ['Juego de luces (con NE555)', 'Ruleta electrónica', 'Secuenciador de un semáforo', 'Divisor de frecuencia entre 10']
  });

  /* =====================================================================
     6. PUBLICAR LOS DATOS
     La app los encuentra en window.EV_DATA
     ===================================================================== */
  window.EV_DATA = Object.freeze({
    version: '13.0.0',
    componentes: LISTA,
    categorias: CATEGORIAS,
    tiposPin: TIPOS_PIN,
    buscar(id) { return LISTA.find(c => c.id === id) || null; },
    porCategoria(cat) { return LISTA.filter(c => c.categoria === cat); }
  });
})();
