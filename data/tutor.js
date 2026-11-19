/* =====================================================================
   ELECTROVERSE · Tutor de electrónica (base de conocimiento sin internet)
   ---------------------------------------------------------------------
   Este archivo guarda TODO lo que el tutor sabe sin necesitar IA:
   - niveles: Básico, Intermedio, Avanzado e Industrial (IoT y robótica)
   - temas con explicación corta, fórmulas y preguntas frecuentes
   - generadores de ejercicios: cada vez crean valores nuevos y
     muestran la solución paso a paso
   - diagramas para aprender a leer esquemas (con preguntas)
   - las instrucciones del "agente profesional" que usa la IA
   Se carga con <script src="data/tutor.js"> y queda en window.EV_TUTOR.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Utilidades pequeñas ---------- */
  // Elige un elemento al azar de una lista
  const al = lista => lista[Math.floor(Math.random() * lista.length)];
  // Redondea a "c" cifras significativas (para que los números se lean bien)
  const cif = (x, c = 3) => { if (!isFinite(x) || x === 0) return x; const p = Math.pow(10, c - Math.ceil(Math.log10(Math.abs(x)))); return Math.round(x * p) / p; };
  // Formatea con prefijo del Sistema Internacional (k, M, m, µ, n)
  function si(x, u) {
    if (!isFinite(x)) return '—';
    const a = Math.abs(x), pre = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
    for (const [f, p] of pre) if (a >= f * 0.9999) return String(cif(x / f)).replace('.', ',') + ' ' + p + u;
    return String(cif(x)).replace('.', ',') + ' ' + u;
  }
  // Valores comerciales de resistencias (serie E12)
  const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  const rE12 = (min, max) => { const l = []; for (let d = 1; d <= 1e6; d *= 10) E12.forEach(m => { const v = cif(m * d); if (v >= min && v <= max) l.push(v); }); return al(l); };
  // Siguiente valor comercial mayor o igual (para elegir una resistencia real)
  const comMayor = x => { for (let d = 1; d <= 1e7; d *= 10) for (const m of E12) if (m * d >= x * 0.999) return cif(m * d); return x; };

  /* =================================================================
     1) NIVELES Y TEMAS
     Cada tema: id, titulo, resumen (texto con **negritas** y listas),
     formulas, faq (preguntas frecuentes), ej (ejercicios que lo practican),
     dg (diagramas relacionados)
     ================================================================= */
  const niveles = [
    {
      id: 'basico', nombre: 'Básico', color: '#22c55e',
      desc: 'Magnitudes eléctricas, ley de Ohm, serie y paralelo, componentes y seguridad en el taller.',
      temas: [
        { id: 'magnitudes', titulo: 'Magnitudes y seguridad',
          resumen: '- **Tensión (V, voltios):** la "presión" que empuja a los electrones. Se mide en **paralelo** con el multímetro.\n- **Corriente (I, amperios):** cuántas cargas pasan por segundo. Se mide en **serie** (abriendo el circuito).\n- **Resistencia (R, ohmios Ω):** cuánto se opone un material al paso de la corriente. Se mide **sin energía**.\n- **Potencia (P, vatios):** energía por segundo que entrega o consume un elemento.\n- **Seguridad:** trabaja sin tensión, no toques la red de 220 V, usa fusibles y nunca midas corriente en paralelo (es un cortocircuito).',
          formulas: ['P = V · I', '1 kΩ = 1000 Ω · 1 mA = 0,001 A'],
          faq: [
            { p: '¿Cuál es la diferencia entre voltaje y corriente?', r: 'El voltaje es la diferencia de potencial que empuja las cargas; la corriente es el flujo de esas cargas. Puede haber voltaje sin corriente (una pila sin conectar), pero no corriente sin voltaje.' },
            { p: '¿Cómo mido corriente con el multímetro?', r: 'Pasa la punta roja al borne de A o mA, selecciona corriente continua y **abre el circuito**: el multímetro debe quedar en serie, como un trozo de cable más. Si lo pones en paralelo con la fuente haces un cortocircuito y puedes quemar su fusible.' },
            { p: '¿Por qué es peligrosa la red eléctrica de casa?', r: 'En Perú la red es de 220 V y 60 Hz. Una corriente de solo 30 mA por el pecho puede detener el corazón. Por eso se usan interruptores diferenciales de 30 mA, puesta a tierra y se trabaja siempre con el circuito desenergizado.' }
          ], ej: ['ohm', 'potencia'], dg: [] },
        { id: 'ohm', titulo: 'Ley de Ohm y potencia',
          resumen: 'La **ley de Ohm** dice que la corriente es proporcional a la tensión e inversamente proporcional a la resistencia.\n- Si duplicas la tensión, se duplica la corriente.\n- Si duplicas la resistencia, la corriente baja a la mitad.\n- La potencia que se convierte en calor en una resistencia es P = I²·R. Elige resistencias con una potencia nominal (1/4 W, 1/2 W…) **al menos el doble** de la calculada.',
          formulas: ['V = I · R', 'I = V / R', 'R = V / I', 'P = V · I = I² · R = V² / R'],
          faq: [
            { p: '¿Cómo recuerdo la ley de Ohm?', r: 'Con el triángulo **V arriba, I y R abajo**: tapa la magnitud que buscas. Tapas V → I·R; tapas I → V/R; tapas R → V/I.' },
            { p: '¿Por qué se calienta una resistencia?', r: 'Porque transforma energía eléctrica en calor (efecto Joule): P = I²·R. Si la potencia supera la nominal, se quema.' }
          ], ej: ['ohm', 'potencia'], dg: ['led'] },
        { id: 'serie-paralelo', titulo: 'Circuitos serie y paralelo',
          resumen: '- **Serie:** un solo camino. La corriente es la misma en todos; las tensiones se reparten. R_total = R1 + R2 + …\n- **Paralelo:** varios caminos. La tensión es la misma en todas las ramas; las corrientes se reparten. 1/R_total = 1/R1 + 1/R2 + …\n- Dos resistencias en paralelo: R = (R1·R2)/(R1+R2). La resistencia total en paralelo **siempre es menor** que la menor de ellas.',
          formulas: ['Serie: Rt = R1 + R2 + R3', 'Paralelo: 1/Rt = 1/R1 + 1/R2', 'Dos en paralelo: Rt = R1·R2 / (R1 + R2)'],
          faq: [
            { p: '¿Por qué las luces de la casa están en paralelo?', r: 'Para que todas reciban los mismos 220 V y para que, si una se quema o se apaga, las demás sigan funcionando.' },
            { p: '¿Qué pasa si un foco en serie se quema?', r: 'Se abre el único camino y se apagan todos, como en algunas luces navideñas antiguas.' }
          ], ej: ['serie', 'paralelo'], dg: [] },
        { id: 'pasivos', titulo: 'Resistencias, capacitores e inductores',
          resumen: '- **Resistencia:** código de colores (negro 0, marrón 1, rojo 2, naranja 3, amarillo 4, verde 5, azul 6, violeta 7, gris 8, blanco 9). Dos bandas de cifras + multiplicador + tolerancia (dorado ±5 %).\n- **Capacitor:** guarda energía en un campo eléctrico. Se mide en faradios (µF, nF, pF). Los **electrolíticos tienen polaridad**: la franja marca el negativo.\n- **Inductor (bobina):** guarda energía en un campo magnético; se opone a cambios bruscos de corriente.',
          formulas: ['Energía en un capacitor: E = ½ · C · V²', 'Capacitores en paralelo: Ct = C1 + C2', 'Capacitores en serie: 1/Ct = 1/C1 + 1/C2'],
          faq: [
            { p: '¿Qué significa 104 en un capacitor cerámico?', r: '10 seguido de 4 ceros en picofaradios: 100 000 pF = 100 nF = 0,1 µF.' },
            { p: '¿Qué pasa si conecto un electrolítico al revés?', r: 'Se calienta, se hincha y puede explotar. Respeta siempre la polaridad y una tensión nominal mayor que la del circuito.' }
          ], ej: ['rc'], dg: [] },
        { id: 'diodo-led', titulo: 'Diodo y LED',
          resumen: '- El **diodo** deja pasar la corriente en un solo sentido: del ánodo (+) al cátodo (−, marcado con una franja).\n- En conducción tiene una caída casi fija: ≈0,7 V el de silicio.\n- El **LED** también es un diodo: rojo ≈1,8–2 V, verde ≈2,1 V, azul/blanco ≈3 V. Necesita **siempre** una resistencia en serie para limitar la corriente (≈10–20 mA).\n- La pata larga del LED es el ánodo.',
          formulas: ['R = (Vfuente − V_LED) / I_LED'],
          faq: [
            { p: '¿Por qué mi LED no enciende?', r: 'Revisa en este orden: 1) ¿está al revés? (la pata larga va al +), 2) ¿el circuito está cerrado?, 3) ¿la fuente supera la tensión del LED?, 4) ¿la resistencia es demasiado grande? Con 5 V y un LED rojo, 220 Ω a 330 Ω está bien.' },
            { p: '¿Puedo conectar un LED directo a 5 V?', r: 'No: sin resistencia la corriente sube sin control y el LED se quema en segundos.' }
          ], ej: ['led'], dg: ['led'] },
        { id: 'simbolos', titulo: 'Leer un esquema básico',
          resumen: 'Un esquema dibuja **cómo se conectan** los componentes, no dónde están físicamente.\n- Las líneas son conductores; un **punto** en un cruce indica unión; sin punto, los cables solo se cruzan.\n- Batería: línea larga (+) y corta (−). Tierra (GND): tres líneas horizontales decrecientes.\n- Lee de la fuente (+) siguiendo el camino de la corriente hasta volver al (−).\n- Busca primero la alimentación, luego las entradas (sensores, pulsadores) y al final las salidas (LED, motores, relés).',
          formulas: [],
          faq: [
            { p: '¿Qué significa GND?', r: 'Es la referencia de 0 V del circuito (tierra o masa). Todas las tensiones se miden respecto a ella. Si tienes varias fuentes o un Arduino, sus GND deben estar unidos.' }
          ], ej: [], dg: ['led', 'divisor'] }
      ]
    },
    {
      id: 'intermedio', nombre: 'Intermedio', color: '#22d3ee',
      desc: 'Kirchhoff, transistores, fuentes de alimentación, temporizadores, amplificadores operacionales, lógica digital y microcontroladores.',
      temas: [
        { id: 'kirchhoff', titulo: 'Kirchhoff y divisor de tensión',
          resumen: '- **Ley de nodos (LCK):** la suma de corrientes que entran a un nodo es igual a la suma de las que salen.\n- **Ley de mallas (LTK):** en un lazo cerrado, la suma de subidas de tensión es igual a la suma de caídas.\n- **Divisor de tensión:** dos resistencias en serie reparten la tensión en proporción a su valor. Se usa para leer sensores (LDR, NTC, potenciómetro) con el ADC de un Arduino o para bajar 5 V a 3,3 V.',
          formulas: ['Vout = Vin · R2 / (R1 + R2)', 'ΣI_entran = ΣI_salen', 'ΣV en una malla = 0'],
          faq: [
            { p: '¿Puedo alimentar un motor con un divisor de tensión?', r: 'No. El divisor solo sirve para señales de muy poca corriente: al conectar una carga, la tensión cae y se desperdicia mucha energía. Para alimentar usa un regulador.' }
          ], ej: ['divisor', 'puente'], dg: ['divisor'] },
        { id: 'transistor', titulo: 'Transistor BJT y MOSFET como interruptor',
          resumen: '- **BJT NPN:** una pequeña corriente de base (I_B) controla una corriente de colector mayor: I_C = β·I_B. Para usarlo como interruptor se lleva a **saturación** dando una I_B unas 5–10 veces mayor que I_C/β.\n- **MOSFET canal N:** se controla por **tensión** de compuerta; casi no consume corriente. Elige uno "logic level" (ej. IRLZ44N) para manejarlo con 5 V o 3,3 V.\n- Con cargas inductivas (relés, motores) pon un **diodo de rueda libre** (1N4007) en antiparalelo con la bobina.',
          formulas: ['I_C = β · I_B', 'R_B = (V_control − 0,7 V) / I_B', 'I_B (saturación) ≈ 5…10 · I_C / β'],
          faq: [
            { p: '¿Por qué no conecto el relé directo al pin del Arduino?', r: 'Un pin entrega como máximo unos 20 mA (40 mA es el límite absoluto) y una bobina de relé pide 70–90 mA. Además, al apagarla genera un pico de tensión inversa que puede dañar el microcontrolador. Usa un transistor y un diodo, o un módulo de relé.' },
            { p: '¿Qué hace el diodo en paralelo con el relé?', r: 'Cuando el transistor corta, la bobina intenta mantener la corriente y genera un pico de tensión alto. El diodo le da un camino a esa corriente y protege al transistor.' }
          ], ej: ['bjt'], dg: ['rele'] },
        { id: 'fuentes', titulo: 'Fuentes de alimentación lineales',
          resumen: 'Etapas de una fuente lineal:\n1. **Transformador:** baja 220 V CA a, por ejemplo, 12 V CA.\n2. **Rectificador** (puente de 4 diodos): convierte la CA en pulsos de un solo sentido.\n3. **Filtro** (capacitor electrolítico grande): alisa los pulsos; queda un pequeño **rizado**.\n4. **Regulador** (7805, 7812, LM317) o **Zener**: entrega una tensión fija.\nEl 7805 necesita al menos ≈2 V más en la entrada que en la salida y disipa P = (Vin − Vout)·I.',
          formulas: ['Vs = Vp · Ns / Np', 'V pico = V eficaz · √2', 'Rizado onda completa: Vr ≈ I / (2 · f · C)', 'Zener: Rs = (Vin − Vz) / (Iz + I_carga)'],
          faq: [
            { p: '¿Por qué se calienta el 7805?', r: 'Porque toda la tensión que "sobra" se convierte en calor: con 12 V de entrada, 5 V de salida y 0,5 A disipa (12−5)·0,5 = 3,5 W. Necesita disipador, o usa un regulador conmutado (buck).' }
          ], ej: ['transformador', 'rizado', 'zener'], dg: ['fuente'] },
        { id: 'rc-555', titulo: 'Circuitos RC y temporizador 555',
          resumen: '- Un capacitor se carga a través de una resistencia con una **constante de tiempo τ = R·C**. En 1 τ llega al 63 % y en 5 τ se considera cargado.\n- El **555** es un temporizador integrado: en modo **astable** genera una onda cuadrada (parpadeo, tonos); en modo **monoestable** da un pulso de duración fija al recibir un disparo.\n- Frecuencia astable: f = 1,44 / ((R1 + 2·R2)·C).',
          formulas: ['τ = R · C', 'Vc(t) = V · (1 − e^(−t/τ))', '555 astable: f = 1,44 / ((R1 + 2R2) · C)', '555 monoestable: t = 1,1 · R · C'],
          faq: [
            { p: '¿Cómo hago que un LED parpadee sin microcontrolador?', r: 'Con un 555 en modo astable. Por ejemplo R1 = 10 kΩ, R2 = 68 kΩ y C = 10 µF dan cerca de 1 Hz.' }
          ], ej: ['rc', 'ne555'], dg: [] },
        { id: 'opamp', titulo: 'Amplificador operacional',
          resumen: 'Un amplificador operacional (LM358, TL072) amplifica la diferencia entre sus entradas. Con realimentación negativa se cumplen dos reglas: **las entradas están al mismo potencial** y **no entra corriente** en ellas.\n- **No inversor:** G = 1 + Rf/Rg (misma fase).\n- **Inversor:** G = −Rf/Rin (invierte la señal).\n- **Comparador:** sin realimentación; la salida va al máximo o al mínimo según qué entrada sea mayor.\n- La salida nunca supera la tensión de alimentación.',
          formulas: ['No inversor: G = 1 + Rf / Rg', 'Inversor: G = −Rf / Rin', 'Seguidor: G = 1'],
          faq: [
            { p: '¿Para qué sirve un seguidor de tensión?', r: 'Tiene ganancia 1 pero una impedancia de entrada altísima: copia la tensión de un sensor débil sin cargarlo.' }
          ], ej: ['opamp'], dg: [] },
        { id: 'digital', titulo: 'Electrónica digital',
          resumen: '- Solo dos estados: 0 (bajo) y 1 (alto). En Arduino UNO: 0 V y 5 V; en ESP32: 0 V y 3,3 V.\n- Compuertas: **AND** (todas en 1), **OR** (al menos una en 1), **NOT** (invierte), **NAND**, **NOR**, **XOR** (entradas distintas).\n- Sistemas numéricos: binario (base 2), decimal y hexadecimal (base 16).\n- **Flip-flops** guardan un bit; los **contadores** (CD4017, 74HC193) y **registros** (74HC595) se construyen con ellos.',
          formulas: ['Decimal de un binario: Σ bit · 2^posición', 'Con n bits: 2^n combinaciones'],
          faq: [
            { p: '¿Qué es una resistencia pull-up?', r: 'Mantiene una entrada en 1 cuando el pulsador está abierto; al presionarlo la entrada va a 0. Sin ella la entrada queda "flotando" y lee valores al azar. Arduino tiene pull-up internas: pinMode(pin, INPUT_PULLUP).' }
          ], ej: ['binario'], dg: [] },
        { id: 'micro', titulo: 'Microcontroladores (Arduino y ESP32)',
          resumen: '- **GPIO:** pines que se configuran como entrada o salida (pinMode, digitalWrite, digitalRead).\n- **PWM:** simula una tensión intermedia variando el ciclo de trabajo (analogWrite). Sirve para el brillo de un LED o la velocidad de un motor.\n- **ADC:** convierte una tensión en un número. UNO: 10 bits (0–1023) con 5 V; ESP32: 12 bits (0–4095) con 3,3 V.\n- **Buses:** UART (Serial, TX/RX), I²C (SDA/SCL, varios sensores con dirección), SPI (MOSI/MISO/SCK/CS, rápido).\n- El ESP32 funciona a **3,3 V**: no le metas 5 V a sus pines.',
          formulas: ['Lectura ADC = Vin / Vref · (2^n − 1)', 'V media PWM = Ciclo de trabajo · Vcc'],
          faq: [
            { p: '¿Qué pines del ESP32 no debo usar?', r: 'Evita GPIO 6–11 (memoria flash). GPIO 34–39 son solo entradas. GPIO 0, 2, 12 y 15 influyen en el arranque. Para el ADC con WiFi encendido usa el ADC1 (GPIO 32–39).' },
            { p: '¿Por qué mi lectura analógica salta?', r: 'Ruido o entrada flotante. Une los GND, usa cables cortos, agrega un capacitor de 100 nF entre la entrada y GND y promedia varias lecturas en el programa.' }
          ], ej: ['adc', 'pwm'], dg: ['divisor', 'rele'] }
      ]
    },
    {
      id: 'avanzado', nombre: 'Avanzado', color: '#a78bfa',
      desc: 'Corriente alterna y potencia, electrónica de potencia, filtros, acondicionamiento de sensores, control PID y diagnóstico.',
      temas: [
        { id: 'ca', titulo: 'Corriente alterna y factor de potencia',
          resumen: '- La tensión de la red es senoidal: 220 V **eficaces** (RMS), unos 311 V de pico, a 60 Hz en Perú.\n- **Impedancia:** X_L = 2πfL (bobina), X_C = 1/(2πfC) (capacitor). En una carga inductiva la corriente se atrasa respecto a la tensión.\n- **Potencias:** activa P (W, trabajo útil), reactiva Q (VAR), aparente S (VA). S² = P² + Q².\n- **Factor de potencia:** cos φ = P/S. Un FP bajo obliga a más corriente por los cables; se corrige con **capacitores** en paralelo.',
          formulas: ['P = V · I · cos φ', 'S = V · I', 'Q = V · I · sen φ', 'Qc = P · (tan φ1 − tan φ2)', 'C = Qc / (2π · f · V²)'],
          faq: [
            { p: '¿Por qué los motores tienen un factor de potencia bajo?', r: 'Necesitan corriente reactiva para crear su campo magnético. Esa corriente no hace trabajo pero sí circula por los cables y los calienta.' }
          ], ej: ['monofasica', 'fp'], dg: [] },
        { id: 'potencia', titulo: 'Electrónica de potencia y motores DC',
          resumen: '- **Puente H:** cuatro interruptores (transistores o MOSFET) permiten invertir el giro de un motor DC. Nunca cierres los dos interruptores de un mismo lado: es un **cortocircuito** ("shoot-through").\n- Drivers integrados: L298N (bipolar, caída ≈2 V), TB6612/DRV8833 (MOSFET, más eficientes).\n- La velocidad se controla con **PWM**.\n- **Disipación:** P = I²·R_DS(on) en un MOSFET; si la temperatura de unión supera el límite, usa disipador.',
          formulas: ['P_MOSFET = I² · R_DS(on)', 'T_unión = T_amb + P · R_θ'],
          faq: [
            { p: '¿Por qué mi motor hace reiniciar al Arduino?', r: 'El motor provoca caídas de tensión y ruido. Aliméntalo con una fuente separada, une los GND, pon un capacitor de 100 nF en los bornes del motor y otro electrolítico grande cerca del driver.' }
          ], ej: ['pwm'], dg: ['puente-h'] },
        { id: 'filtros', titulo: 'Filtros y señales',
          resumen: '- **Filtro RC pasa bajos:** deja pasar frecuencias bajas y atenúa las altas. Frecuencia de corte fc = 1/(2πRC); en fc la señal cae a 70,7 % (−3 dB).\n- **Pasa altos:** al revés (el capacitor en serie).\n- **Muestreo:** para digitalizar una señal la frecuencia de muestreo debe ser mayor que el doble de la máxima frecuencia de la señal (teorema de **Nyquist**).\n- Los decibelios comparan niveles: dB = 20·log(Vout/Vin).',
          formulas: ['fc = 1 / (2π · R · C)', 'dB = 20 · log10(Vout / Vin)', 'fs > 2 · f_max'],
          faq: [
            { p: '¿Cómo elimino el ruido de un sensor analógico?', r: 'Combina un filtro RC (por ejemplo 10 kΩ y 1 µF ≈ 16 Hz) con un promedio móvil en el programa.' }
          ], ej: ['filtro'], dg: [] },
        { id: 'sensores', titulo: 'Acondicionamiento de sensores',
          resumen: '- **Puente de Wheatstone:** mide cambios muy pequeños de resistencia (galgas extensiométricas, celdas de carga con HX711). En equilibrio: Rx = R3·R2/R1.\n- **Lazo 4–20 mA:** estándar industrial; 4 mA = mínimo de la escala, 20 mA = máximo. Un valor por debajo de 4 mA indica cable cortado. Se lee con una resistencia de 250 Ω (1–5 V).\n- **PT100:** RTD de platino, 100 Ω a 0 °C y ≈0,385 Ω por °C.\n- Escalado lineal: valor = mín + (lectura − lectura_mín)·(máx − mín)/(lectura_máx − lectura_mín).',
          formulas: ['Rx = R3 · R2 / R1', 'Valor = mín + (I − 4 mA) / 16 mA · (máx − mín)', 'PT100: R ≈ 100 · (1 + 0,00385 · T)'],
          faq: [
            { p: '¿Por qué la industria usa 4–20 mA y no 0–10 V?', r: 'La corriente no cae por la resistencia de los cables largos y es menos sensible al ruido. Además 0 mA indica falla, mientras que 0 V podría ser un valor válido.' }
          ], ej: ['lazo420', 'puente', 'pt100'], dg: [] },
        { id: 'control', titulo: 'Control automático y PID',
          resumen: '- **Lazo abierto:** no mide el resultado. **Lazo cerrado:** mide (sensor), compara con la consigna y corrige.\n- **Control ON/OFF con histéresis:** el termostato enciende por debajo de la consigna y apaga por encima, con una banda para no conmutar todo el tiempo.\n- **PID:** salida = Kp·e + Ki·∫e·dt + Kd·de/dt. P reacciona al error actual, I elimina el error permanente, D frena los cambios bruscos.\n- Ajuste práctico: sube Kp hasta que oscile, bájalo a la mitad, luego agrega Ki poco a poco y Kd si hay sobrepaso.',
          formulas: ['u(t) = Kp·e + Ki·∫e dt + Kd·de/dt', 'e = consigna − medición'],
          faq: [
            { p: '¿Qué pasa si Ki es muy grande?', r: 'El sistema acumula error y oscila (windup). Limita la integral y súbela de a poco.' }
          ], ej: [], dg: [] },
        { id: 'diagnostico', titulo: 'Diagnóstico y lectura de planos complejos',
          resumen: 'Método de diagnóstico en 6 pasos:\n1. **Observar:** síntomas, olor a quemado, LEDs, ruidos.\n2. **Alimentación:** mide la tensión en la fuente y en cada chip (VCC–GND).\n3. **Dividir el circuito en bloques** (fuente, control, potencia, señal) y probar bloque por bloque.\n4. **Seguir la señal** desde la entrada hasta la salida con multímetro u osciloscopio.\n5. **Comparar con lo esperado** (cálculo o hoja de datos).\n6. **Corregir y verificar**.\nEn planos grandes: identifica el bloque de alimentación, las referencias cruzadas (etiquetas de red con el mismo nombre están unidas) y la lista de materiales.',
          formulas: [],
          faq: [
            { p: '¿Cómo sé si un componente está dañado?', r: 'Resistencias: mide fuera del circuito. Diodos: modo diodo, ≈0,5–0,7 V en directo y OL en inverso. Capacitores: busca hinchazón; mide capacidad con el circuito descargado. Transistores: prueba las uniones base-emisor y base-colector como diodos.' }
          ], ej: [], dg: ['fuente', 'rele'] }
      ]
    },
    {
      id: 'industrial', nombre: 'Industrial · IoT · Robótica', color: '#f59e0b',
      desc: 'Mando eléctrico, motores trifásicos, PLC y Ladder, redes industriales, IoT industrial con ESP32 y robótica.',
      temas: [
        { id: 'mando', titulo: 'Mando eléctrico con contactores',
          resumen: '- **Contactor (KM):** interruptor accionado por una bobina; sus contactos principales manejan el motor y los auxiliares el mando.\n- **Relé térmico (F2):** protege el motor contra sobrecarga; abre su contacto NC 95-96 en el circuito de mando.\n- **Arranque directo con enclavamiento:** S0 (paro, NC) en serie, S1 (marcha, NO) en paralelo con un contacto auxiliar NO de KM1 (13-14). Al soltar S1, KM1 se mantiene por su propio contacto (**autorretención**).\n- **Inversión de giro:** dos contactores que intercambian dos fases, con **enclavamiento eléctrico** (NC del otro contactor en serie) para que nunca entren juntos.\n- **Estrella-triángulo:** reduce la corriente de arranque a un tercio.',
          formulas: ['Corriente de arranque directo ≈ 6 a 8 · I nominal', 'Estrella-triángulo: I arranque ≈ 1/3 de la directa'],
          faq: [
            { p: '¿Qué es la autorretención o enclavamiento?', r: 'Es el contacto auxiliar NO del contactor conectado en paralelo con el pulsador de marcha. Cuando el contactor se activa, ese contacto se cierra y mantiene alimentada la bobina aunque sueltes el pulsador. Solo el pulsador de paro (NC) o el relé térmico la desconectan.' },
            { p: '¿Por qué el pulsador de paro es normalmente cerrado?', r: 'Por seguridad: si se corta su cable, el circuito se abre y la máquina se detiene. Con un NO, un cable roto impediría parar.' }
          ], ej: [], dg: ['arranque', 'ladder'] },
        { id: 'trifasica', titulo: 'Sistemas trifásicos y motores de inducción',
          resumen: '- Red trifásica típica: 380 V entre fases (o 220 V en algunas redes del Perú) y 60 Hz.\n- **Potencia trifásica:** P = √3·V_L·I_L·cos φ.\n- **Velocidad síncrona:** ns = 120·f/p (p = número de polos). El rotor gira un poco más lento: **deslizamiento** s = (ns − n)/ns.\n- La **placa** del motor indica potencia útil (kW o HP; 1 HP = 746 W), tensión, corriente, cos φ, rendimiento y conexión (estrella / triángulo).\n- Para invertir el giro basta intercambiar **dos** fases.',
          formulas: ['P = √3 · V · I · cos φ', 'I = P_útil / (√3 · V · cos φ · η)', 'ns = 120 · f / p', 's = (ns − n) / ns'],
          faq: [
            { p: '¿Cómo conecto un motor de 220/380 V?', r: 'Si la red es de 380 V entre fases, en **estrella**; si es de 220 V entre fases, en **triángulo**. La tensión menor de la placa corresponde siempre a triángulo.' }
          ], ej: ['trifasica', 'sincrona'], dg: ['arranque'] },
        { id: 'plc', titulo: 'PLC y programación Ladder',
          resumen: '- El **PLC** lee entradas (pulsadores, sensores), ejecuta el programa en un **ciclo de escaneo** y actualiza salidas (contactores, válvulas, lámparas).\n- Lenguajes de la norma **IEC 61131-3:** Ladder (LD), bloques de funciones (FBD), texto estructurado (ST), lista de instrucciones y SFC (Grafcet).\n- En Ladder: **--[ ]--** contacto NO, **--[/]--** contacto NC, **--( )--** bobina. Se leen de izquierda a derecha y de arriba abajo.\n- **Temporizadores** TON (retardo a la conexión), TOF (a la desconexión) y **contadores** CTU/CTD.\n- Ojo: un pulsador físico NC de paro se programa con un contacto **NO** en Ladder (porque la entrada ya está en 1 en reposo).',
          formulas: [],
          faq: [
            { p: '¿Puedo usar un Arduino o ESP32 como PLC?', r: 'Para aprender sí, pero en la industria se usan PLC o controladores industriales certificados: entradas aisladas de 24 V, resistencia al ruido y a la temperatura. Existen placas "industrial shields" basadas en Arduino/ESP32 con esas protecciones.' }
          ], ej: [], dg: ['ladder'] },
        { id: 'redes', titulo: 'Comunicaciones industriales',
          resumen: '- **RS-485:** par trenzado diferencial, hasta ≈1200 m y 32 equipos; necesita resistencias de terminación de 120 Ω en los extremos.\n- **Modbus RTU** (sobre RS-485) y **Modbus TCP** (sobre Ethernet): un maestro lee/escribe registros de esclavos (holding registers, coils).\n- **MQTT:** protocolo publicar/suscribir muy liviano para IoT; un **broker** reparte los mensajes por temas ("planta/linea1/temperatura").\n- **OPC UA:** estándar para intercambiar datos entre máquinas y sistemas SCADA/MES con seguridad.\n- Pirámide de automatización: campo → control (PLC) → supervisión (SCADA/HMI) → gestión (MES/ERP).',
          formulas: [],
          faq: [
            { p: '¿Cuál es la diferencia entre Modbus y MQTT?', r: 'Modbus es pregunta-respuesta (el maestro pregunta a cada equipo) y es típico dentro de la planta. MQTT es publicar/suscribir a través de un broker y es ideal para enviar datos a la nube o a tableros IoT.' }
          ], ej: [], dg: [] },
        { id: 'iiot', titulo: 'IoT industrial con ESP32',
          resumen: 'Arquitectura típica de un nodo IoT:\n1. **Sensor** (temperatura, corriente, vibración) → acondicionamiento → ESP32.\n2. **Conectividad:** WiFi, Ethernet, LoRa o RS-485.\n3. **Protocolo:** MQTT (con TLS) o HTTP hacia un broker o servidor.\n4. **Plataforma:** base de datos de series de tiempo y tablero (dashboard) con alarmas.\nBuenas prácticas: reconexión automática, **watchdog**, enviar datos con marca de tiempo, almacenar si no hay red, contraseñas fuera del código, actualización OTA y alimentación protegida.',
          formulas: ['Consumo de batería: horas ≈ capacidad (mAh) / corriente media (mA)'],
          faq: [
            { p: '¿Cómo hago que mi ESP32 dure meses con batería?', r: 'Usa deep sleep (≈10 µA), despierta cada cierto tiempo, mide, envía y vuelve a dormir. El WiFi consume 100–250 mA: mantenlo encendido el menor tiempo posible.' }
          ], ej: ['bateria', 'adc'], dg: [] },
        { id: 'robotica', titulo: 'Robótica: actuadores y control de movimiento',
          resumen: '- **Motor DC + puente H:** giro y velocidad con PWM. Con **encoder** se mide la velocidad real y se controla con PID.\n- **Servo:** posición de 0° a 180° con un pulso de 1 a 2 ms cada 20 ms.\n- **Paso a paso:** gira en pasos fijos (típico 1,8° = 200 pasos/vuelta); con **micropasos** (A4988, DRV8825) se mejora la suavidad.\n- **Cinemática:** relaciona los ángulos de las articulaciones con la posición del efector. Robot móvil diferencial: v = (vR + vL)/2.\n- **Sensores:** ultrasonido, IR, IMU (MPU-6050), encoders, LIDAR.',
          formulas: ['Pasos = ángulo / ángulo_por_paso · micropasos', 'Velocidad lineal = 2π · r · rpm / 60', 'Robot diferencial: v = (vR + vL) / 2 ; ω = (vR − vL) / L'],
          faq: [
            { p: '¿Por qué el servo tiembla?', r: 'Casi siempre es alimentación insuficiente. Un servo SG90 puede pedir 500 mA en picos: aliméntalo con una fuente de 5 V aparte y une los GND.' }
          ], ej: ['pasos', 'rueda'], dg: ['puente-h'] },
        { id: 'variadores', titulo: 'Variadores de frecuencia y análisis de fallas',
          resumen: '- Un **variador (VFD)** rectifica la red, la guarda en un bus de continua y genera una salida trifásica de frecuencia variable con IGBT y PWM. Controla velocidad, rampas de arranque/parada y protecciones.\n- Parámetros básicos: datos de placa del motor, frecuencia mínima/máxima, rampas, modo de mando (bornes o panel).\n- **Análisis de fallas:** registra el código de error, revisa tensión de red, aislamiento del motor (megóhmetro), sobrecarga mecánica, ventilación y conexiones flojas.\n- Seguridad: bloqueo y etiquetado (**LOTO**), espera a que se descargue el bus de continua antes de abrir.',
          formulas: ['Velocidad ≈ 120 · f / p · (1 − s)'],
          faq: [
            { p: '¿Por qué hay que esperar antes de abrir un variador?', r: 'Los capacitores del bus de continua pueden guardar más de 500 V varios minutos después de apagarlo. Espera el tiempo que indica el fabricante y mide antes de tocar.' }
          ], ej: ['sincrona'], dg: [] }
      ]
    }
  ];

  /* =================================================================
     2) GENERADORES DE EJERCICIOS
     Cada uno devuelve: enunciado, respuesta {v (número), u (unidad)},
     pasos (solución explicada) y opcionalmente nota.
     El alumno escribe su respuesta y se acepta con un margen del 3 %.
     ================================================================= */
  const gen = {
    ohm: { nivel: 'basico', titulo: 'Ley de Ohm', crear() {
      const V = al([5, 9, 12, 24]), R = rE12(100, 4700), I = V / R;
      return { enunciado: `Una resistencia de **${si(R, 'Ω')}** está conectada a una fuente de **${V} V**. ¿Qué corriente circula? (respuesta en mA)`,
        respuesta: { v: I * 1000, u: 'mA' },
        pasos: [`Datos: V = ${V} V, R = ${si(R, 'Ω')} = ${R} Ω`, 'Fórmula: I = V / R', `I = ${V} / ${R} = ${cif(I, 4)} A`, `Pasamos a mA (×1000): **I ≈ ${cif(I * 1000)} mA**`] };
    } },
    potencia: { nivel: 'basico', titulo: 'Potencia en una resistencia', crear() {
      const V = al([5, 9, 12]), R = rE12(47, 1000), P = V * V / R, nom = [0.25, 0.5, 1, 2, 5].find(n => n >= 2 * P) || 10;
      return { enunciado: `Una resistencia de **${si(R, 'Ω')}** recibe **${V} V**. ¿Qué potencia disipa? (en W)`,
        respuesta: { v: P, u: 'W' },
        pasos: ['Fórmula: P = V² / R', `P = ${V}² / ${R} = ${V * V} / ${R}`, `**P ≈ ${cif(P)} W**`, `Elige una resistencia de al menos el doble: **${nom} W**.`] };
    } },
    serie: { nivel: 'basico', titulo: 'Resistencias en serie', crear() {
      const r = [rE12(100, 4700), rE12(100, 4700), rE12(100, 4700)], V = al([9, 12]), Rt = r[0] + r[1] + r[2], I = V / Rt;
      return { enunciado: `Tres resistencias en serie de **${r.map(x => si(x, 'Ω')).join(', ')}** se conectan a **${V} V**. ¿Cuál es la caída de tensión en la segunda resistencia? (en V)`,
        respuesta: { v: I * r[1], u: 'V' },
        pasos: [`Resistencia total: Rt = ${r.join(' + ')} = ${Rt} Ω`, `Corriente (la misma en todas): I = ${V} / ${Rt} = ${cif(I * 1000)} mA`, `Caída en R2: V2 = I · R2 = ${cif(I, 4)} · ${r[1]}`, `**V2 ≈ ${cif(I * r[1])} V**`] };
    } },
    paralelo: { nivel: 'basico', titulo: 'Resistencias en paralelo', crear() {
      const a = rE12(100, 10000), b = rE12(100, 10000), Rt = a * b / (a + b);
      return { enunciado: `¿Cuál es la resistencia equivalente de **${si(a, 'Ω')}** en paralelo con **${si(b, 'Ω')}**? (en Ω)`,
        respuesta: { v: Rt, u: 'Ω' },
        pasos: ['Para dos resistencias: Rt = (R1 · R2) / (R1 + R2)', `Rt = (${a} · ${b}) / (${a} + ${b}) = ${a * b} / ${a + b}`, `**Rt ≈ ${si(Rt, 'Ω')}** (menor que la menor de las dos ✔)`] };
    } },
    led: { nivel: 'basico', titulo: 'Resistencia para un LED', crear() {
      const led = al([['rojo', 2], ['verde', 2.1], ['azul', 3], ['blanco', 3.1], ['amarillo', 2.1]]), V = al([5, 9, 12]), I = al([10, 15, 20]), R = (V - led[1]) / (I / 1000);
      return { enunciado: `Quieres encender un LED **${led[0]}** (V_LED ≈ ${String(led[1]).replace('.', ',')} V) con **${V} V** y una corriente de **${I} mA**. ¿Qué resistencia necesitas? (en Ω)`,
        respuesta: { v: R, u: 'Ω' },
        pasos: ['Fórmula: R = (Vfuente − V_LED) / I', `R = (${V} − ${led[1]}) / ${I / 1000} A`, `**R ≈ ${cif(R)} Ω**`, `Valor comercial inmediato superior: **${si(comMayor(R), 'Ω')}** (con un valor mayor la corriente baja un poco: más seguro).`, `Potencia: P = I²·R ≈ ${cif((I / 1000) ** 2 * R * 1000)} mW → 1/4 W es suficiente.`] };
    } },
    divisor: { nivel: 'intermedio', titulo: 'Divisor de tensión', crear() {
      const Vin = al([5, 9, 12]), R1 = rE12(1000, 47000), R2 = rE12(1000, 47000), Vo = Vin * R2 / (R1 + R2);
      return { enunciado: `En un divisor de tensión, R1 = **${si(R1, 'Ω')}** (arriba) y R2 = **${si(R2, 'Ω')}** (abajo, a GND), con Vin = **${Vin} V**. ¿Cuánto vale Vout? (en V)`,
        respuesta: { v: Vo, u: 'V' },
        pasos: ['Fórmula: Vout = Vin · R2 / (R1 + R2)', `Vout = ${Vin} · ${R2} / (${R1} + ${R2})`, `**Vout ≈ ${cif(Vo)} V**`, Vo > 3.3 ? 'Ojo: es mayor que 3,3 V, no lo conectes directo a un pin del ESP32.' : 'Este valor sí se puede leer con el ADC de un ESP32 (máx. 3,3 V).'] };
    } },
    puente: { nivel: 'avanzado', titulo: 'Puente de Wheatstone', crear() {
      const R1 = rE12(1000, 10000), R2 = rE12(1000, 10000), R3 = rE12(1000, 10000), Rx = R3 * R2 / R1;
      return { enunciado: `Un puente de Wheatstone está **en equilibrio** (0 V entre sus puntos medios) con R1 = ${si(R1, 'Ω')}, R2 = ${si(R2, 'Ω')} y R3 = ${si(R3, 'Ω')}. ¿Cuánto vale Rx? (en Ω)`,
        respuesta: { v: Rx, u: 'Ω' },
        pasos: ['En equilibrio: R1 / R2 = R3 / Rx  →  Rx = R3 · R2 / R1', `Rx = ${R3} · ${R2} / ${R1}`, `**Rx ≈ ${si(Rx, 'Ω')}**`] };
    } },
    bjt: { nivel: 'intermedio', titulo: 'Transistor como interruptor', crear() {
      const Ic = al([70, 90, 100, 150, 200]), beta = al([100, 150, 200]), Vc = al([5, 3.3]), Ib = 10 * Ic / beta, Rb = (Vc - 0.7) / (Ib / 1000);
      return { enunciado: `Un transistor NPN (β = ${beta}) debe activar un relé que consume **${Ic} mA**. Se controla desde un pin de **${String(Vc).replace('.', ',')} V**. Usando un factor de saturación de 10, ¿qué resistencia de base necesitas? (en Ω)`,
        respuesta: { v: Rb, u: 'Ω' },
        pasos: [`I_B mínima = I_C / β = ${Ic} / ${beta} = ${cif(Ic / beta)} mA`, `Con factor 10 (saturación segura): I_B = ${cif(Ib)} mA`, `R_B = (V_control − 0,7) / I_B = (${Vc} − 0,7) / ${cif(Ib / 1000, 4)} A`, `**R_B ≈ ${cif(Rb)} Ω** → comercial menor: ${si([...E12].reverse().map(m => m * Math.pow(10, Math.floor(Math.log10(Rb)))).find(v => v <= Rb) || Rb, 'Ω')}`, `Revisa: I_B = ${cif(Ib)} mA no supera los 20 mA del pin ✔. Y no olvides el diodo 1N4007 en la bobina.`] };
    } },
    transformador: { nivel: 'intermedio', titulo: 'Relación de transformación', crear() {
      const Vp = 220, Np = al([1100, 2200, 880]), Vs = al([6, 9, 12, 24]), Ns = Vp ? Np * Vs / Vp : 0;
      return { enunciado: `Un transformador con primario de **${Np} vueltas** conectado a **220 V** debe entregar **${Vs} V** en el secundario. ¿Cuántas vueltas debe tener el secundario?`,
        respuesta: { v: Ns, u: 'vueltas' },
        pasos: ['Relación: Vp / Vs = Np / Ns  →  Ns = Np · Vs / Vp', `Ns = ${Np} · ${Vs} / 220`, `**Ns ≈ ${cif(Ns)} vueltas**`] };
    } },
    rizado: { nivel: 'intermedio', titulo: 'Rizado del filtro', crear() {
      const I = al([0.2, 0.5, 1]), C = al([1000, 2200, 4700]), f = 60, Vr = I / (2 * f * C * 1e-6);
      return { enunciado: `Una fuente con puente rectificador (onda completa) a **60 Hz** entrega **${String(I).replace('.', ',')} A** y tiene un capacitor de filtro de **${C} µF**. ¿Cuál es el rizado aproximado? (en V)`,
        respuesta: { v: Vr, u: 'V' },
        pasos: ['Onda completa: la frecuencia del rizado es 2 · 60 = 120 Hz', 'Fórmula: Vr ≈ I / (2 · f · C)', `Vr ≈ ${I} / (120 · ${C}·10⁻⁶)`, `**Vr ≈ ${cif(Vr)} V** — con un capacitor más grande el rizado baja.`] };
    } },
    zener: { nivel: 'intermedio', titulo: 'Regulador con Zener', crear() {
      const Vin = al([9, 12, 15]), Vz = al([5.1, 3.3, 6.2]), IL = al([10, 20, 30]), Iz = 5, Rs = (Vin - Vz) / ((IL + Iz) / 1000);
      return { enunciado: `Un Zener de **${String(Vz).replace('.', ',')} V** regula a partir de **${Vin} V** y alimenta una carga de **${IL} mA**. Si quieres que por el Zener circulen ${Iz} mA, ¿qué resistencia serie necesitas? (en Ω)`,
        respuesta: { v: Rs, u: 'Ω' },
        pasos: ['Rs = (Vin − Vz) / (Iz + I_carga)', `Rs = (${Vin} − ${Vz}) / (${Iz} + ${IL}) mA`, `**Rs ≈ ${cif(Rs)} Ω**`, `Potencia en Rs: (${cif(Vin - Vz)} V)² / ${cif(Rs)} Ω ≈ ${cif((Vin - Vz) ** 2 / Rs)} W.`] };
    } },
    rc: { nivel: 'intermedio', titulo: 'Constante de tiempo RC', crear() {
      const R = rE12(1000, 100000), C = al([10, 47, 100, 220, 470]), tau = R * C * 1e-6;
      return { enunciado: `Un capacitor de **${C} µF** se carga a través de una resistencia de **${si(R, 'Ω')}**. ¿En cuánto tiempo queda prácticamente cargado (5τ)? (en s)`,
        respuesta: { v: 5 * tau, u: 's' },
        pasos: [`τ = R · C = ${R} Ω · ${C}·10⁻⁶ F = ${cif(tau)} s`, `5τ = 5 · ${cif(tau)}`, `**t ≈ ${cif(5 * tau)} s** (en 1τ llega al 63 %).`] };
    } },
    ne555: { nivel: 'intermedio', titulo: '555 en modo astable', crear() {
      const R1 = rE12(1000, 10000), R2 = rE12(10000, 100000), C = al([1, 4.7, 10, 22]), f = 1.44 / ((R1 + 2 * R2) * C * 1e-6);
      return { enunciado: `Un 555 astable tiene R1 = **${si(R1, 'Ω')}**, R2 = **${si(R2, 'Ω')}** y C = **${String(C).replace('.', ',')} µF**. ¿Qué frecuencia genera? (en Hz)`,
        respuesta: { v: f, u: 'Hz' },
        pasos: ['f = 1,44 / ((R1 + 2·R2) · C)', `f = 1,44 / ((${R1} + 2·${R2}) · ${C}·10⁻⁶)`, `**f ≈ ${cif(f)} Hz** (periodo ≈ ${cif(1 / f)} s)`] };
    } },
    opamp: { nivel: 'intermedio', titulo: 'Ganancia del amplificador operacional', crear() {
      const inv = Math.random() < 0.5, Rf = rE12(10000, 220000), Rg = rE12(1000, 22000), Vin = al([0.1, 0.2, 0.5]);
      const G = inv ? -Rf / Rg : 1 + Rf / Rg;
      return { enunciado: `Un amplificador **${inv ? 'inversor' : 'no inversor'}** tiene Rf = **${si(Rf, 'Ω')}** y ${inv ? 'Rin' : 'Rg'} = **${si(Rg, 'Ω')}**. Si la entrada es **${String(Vin).replace('.', ',')} V**, ¿cuánto vale la salida? (en V, con signo)`,
        respuesta: { v: G * Vin, u: 'V' },
        pasos: [inv ? 'Inversor: G = −Rf / Rin' : 'No inversor: G = 1 + Rf / Rg', `G = ${inv ? '−' : '1 + '}${Rf} / ${Rg} = ${cif(G)}`, `Vout = G · Vin = ${cif(G)} · ${Vin}`, `**Vout ≈ ${cif(G * Vin)} V**`, 'Recuerda: la salida no puede superar la alimentación del amplificador.'] };
    } },
    binario: { nivel: 'intermedio', titulo: 'Binario a decimal', crear() {
      const n = 1 + Math.floor(Math.random() * 254), b = n.toString(2).padStart(8, '0');
      const partes = b.split('').map((d, i) => d === '1' ? `2^${7 - i}` : null).filter(Boolean);
      return { enunciado: `¿Qué número decimal representa el byte **${b}**?`, respuesta: { v: n, u: '' },
        pasos: ['Cada bit vale 2 elevado a su posición (de derecha a izquierda, empezando en 0).', `Bits en 1: ${partes.join(' + ')}`, `= ${partes.map(p => Math.pow(2, +p.split('^')[1])).join(' + ')}`, `**= ${n}** (en hexadecimal: 0x${n.toString(16).toUpperCase().padStart(2, '0')})`] };
    } },
    adc: { nivel: 'intermedio', titulo: 'Lectura del ADC', crear() {
      const esp = Math.random() < 0.5, Vref = esp ? 3.3 : 5, bits = esp ? 12 : 10, max = Math.pow(2, bits) - 1, V = cif(Math.random() * Vref * 0.9 + 0.1, 2), L = Math.round(V / Vref * max);
      return { enunciado: `Un **${esp ? 'ESP32' : 'Arduino UNO'}** (ADC de ${bits} bits, referencia ${String(Vref).replace('.', ',')} V) mide una tensión de **${String(V).replace('.', ',')} V**. ¿Qué número devuelve analogRead()?`,
        respuesta: { v: L, u: '' },
        pasos: [`Valor máximo: 2^${bits} − 1 = ${max}`, 'Lectura = V / Vref · máximo', `Lectura = ${V} / ${Vref} · ${max}`, `**≈ ${L}**`, esp ? 'Nota: el ADC del ESP32 no es perfectamente lineal cerca de 0 V y de 3,3 V.' : ''].filter(Boolean) };
    } },
    pwm: { nivel: 'intermedio', titulo: 'Tensión media con PWM', crear() {
      const V = al([5, 12, 24]), val = al([64, 100, 128, 191, 200]), D = val / 255;
      return { enunciado: `Con analogWrite(pin, **${val}**) un driver aplica PWM de **${V} V** a un motor. ¿Qué tensión media recibe el motor? (en V)`,
        respuesta: { v: D * V, u: 'V' },
        pasos: ['analogWrite usa 8 bits: 0 a 255.', `Ciclo de trabajo D = ${val} / 255 = ${cif(D * 100)} %`, `V media = D · V = ${cif(D)} · ${V}`, `**≈ ${cif(D * V)} V**`] };
    } },
    monofasica: { nivel: 'avanzado', titulo: 'Potencia monofásica', crear() {
      const I = al([2, 4.5, 6, 8, 10]), fp = al([0.75, 0.8, 0.85, 0.9]), P = 220 * I * fp;
      return { enunciado: `Una carga conectada a **220 V** consume **${String(I).replace('.', ',')} A** con un factor de potencia de **${String(fp).replace('.', ',')}**. ¿Cuál es su potencia activa? (en W)`,
        respuesta: { v: P, u: 'W' },
        pasos: ['P = V · I · cos φ', `P = 220 · ${I} · ${fp}`, `**P ≈ ${cif(P)} W**`, `Potencia aparente S = V·I = ${cif(220 * I)} VA.`] };
    } },
    fp: { nivel: 'avanzado', titulo: 'Corrección del factor de potencia', crear() {
      const P = al([1000, 1500, 2000, 3000]), fp1 = al([0.7, 0.75, 0.8]), fp2 = 0.95;
      const t1 = Math.tan(Math.acos(fp1)), t2 = Math.tan(Math.acos(fp2)), Qc = P * (t1 - t2), C = Qc / (2 * Math.PI * 60 * 220 * 220);
      return { enunciado: `Un motor monofásico de **${P} W** trabaja a 220 V, 60 Hz con cos φ = **${String(fp1).replace('.', ',')}**. ¿Qué capacitor en paralelo lo lleva a cos φ = 0,95? (en µF)`,
        respuesta: { v: C * 1e6, u: 'µF' },
        pasos: [`tan φ1 = tan(acos ${fp1}) = ${cif(t1)}`, `tan φ2 = tan(acos 0,95) = ${cif(t2)}`, `Qc = P · (tan φ1 − tan φ2) = ${P} · ${cif(t1 - t2)} = ${cif(Qc)} VAR`, `C = Qc / (2π · f · V²) = ${cif(Qc)} / (2π · 60 · 220²)`, `**C ≈ ${cif(C * 1e6)} µF** (capacitor de marcha para CA, tensión ≥ 250 V CA)`] };
    } },
    filtro: { nivel: 'avanzado', titulo: 'Frecuencia de corte RC', crear() {
      const R = rE12(1000, 100000), C = al([10, 47, 100, 220, 1000]), fc = 1 / (2 * Math.PI * R * C * 1e-9);
      return { enunciado: `Un filtro RC pasa bajos tiene R = **${si(R, 'Ω')}** y C = **${C} nF**. ¿Cuál es su frecuencia de corte? (en Hz)`,
        respuesta: { v: fc, u: 'Hz' },
        pasos: ['fc = 1 / (2π · R · C)', `fc = 1 / (2π · ${R} · ${C}·10⁻⁹)`, `**fc ≈ ${si(fc, 'Hz')}**`, 'En esa frecuencia la salida es el 70,7 % de la entrada (−3 dB).'] };
    } },
    lazo420: { nivel: 'avanzado', titulo: 'Escalado 4–20 mA', crear() {
      const max = al([10, 100, 150, 250]), uni = al(['bar', '°C', '%', 'm³/h']), I = cif(4 + Math.random() * 16, 3), v = (I - 4) / 16 * max;
      return { enunciado: `Un transmisor 4–20 mA mide de **0 a ${max} ${uni}**. Si entrega **${String(I).replace('.', ',')} mA**, ¿cuál es el valor medido? (en ${uni})`,
        respuesta: { v, u: uni },
        pasos: ['Valor = mín + (I − 4) / 16 · (máx − mín)', `Valor = 0 + (${I} − 4) / 16 · ${max}`, `**≈ ${cif(v)} ${uni}**`, `Con una resistencia de 250 Ω esa corriente da ${cif(I * 0.25)} V para el ADC.`] };
    } },
    pt100: { nivel: 'avanzado', titulo: 'Sensor PT100', crear() {
      const T = al([25, 40, 60, 80, 100, 150]), R = 100 * (1 + 0.00385 * T);
      return { enunciado: `Un sensor **PT100** está a **${T} °C**. Usando α = 0,00385 /°C, ¿qué resistencia presenta? (en Ω)`,
        respuesta: { v: R, u: 'Ω' },
        pasos: ['R = R0 · (1 + α · T), con R0 = 100 Ω', `R = 100 · (1 + 0,00385 · ${T})`, `**R ≈ ${cif(R, 4)} Ω**`] };
    } },
    trifasica: { nivel: 'industrial', titulo: 'Corriente de un motor trifásico', crear() {
      const kW = al([1.5, 2.2, 4, 5.5, 7.5, 11]), V = al([380, 220]), fp = al([0.8, 0.82, 0.85]), ef = al([0.82, 0.85, 0.88]), I = kW * 1000 / (Math.sqrt(3) * V * fp * ef);
      return { enunciado: `Un motor trifásico de **${String(kW).replace('.', ',')} kW** (potencia útil) trabaja a **${V} V** con cos φ = ${String(fp).replace('.', ',')} y rendimiento η = ${String(ef).replace('.', ',')}. ¿Qué corriente de línea consume? (en A)`,
        respuesta: { v: I, u: 'A' },
        pasos: ['I = P_útil / (√3 · V · cos φ · η)', `I = ${kW * 1000} / (1,732 · ${V} · ${fp} · ${ef})`, `**I ≈ ${cif(I)} A**`, `Arranque directo: ≈ ${cif(6 * I)} – ${cif(8 * I)} A por unos segundos. Ajusta el relé térmico a ≈ ${cif(I)} A.`] };
    } },
    sincrona: { nivel: 'industrial', titulo: 'Velocidad y deslizamiento', crear() {
      const p = al([2, 4, 6]), ns = 120 * 60 / p, n = Math.round(ns * (1 - al([0.03, 0.04, 0.05]))), s = (ns - n) / ns * 100;
      return { enunciado: `Un motor de inducción de **${p} polos** a **60 Hz** gira a **${n} rpm**. ¿Cuál es su deslizamiento? (en %)`,
        respuesta: { v: s, u: '%' },
        pasos: ['Velocidad síncrona: ns = 120 · f / p', `ns = 120 · 60 / ${p} = ${ns} rpm`, 's = (ns − n) / ns · 100', `s = (${ns} − ${n}) / ${ns} · 100`, `**s ≈ ${cif(s)} %**`] };
    } },
    bateria: { nivel: 'industrial', titulo: 'Autonomía de un nodo IoT', crear() {
      const mAh = al([1000, 2000, 2500, 3000]), act = al([80, 120, 160]), tAct = al([2, 5, 10]), per = al([60, 300, 600]), sleep = 0.01;
      const media = (act * tAct + sleep * (per - tAct)) / per, h = mAh / media;
      return { enunciado: `Un ESP32 despierta cada **${per} s**, trabaja **${tAct} s** consumiendo **${act} mA** y el resto del tiempo duerme a 10 µA. Con una batería de **${mAh} mAh**, ¿cuántas horas dura? (en h, sin pérdidas)`,
        respuesta: { v: h, u: 'h' },
        pasos: ['Corriente media = (I_activo · t_activo + I_sueño · t_sueño) / periodo', `= (${act} · ${tAct} + 0,01 · ${per - tAct}) / ${per} = ${cif(media)} mA`, `Autonomía = ${mAh} / ${cif(media)}`, `**≈ ${cif(h)} h** (≈ ${cif(h / 24)} días). En la práctica cuenta 20–30 % menos.`] };
    } },
    pasos: { nivel: 'industrial', titulo: 'Motor paso a paso', crear() {
      const ang = al([90, 180, 270, 360, 45]), micro = al([1, 2, 8, 16]), n = ang / 1.8 * micro;
      return { enunciado: `Un motor paso a paso de **1,8° por paso** con un driver en **1/${micro} de micropaso** debe girar **${ang}°**. ¿Cuántos pulsos hay que enviar?`,
        respuesta: { v: n, u: 'pulsos' },
        pasos: [`Pasos completos: ${ang} / 1,8 = ${cif(ang / 1.8)}`, `Con micropasos ×${micro}: ${cif(ang / 1.8)} · ${micro}`, `**= ${cif(n)} pulsos**`] };
    } },
    rueda: { nivel: 'industrial', titulo: 'Velocidad de un robot', crear() {
      const d = al([65, 80, 100]), rpm = al([100, 150, 200, 300]), v = Math.PI * d / 1000 * rpm / 60;
      return { enunciado: `Un robot móvil tiene ruedas de **${d} mm** de diámetro y sus motores giran a **${rpm} rpm**. ¿A qué velocidad avanza? (en m/s)`,
        respuesta: { v, u: 'm/s' },
        pasos: ['Perímetro de la rueda = π · d', `= π · ${d / 1000} m = ${cif(Math.PI * d / 1000)} m`, `v = perímetro · rpm / 60 = ${cif(Math.PI * d / 1000)} · ${rpm} / 60`, `**v ≈ ${cif(v)} m/s**`] };
    } }
  };

  /* =================================================================
     3) DIAGRAMAS PARA APRENDER A LEER ESQUEMAS
     Se dibujan en SVG con colores del tema (currentColor).
     ================================================================= */
  // Piezas de dibujo reutilizables (coordenadas en píxeles del SVG)
  const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const T = (x, y, t, anc = 'middle', cl = '') => `<text x="${x}" y="${y}" text-anchor="${anc}" class="${cl}">${t}</text>`;
  const P = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" class="nodo"/>`;
  const resH = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot || 0})"><polyline points="-30,0 -20,0 -16,-7 -8,7 0,-7 8,7 16,-7 20,0 30,0"/></g>`;   // resistencia (60 px)
  const bat = (x, y, et) => `<g transform="translate(${x},${y})">${L(-16, -4, 16, -4)}${L(-8, 4, 8, 4)}${T(22, -6, '+', 'start')}${T(22, 12, '−', 'start')}${T(-24, 4, et, 'end')}</g>`; // batería vertical
  const diodo = (x, y, rot, led) => `<g transform="translate(${x},${y}) rotate(${rot || 0})"><polygon points="-10,-10 -10,10 8,0" class="relleno"/>${L(8, -10, 8, 10)}${L(-30, 0, -10, 0)}${L(8, 0, 30, 0)}${led ? '<polyline points="0,-14 8,-24"/><polyline points="6,-14 14,-24"/>' : ''}</g>`;
  const tierra = (x, y) => `<g>${L(x, y, x, y + 8)}${L(x - 12, y + 8, x + 12, y + 8)}${L(x - 7, y + 13, x + 7, y + 13)}${L(x - 3, y + 18, x + 3, y + 18)}</g>`;
  const svg = (w, h, cuerpo) => `<svg viewBox="0 0 ${w} ${h}" class="tut-svg" role="img"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${cuerpo}</g></svg>`;

  const diagramas = [
    { id: 'led', nivel: 'basico', titulo: 'LED con resistencia limitadora',
      desc: 'Batería de 9 V, resistencia de 470 Ω y un LED rojo (≈2 V) en serie.',
      svg: svg(360, 200, bat(60, 100, '9 V') + L(60, 96, 60, 40) + L(60, 40, 120, 40) + resH(150, 40) + T(150, 28, 'R1 470 Ω') + L(180, 40, 280, 40) + L(280, 40, 280, 70) + diodo(280, 100, 90, true) + T(300, 104, 'LED1', 'start') + L(280, 130, 280, 160) + L(280, 160, 60, 160) + L(60, 160, 60, 104)),
      preguntas: [
        { p: '¿Qué corriente aproximada circula por el LED?', ops: ['≈ 15 mA', '≈ 4 mA', '≈ 150 mA', '0 mA'], ok: 0, exp: 'I = (9 − 2) / 470 ≈ 0,0149 A ≈ 15 mA: está dentro del rango seguro de 10–20 mA para un LED.' },
        { p: '¿Qué pasa si invertimos el LED?', ops: ['No enciende: queda polarizado en inverso', 'Enciende más fuerte', 'Se quema la resistencia', 'La batería se descarga más rápido'], ok: 0, exp: 'El diodo solo conduce del ánodo al cátodo. Invertido no circula corriente (ni se daña con 9 V en la mayoría de LED, aunque su tensión inversa máxima es ≈5 V: mejor no hacerlo).' },
        { p: '¿Por qué es necesaria R1?', ops: ['Para limitar la corriente del LED', 'Para subir la tensión', 'Para que el LED cambie de color', 'No es necesaria'], ok: 0, exp: 'Sin resistencia la corriente solo la limitaría la resistencia interna de la batería y el LED se quemaría.' }
      ] },
    { id: 'divisor', nivel: 'intermedio', titulo: 'Sensor LDR con divisor de tensión al ADC',
      desc: 'Una LDR (arriba) y una resistencia fija de 10 kΩ (abajo) forman un divisor; el punto medio va a la entrada analógica A0.',
      svg: svg(360, 230, T(80, 20, '+5 V') + L(80, 26, 80, 40) + resH(80, 70, 90) + T(96, 66, 'LDR', 'start') + '<polyline points="50,52 62,62"/><polyline points="44,60 56,70"/>' + L(80, 100, 80, 120) + P(80, 120) + L(80, 120, 240, 120) + T(250, 124, 'A0 (ADC)', 'start') + L(80, 120, 80, 140) + resH(80, 170, 90) + T(96, 174, 'R 10 kΩ', 'start') + L(80, 200, 80, 205) + tierra(80, 205)),
      preguntas: [
        { p: 'Si hay más luz, la resistencia de la LDR baja. ¿Qué pasa con la tensión en A0?', ops: ['Sube', 'Baja', 'No cambia', 'Se vuelve negativa'], ok: 0, exp: 'Vout = 5 · 10k / (R_LDR + 10k). Si R_LDR baja, el cociente aumenta y Vout sube.' },
        { p: 'Con R_LDR = 10 kΩ, ¿cuánto vale A0?', ops: ['2,5 V', '5 V', '0 V', '1,25 V'], ok: 0, exp: 'Resistencias iguales reparten la tensión a la mitad: 5 · 10/(10+10) = 2,5 V (lectura ≈ 512 en un UNO).' },
        { p: '¿Se puede conectar este divisor tal cual a un ESP32?', ops: ['No: puede llegar a 5 V; hay que alimentarlo con 3,3 V', 'Sí, el ESP32 acepta 5 V en el ADC', 'Solo si se quita la resistencia', 'Solo con WiFi apagado'], ok: 0, exp: 'Los pines del ESP32 trabajan a 3,3 V. Alimenta el divisor con 3,3 V para que A0 nunca supere ese valor.' }
      ] },
    { id: 'rele', nivel: 'intermedio', titulo: 'Transistor NPN que activa un relé',
      desc: 'Un pin digital controla la base de un NPN a través de R_B = 1 kΩ. El colector maneja la bobina del relé (12 V) con un diodo 1N4007 en antiparalelo.',
      svg: svg(430, 260, T(250, 20, '+12 V') + L(250, 26, 250, 50) + P(250, 50) + L(250, 50, 330, 50) + L(330, 50, 330, 80) + diodo(330, 105, -90) + T(346, 102, 'D1', 'start') + T(346, 118, '1N4007', 'start') + L(330, 130, 330, 160) + L(330, 160, 250, 160) + P(250, 160) + `<rect x="232" y="80" width="36" height="50"/>` + T(222, 109, 'Bobina', 'end') + L(250, 50, 250, 80) + L(250, 130, 250, 175) + T(30, 214, 'Pin D7') + L(55, 210, 90, 210) + resH(120, 210) + T(120, 198, 'R_B 1 kΩ') + L(150, 210, 215, 210) + L(215, 190, 215, 230) + L(215, 200, 250, 178) + L(215, 220, 250, 242) + '<polygon points="244,234 250,242 240,242" class="relleno"/>' + T(262, 214, 'Q1 NPN', 'start') + L(250, 242, 250, 248) + tierra(250, 248)),
      preguntas: [
        { p: '¿Qué ocurre cuando el pin D7 está en HIGH?', ops: ['Q1 conduce y la bobina del relé se energiza', 'El relé se apaga', 'D1 conduce y se quema', 'Nada, falta un capacitor'], ok: 0, exp: 'Circula corriente por la base, el transistor se satura y conecta la bobina a GND: el relé se activa.' },
        { p: '¿Cuál es la función de D1?', ops: ['Proteger a Q1 del pico de tensión de la bobina al apagarse', 'Encender un indicador', 'Rectificar la corriente alterna', 'Aumentar la ganancia'], ok: 0, exp: 'Es el diodo de rueda libre: cuando Q1 corta, la bobina genera una tensión inversa y D1 la descarga.' },
        { p: '¿Por qué D1 está con el cátodo hacia +12 V?', ops: ['Para no conducir en funcionamiento normal, solo con el pico inverso', 'Para conducir siempre', 'Es indiferente', 'Para limitar la corriente de base'], ok: 0, exp: 'En funcionamiento normal el diodo queda polarizado en inverso; solo conduce con el pico de polaridad opuesta.' }
      ] },
    { id: 'fuente', nivel: 'avanzado', titulo: 'Fuente lineal de 5 V',
      desc: 'Transformador 220/12 V CA → puente rectificador → capacitor de 2200 µF → regulador 7805 → capacitor de 100 nF → salida de 5 V.',
      svg: svg(520, 200, T(30, 70, '220 V') + T(30, 86, 'CA') + `<path d="M62 50 q10 8 0 16 q10 8 0 16 q10 8 0 16 q10 8 0 16"/><path d="M98 50 q-10 8 0 16 q-10 8 0 16 q-10 8 0 16 q-10 8 0 16"/>` + L(76, 46, 76, 118) + L(84, 46, 84, 118) + T(80, 140, 'T1 220/12 V') + L(98, 50, 140, 50) + L(98, 114, 140, 114) + `<rect x="140" y="40" width="70" height="84"/>` + T(175, 78, 'Puente') + T(175, 94, '4 × 1N4007') + L(210, 56, 260, 56) + L(210, 108, 260, 108) + P(260, 56) + P(260, 108) + L(260, 56, 260, 72) + L(250, 72, 270, 72) + `<path d="M250 82 q10 -6 20 0"/>` + L(260, 80, 260, 108) + T(276, 96, 'C1 2200 µF', 'start') + L(260, 56, 340, 56) + `<rect x="340" y="40" width="64" height="40"/>` + T(372, 64, '7805') + L(372, 80, 372, 108) + L(260, 108, 480, 108) + L(404, 56, 480, 56) + P(440, 56) + P(440, 108) + L(440, 56, 440, 76) + L(430, 76, 450, 76) + L(430, 86, 450, 86) + L(440, 86, 440, 108) + T(456, 96, 'C2 100 nF', 'start') + T(490, 60, '+5 V', 'start') + T(490, 112, 'GND', 'start') + tierra(372, 112)),
      preguntas: [
        { p: '¿Qué tensión continua aproximada hay en C1 (sin carga)?', ops: ['≈ 15,6 V (12·√2 menos 2 diodos)', '12 V', '5 V', '220 V'], ok: 0, exp: 'El pico de 12 V CA es 12·1,414 ≈ 17 V; el puente resta ≈1,4 V (dos diodos conducen a la vez): ≈15,6 V.' },
        { p: 'Si la carga consume 0,5 A, ¿cuánto disipa el 7805?', ops: ['≈ 5,3 W: necesita disipador', '≈ 0,5 W', '0 W', '≈ 2,5 W'], ok: 0, exp: 'P = (Vin − Vout) · I ≈ (15,6 − 5) · 0,5 ≈ 5,3 W. Sin disipador se protege por temperatura y se apaga.' },
        { p: '¿Para qué sirve C2 de 100 nF?', ops: ['Estabiliza el regulador y filtra ruido de alta frecuencia', 'Almacena la energía principal', 'Rectifica la señal', 'Reduce la tensión a 3,3 V'], ok: 0, exp: 'Los reguladores necesitan capacitores pequeños cerca de sus patas para no oscilar y para filtrar ruido rápido.' }
      ] },
    { id: 'puente-h', nivel: 'avanzado', titulo: 'Puente H para un motor DC',
      desc: 'Cuatro interruptores (Q1 a Q4) controlan el sentido de giro de un motor M.',
      svg: svg(360, 260, T(180, 20, '+V') + L(180, 26, 180, 40) + L(80, 40, 280, 40) + L(80, 40, 80, 70) + L(280, 40, 280, 70) + `<rect x="64" y="70" width="32" height="40"/><rect x="264" y="70" width="32" height="40"/><rect x="64" y="150" width="32" height="40"/><rect x="264" y="150" width="32" height="40"/>` + T(80, 95, 'Q1') + T(280, 95, 'Q2') + T(80, 175, 'Q3') + T(280, 175, 'Q4') + L(80, 110, 80, 150) + L(280, 110, 280, 150) + P(80, 130) + P(280, 130) + L(80, 130, 150, 130) + L(210, 130, 280, 130) + `<circle cx="180" cy="130" r="30"/>` + T(180, 136, 'M') + L(80, 190, 80, 215) + L(280, 190, 280, 215) + L(80, 215, 280, 215) + tierra(180, 215)),
      preguntas: [
        { p: '¿Qué interruptores se cierran para que el motor gire en un sentido?', ops: ['Q1 y Q4', 'Q1 y Q3', 'Q2 y Q4', 'Los cuatro'], ok: 0, exp: 'Q1 lleva +V al lado izquierdo y Q4 lleva el lado derecho a GND: la corriente cruza el motor de izquierda a derecha. Para el otro sentido: Q2 y Q3.' },
        { p: '¿Qué pasa si se cierran Q1 y Q3 a la vez?', ops: ['Cortocircuito de la fuente (shoot-through)', 'El motor frena', 'El motor gira más rápido', 'Nada'], ok: 0, exp: 'Q1 y Q3 unen +V con GND sin pasar por el motor: corriente enorme, transistores quemados. Los drivers incluyen "tiempo muerto" para evitarlo.' },
        { p: '¿Cómo se regula la velocidad del motor?', ops: ['Aplicando PWM a uno de los interruptores activos', 'Cambiando el orden de Q1 a Q4', 'Con un capacitor en serie', 'No se puede'], ok: 0, exp: 'El PWM cambia la tensión media sobre el motor y, con ella, su velocidad.' }
      ] },
    { id: 'arranque', nivel: 'industrial', titulo: 'Arranque directo con enclavamiento (mando)',
      desc: 'Circuito de mando: F2 (relé térmico, NC 95-96) → S0 (paro, NC) → S1 (marcha, NO) en paralelo con KM1 13-14 → bobina KM1 (A1-A2).',
      svg: svg(360, 330, T(60, 20, 'L (fase)') + L(60, 26, 60, 40) + L(60, 40, 60, 50) + L(60, 50, 72, 70) + L(60, 70, 60, 84) + T(80, 66, 'F2 95-96 (térmico NC)', 'start') + L(56, 54, 70, 54) + L(60, 84, 60, 96) + L(60, 96, 72, 116) + L(60, 116, 60, 130) + L(54, 102, 72, 102) + T(80, 110, 'S0 paro (NC)', 'start') + P(60, 130) + L(60, 130, 160, 130) + L(60, 130, 60, 150) + L(60, 150, 74, 166) + L(60, 168, 60, 186) + L(66, 150, 66, 158) + T(8, 160, 'S1', 'start') + T(8, 176, 'marcha', 'start') + L(160, 130, 160, 150) + L(160, 150, 174, 166) + L(160, 168, 160, 186) + T(182, 166, 'KM1 13-14 (NO)', 'start') + L(60, 186, 160, 186) + P(60, 186) + P(160, 186) + L(110, 186, 110, 216) + `<rect x="90" y="216" width="40" height="34"/>` + T(110, 238, 'KM1') + T(138, 230, 'A1', 'start') + T(138, 250, 'A2', 'start') + L(110, 250, 110, 290) + T(110, 308, 'N (neutro)')),
      preguntas: [
        { p: 'Al pulsar y soltar S1, ¿por qué KM1 sigue activado?', ops: ['Porque su contacto 13-14 se cierra y mantiene la bobina alimentada (autorretención)', 'Porque S1 queda trabado', 'Porque F2 lo mantiene', 'No sigue activado'], ok: 0, exp: 'El contacto auxiliar NO de KM1 está en paralelo con S1; al activarse la bobina, ese contacto se cierra y la alimenta aunque se suelte S1.' },
        { p: '¿Qué ocurre al pulsar S0?', ops: ['Se abre el circuito, KM1 se desactiva y se pierde la autorretención', 'El motor invierte el giro', 'Se dispara el térmico', 'Nada, S0 es de marcha'], ok: 0, exp: 'S0 es NC en serie: al pulsarlo corta la alimentación de la bobina; el contacto 13-14 se abre y el motor queda parado aunque se suelte S0.' },
        { p: 'Si el motor se sobrecarga, ¿qué elemento detiene la máquina?', ops: ['F2, el relé térmico, abriendo su contacto 95-96', 'S1', 'KM1 13-14', 'El neutro'], ok: 0, exp: 'El relé térmico detecta la sobrecorriente en el circuito de potencia y abre su contacto NC en el mando.' }
      ] },
    { id: 'ladder', nivel: 'industrial', titulo: 'Marcha-paro en Ladder (PLC)',
      desc: 'I0.0 = pulsador de marcha (NO), I0.1 = pulsador de paro (cableado NC), Q0.0 = contactor del motor.',
      svg: svg(380, 210, L(20, 20, 20, 190) + L(360, 20, 360, 190) + L(20, 60, 70, 60) + L(70, 46, 70, 74) + L(90, 46, 90, 74) + T(80, 36, 'I0.0') + T(80, 92, 'marcha') + L(90, 60, 160, 60) + L(160, 46, 160, 74) + L(180, 46, 180, 74) + T(170, 36, 'I0.1') + T(170, 92, 'paro') + L(180, 60, 270, 60) + `<path d="M276 46 q-10 14 0 28"/><path d="M304 46 q10 14 0 28"/>` + T(290, 36, 'Q0.0') + T(290, 92, 'motor') + L(310, 60, 360, 60) + L(40, 60, 40, 140) + L(40, 140, 70, 140) + L(70, 126, 70, 154) + L(90, 126, 90, 154) + T(80, 172, 'Q0.0') + L(90, 140, 120, 140) + L(120, 140, 120, 60) + P(40, 60) + P(120, 60)),
      preguntas: [
        { p: 'El pulsador de paro está cableado NC. ¿Por qué en Ladder se usa un contacto NO (--[ ]--) para I0.1?', ops: ['Porque en reposo la entrada ya está en 1; al pulsar pasa a 0 y abre el escalón', 'Es un error, debería ser NC', 'Porque el PLC invierte todas las entradas', 'Para que el motor arranque solo'], ok: 0, exp: 'Con el pulsador NC la entrada I0.1 vale 1 en reposo: el contacto NO del programa está cerrado. Al pulsar, I0.1 = 0 y el escalón se abre. Si el cable se corta, también se para: falla segura.' },
        { p: '¿Qué hace la rama de Q0.0 en paralelo con I0.0?', ops: ['Autorretención: mantiene la salida activada al soltar marcha', 'Para el motor', 'Invierte el giro', 'Es un temporizador'], ok: 0, exp: 'Es el equivalente en programa al contacto auxiliar 13-14 del contactor.' }
      ] }
  ];

  /* =================================================================
     4) INSTRUCCIONES DEL AGENTE PROFESIONAL DE ELECTRÓNICA
     Este texto se envía a la IA (Claude) como instrucciones de sistema.
     También está en docs/AGENTE_TUTOR.md para leerlo o adaptarlo.
     ================================================================= */
  const agente = `Eres **ELECTRO**, el agente tutor de electrónica de Electroverse, una plataforma educativa peruana para estudiantes de secundaria técnica (EPT), institutos y universidad. Tu especialidad cubre desde cero hasta nivel profesional: electrónica analógica y digital, electricidad, microcontroladores (Arduino UNO, ESP32), electrónica de potencia, automatización industrial (contactores, PLC, variadores), IoT industrial y robótica.

## Cómo respondes
- Siempre en **español latinoamericano**, claro y respetuoso. Usa el Sistema Internacional, coma decimal y valores comerciales reales (resistencias E12/E24, capacitores normalizados).
- Adapta la profundidad al **nivel del estudiante** que se indica en cada mensaje (básico, intermedio, avanzado o industrial). Explica primero la idea con una analogía o ejemplo cotidiano y luego el detalle técnico.
- Estructura habitual: 1) **qué está pasando o qué se pide**, 2) **fórmulas y cálculo paso a paso** con datos, fórmula, reemplazo y resultado con unidades, 3) **cómo verificarlo** (con multímetro, osciloscopio o el simulador), 4) una **pregunta corta** para que el estudiante piense.
- No des solo el resultado: enseña el razonamiento. Si el estudiante pide la respuesta de una tarea, guíalo con pistas y muestra el método; da la solución completa si la pide después de intentarlo.
- Sé breve en preguntas simples (≤ 200 palabras). Para ejercicios, sesiones o documentos puedes extenderte.
- Usa markdown sencillo: títulos cortos, listas, **negritas**, tablas y bloques de código.

## Ejercicios
- Cuando te pidan ejercicios, entrega: enunciado con datos realistas, nivel de dificultad, y la **solución oculta al final** bajo el título "Solución" con pasos numerados.
- Gradúa la dificultad: básico (un concepto, una fórmula), intermedio (dos o tres etapas, elección de componentes comerciales), avanzado (análisis de un sistema, CA, potencia, acondicionamiento), industrial (planos de mando, dimensionamiento de motores y protecciones, lógica PLC, arquitectura IoT).
- Incluye al menos una pregunta de **seguridad** en las series de ejercicios de taller.

## Diagramas de conexión
- Describe las conexiones como una **tabla de conexiones** (origen → destino, color de cable sugerido) y, cuando ayude, dibuja un diagrama con un bloque \`\`\`mermaid (flowchart LR/TB) para el flujo de bloques o señales.
- Para Arduino y ESP32 indica siempre el **pin exacto**, la tensión de trabajo (5 V / 3,3 V), la unión de GND y si hace falta una resistencia, un transistor, un divisor o un conversor de nivel.
- Para mando eléctrico usa la nomenclatura normalizada: L/N o L1-L2-L3, Q (interruptor), F (protecciones: fusible, térmico 95-96/97-98), S0 paro NC, S1 marcha NO, KM bobina A1-A2, contactos 13-14 (NO auxiliar), 21-22 (NC auxiliar), contactos principales 1-2/3-4/5-6. Separa siempre **circuito de potencia** y **circuito de mando**.
- Para PLC usa Ladder en texto: --[ ]-- contacto NO, --[/]-- contacto NC, --( )-- bobina, con la tabla de direcciones (I0.0, Q0.0…). Menciona la norma IEC 61131-3 cuando corresponda.

## Leer y explicar esquemas
- Método: identifica la **alimentación**, divide en **bloques** (fuente, control, potencia, sensores, comunicación), sigue la **señal** de la entrada a la salida, y explica la función de cada componente y su valor.
- Señala errores típicos: GND no unidos, LED sin resistencia, relé sin diodo, entradas flotantes, 5 V en pines de 3,3 V, falta de enclavamiento eléctrico en inversión de giro.

## Diagnóstico de fallas
- Pide o usa los datos disponibles (resumen del circuito, código, mediciones). Propón hipótesis ordenadas de la más probable a la menos probable, y una **medición concreta** para confirmar cada una (qué medir, dónde poner las puntas, qué valor esperar).

## Programación
- Código Arduino/ESP32 comentado en español, simple y compilable: constantes en MAYÚSCULAS al inicio, una función por tarea, sin bloqueos innecesarios (prefiere millis() a delay() en proyectos con varias tareas).
- Para IoT: MQTT con reconexión, watchdog, credenciales fuera del código y comentarios sobre seguridad. Para PLC: Ladder o texto estructurado.

## Seguridad (obligatorio)
- Recuerda los riesgos cuando el tema involucre la red de 220 V/380 V, baterías de litio, capacitores cargados, motores o soldadura. Indica protecciones (fusible, interruptor termomagnético, diferencial de 30 mA, puesta a tierra), trabajo sin tensión y bloqueo/etiquetado (LOTO). Para instalaciones reales en Perú, menciona el Código Nacional de Electricidad y que deben hacerlas personas calificadas.
- No des instrucciones para dañar equipos o personas, ni para saltarse protecciones.

## Honestidad
- Si un dato depende del modelo exacto del componente, dilo y recomienda revisar la hoja de datos. Si no estás seguro, márcalo como "por verificar". No inventes pinouts ni valores.`;

  /* =================================================================
     5) BUSCADOR SIN INTERNET
     Busca en preguntas frecuentes, temas y fórmulas por palabras clave.
     ================================================================= */
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ²µ ]/g, ' ');
  const VACIAS = new Set('el la los las un una unos unas de del al a en y o que como por para con sin mi mis tu se es son esta este esto lo le me porque cual cuales cuanto cuanta hay hace hacer puedo debo sirve sirven funciona qué'.split(' '));
  const palabras = s => norm(s).split(/\s+/).filter(w => w.length > 2 && !VACIAS.has(w));
  let indice = null;
  function crearIndice() {
    indice = [];
    niveles.forEach(n => n.temas.forEach(t => {
      indice.push({ tipo: 'tema', nivel: n, tema: t, texto: palabras(t.titulo + ' ' + t.resumen + ' ' + t.formulas.join(' ')), titulo: palabras(t.titulo) });
      t.faq.forEach(f => indice.push({ tipo: 'faq', nivel: n, tema: t, faq: f, texto: palabras(f.p + ' ' + f.r), titulo: palabras(f.p) }));
    }));
  }
  function buscar(q, max = 3) {
    if (!indice) crearIndice();
    const qs = palabras(q); if (!qs.length) return [];
    const res = indice.map(e => {
      let s = 0;
      qs.forEach(w => {
        if (e.titulo.some(x => x === w)) s += 3; else if (e.titulo.some(x => x.startsWith(w.slice(0, 5)))) s += 2;
        if (e.texto.some(x => x === w)) s += 1; else if (w.length > 4 && e.texto.some(x => x.startsWith(w.slice(0, 5)))) s += 0.5;
      });
      if (e.tipo === 'faq') s *= 1.4;   // las preguntas frecuentes responden más directo
      return { e, s };
    }).filter(r => r.s >= 2).sort((a, b) => b.s - a.s);
    return res.slice(0, max).map(r => r.e);
  }

  window.EV_TUTOR = { version: '13.1.0', niveles, gen, diagramas, agente, buscar, si, cif };
})();
