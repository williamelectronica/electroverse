/* =====================================================================
   ELECTROVERSE v13 · Visor 3D de la Biblioteca
   ---------------------------------------------------------------------
   - Three.js r160 (se carga solo cuando abres una ficha: carga diferida)
   - Materiales PBR, luz de entorno (RoomEnvironment + PMREM),
     tone mapping ACES y sombras suaves
   - OrbitControls (mouse y gestos táctiles), ficha al pasar el mouse,
     etiquetas, vista explosionada animada, pinout y calidad Alta/Media/Baja
   - Dibuja solo cuando algo cambia y libera la memoria (dispose) al cerrar

   Unidades: 1 unidad = 1 milímetro. El eje Y apunta hacia arriba y la
   placa queda acostada en el plano X-Z.
   Los modelos de cada componente están en js/modelos3d.js.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Niveles de calidad ---------- */
  const CALIDAD = {
    alta:  { nombre: 'Alta',  pr: 2,   aa: true,  env: true,  sombras: true,  suaves: true,  mapa: 2048, seg: 32, pxmm: 22, redondeo: true },
    media: { nombre: 'Media', pr: 1.5, aa: true,  env: true,  sombras: true,  suaves: false, mapa: 1024, seg: 18, pxmm: 14, redondeo: true },
    baja:  { nombre: 'Baja',  pr: 1,   aa: false, env: false, sombras: false, suaves: false, mapa: 0,    seg: 10, pxmm: 8,  redondeo: false }
  };

  function calidadInicial() {
    try { const g = localStorage.getItem('ev1:calidad3d'); if (g && CALIDAD[JSON.parse(g)]) return JSON.parse(g); } catch (e) { /* almacenamiento bloqueado */ }
    // En equipos modestos (2 núcleos o menos) empezamos en Baja
    return (navigator.hardwareConcurrency || 4) <= 2 ? 'baja' : 'media';
  }
  function guardarCalidad(q) { try { localStorage.setItem('ev1:calidad3d', JSON.stringify(q)); } catch (e) { /* sin almacenamiento */ } }

  /* ---------- Carga diferida de Three.js (una sola vez) ---------- */
  let promesaThree = null;
  function cargarThree() {
    if (!promesaThree) {
      promesaThree = Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/environments/RoomEnvironment.js'),
        import('three/addons/geometries/RoundedBoxGeometry.js')
      ]).then(([T, oc, re, rb]) => ({ T, OrbitControls: oc.OrbitControls, RoomEnvironment: re.RoomEnvironment, RoundedBoxGeometry: rb.RoundedBoxGeometry }))
        .catch(e => { promesaThree = null; throw e; });
    }
    return promesaThree;
  }

  const suavizar = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // easeInOutCubic
  const escapar = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* =====================================================================
     FÁBRICA DE PIEZAS REUTILIZABLES
     Todas las piezas comparten materiales y estilo; así el código no se repite.
     ===================================================================== */
  function crearFabrica(V) {
    const { T, RoundedBoxGeometry } = V.lib, Q = V.q, F = {};
    const cacheMat = new Map();

    /* ----- Materiales PBR (se reutilizan: un material por combinación) ----- */
    F.mat = (props) => {
      const clave = JSON.stringify(props);
      if (cacheMat.has(clave)) return cacheMat.get(clave);
      const o = Object.assign({}, props);
      // Sin luz de entorno (calidad Baja) el metal puro se ve negro: lo suavizamos
      if (!Q.env && o.metalness > .5) { o.metalness = .35; o.roughness = Math.max(o.roughness || .5, .45); }
      let m;
      if (Q.env && o.clearcoat) m = new T.MeshPhysicalMaterial(o);
      else { delete o.clearcoat; delete o.clearcoatRoughness; m = new T.MeshStandardMaterial(o); }
      cacheMat.set(clave, m);
      return m;
    };
    F.M = {
      oro: () => F.mat({ color: '#d9ab45', metalness: 1, roughness: .26 }),
      estano: () => F.mat({ color: '#c8ccd3', metalness: 1, roughness: .32 }),
      aluminio: () => F.mat({ color: '#b9bec6', metalness: .9, roughness: .38 }),
      negro: () => F.mat({ color: '#141416', metalness: 0, roughness: .78 }),
      epoxi: () => F.mat({ color: '#1b1b1e', metalness: 0, roughness: .5, clearcoat: .2, clearcoatRoughness: .5 }),
      blanco: () => F.mat({ color: '#ececec', metalness: 0, roughness: .6 }),
      plastico: (c, r = .55) => F.mat({ color: c, metalness: 0, roughness: r }),
      pcb: (c) => F.mat({ color: c, metalness: 0, roughness: .48, clearcoat: .35, clearcoatRoughness: .35 }),
      luz: (c, i = 1.4) => F.mat({ color: c, emissive: c, emissiveIntensity: i, roughness: .3 }),
      vidrio: (c, o = .55) => F.mat({ color: c, metalness: 0, roughness: .12, transparent: true, opacity: o })
    };

    /* ----- Geometrías básicas ----- */
    F.caja = (w, h, d, mat, r = 0) => {
      const g = (r > 0 && Q.redondeo && RoundedBoxGeometry) ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new T.BoxGeometry(w, h, d);
      return new T.Mesh(g, mat);
    };
    F.cil = (r1, r2, h, mat, seg = Q.seg, abierto = false) => new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg, 1, abierto), mat);
    F.esfera = (r, mat, parcial = 1) => new T.Mesh(new T.SphereGeometry(r, Q.seg, Math.max(6, Q.seg / 2), 0, Math.PI * 2, 0, Math.PI / 2 * parcial), mat);
    F.grupo = (...hijos) => { const g = new T.Group(); hijos.forEach(h => h && g.add(h)); return g; };
    F.pon = (obj, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) => { obj.position.set(x, y, z); obj.rotation.set(rx, ry, rz); return obj; };

    /* ----- Información para la ficha que aparece al pasar el mouse ----- */
    F.info = (obj, nombre, funcion, opciones = {}) => {
      obj.userData.info = { nombre, funcion, etiqueta: opciones.etiqueta !== false, menor: !!opciones.menor };
      return obj;
    };

    /* ----- Texturas dibujadas con canvas (serigrafía, textos de chips, pantallas) -----
       dibujar(ctx, w, d) trabaja en milímetros con el origen arriba a la izquierda. */
    F.textura = (w, d, dibujar, pxmm = Q.pxmm) => {
      const k = Math.min(pxmm, 4096 / Math.max(w, d));
      const cv = document.createElement('canvas');
      cv.width = Math.max(8, Math.round(w * k)); cv.height = Math.max(8, Math.round(d * k));
      const ctx = cv.getContext('2d');
      ctx.scale(cv.width / w, cv.height / d);
      dibujar(ctx, w, d);
      const tex = new T.CanvasTexture(cv);
      if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace; else tex.encoding = T.sRGBEncoding;   // Three r160 o r128 (protoboard)
      tex.anisotropy = V.aniso;
      return tex;
    };
    // Calco: lámina delgada con textura, acostada (mirando hacia +Y)
    F.calco = (w, d, dibujar, opciones = {}) => {
      const tex = F.textura(w, d, dibujar, opciones.pxmm);
      const m = new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: opciones.rugosidad ?? .7, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      if (opciones.brillo) { m.emissive = new T.Color('#ffffff'); m.emissiveMap = tex; m.emissiveIntensity = opciones.brillo; }
      // La lámina se construye ya acostada (girada en la geometría), así F.pon no la endereza por error
      const geo = new T.PlaneGeometry(w, d); geo.rotateX(-Math.PI / 2);
      const p = new T.Mesh(geo, m);
      p.userData.calco = true;
      return p;
    };
    // Texto centrado (para chips y etiquetas)
    F.texto = (ctx, txt, x, y, alto, color = '#d8dde6', opciones = {}) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = `${opciones.peso || 700} ${alto}px ${opciones.fuente || 'Arial, sans-serif'}`;
      ctx.textAlign = opciones.alinear || 'center'; ctx.textBaseline = 'middle';
      if (opciones.rot) { ctx.translate(x, y); ctx.rotate(opciones.rot); ctx.fillText(txt, 0, 0); }
      else ctx.fillText(txt, x, y);
      ctx.restore();
    };

    /* ----- PCB con esquinas redondeadas y agujeros de montaje ----- */
    F.pcb = (w, d, color, opciones = {}) => {
      const t = opciones.grosor || 1.6, r = opciones.radio ?? 1.2;
      const s = new T.Shape();
      if (opciones.circulo) s.absarc(0, 0, w / 2, 0, Math.PI * 2, false);
      else {
        const x0 = -w / 2, y0 = -d / 2;
        s.moveTo(x0 + r, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
        s.lineTo(x0 + w, y0 + d - r); s.quadraticCurveTo(x0 + w, y0 + d, x0 + w - r, y0 + d);
        s.lineTo(x0 + r, y0 + d); s.quadraticCurveTo(x0, y0 + d, x0, y0 + d - r);
        s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      }
      (opciones.agujeros || []).forEach(([x, z, rad]) => { const h = new T.Path(); h.absarc(x, -z, rad || 1.6, 0, Math.PI * 2, true); s.holes.push(h); });
      const g = new T.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: Math.max(4, Q.seg / 3) });
      g.rotateX(-Math.PI / 2);   // la forma queda acostada: el grosor crece hacia +Y
      const m = new T.Mesh(g, F.M.pcb(color));
      m.userData.esPCB = true;
      return m;
    };

    /* ----- Pines (cabeceras) -----
       puntos: [{x, z, info:{nombre,tipo,funcion}}]
       modo: 'hembra' | 'arriba' (macho hacia arriba) | 'abajo' (macho hacia abajo) | 'angulo' (doblado hacia afuera)
       dir: hacia dónde salen los pines en modo 'angulo' ([dx, dz])
       Devuelve un grupo con userData.puntas (posiciones para etiquetas) */
    F.cabecera = (puntos, opciones = {}) => {
      const modo = opciones.modo || 'arriba', y0 = opciones.y ?? 1.6, n = puntos.length, g = new T.Group();
      const dir = opciones.dir || [0, 1];
      const puntas = [];
      const pinGeo = (largo) => new T.BoxGeometry(.64, largo, .64);
      const instancias = (geo, mat, lista) => {
        const im = new T.InstancedMesh(geo, mat, lista.length), m4 = new T.Matrix4();
        lista.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, m4); });
        im.instanceMatrix.needsUpdate = true;
        return im;
      };
      // Cuerpo de plástico: una pieza por cada pin (se ven las separaciones, como en la realidad)
      const plasticoH = modo === 'hembra' ? 8.5 : 2.5;
      const yPlast = modo === 'abajo' ? -plasticoH / 2 : y0 + plasticoH / 2;
      const yPlastAng = y0 + 1.25;
      const cuerpos = instancias(new T.BoxGeometry(2.48, modo === 'angulo' ? 2.5 : plasticoH, 2.48), F.M.negro(),
        puntos.map(p => [p.x, modo === 'angulo' ? yPlastAng : yPlast, p.z]));
      g.add(cuerpos);
      let pines;
      if (modo === 'hembra') {
        // Agujeros oscuros en la parte superior
        const huecos = instancias(new T.BoxGeometry(1, .06, 1), F.mat({ color: '#050505', roughness: 1 }), puntos.map(p => [p.x, y0 + plasticoH + .03, p.z]));
        g.add(huecos);
        pines = huecos;
        puntos.forEach(p => puntas.push(new T.Vector3(p.x, y0 + plasticoH + .2, p.z)));
      } else if (modo === 'arriba') {
        pines = instancias(pinGeo(9), F.M.oro(), puntos.map(p => [p.x, y0 + 6 - 1.5, p.z]));
        g.add(pines);
        puntos.forEach(p => puntas.push(new T.Vector3(p.x, y0 + 9, p.z)));
      } else if (modo === 'abajo') {
        pines = instancias(pinGeo(8.5), F.M.oro(), puntos.map(p => [p.x, -2.5 - 1.5, p.z]));
        g.add(pines);
        // Soldaduras visibles por arriba (aquí se ponen las etiquetas y se detecta el mouse)
        const pads = instancias(new T.CylinderGeometry(.85, .85, .12, 10), F.M.estano(), puntos.map(p => [p.x, y0 + .06, p.z]));
        g.add(pads);
        pines = pads;
        puntos.forEach(p => puntas.push(new T.Vector3(p.x, y0 + .3, p.z)));
      } else {   // angulo
        const largo = 6;
        const vert = instancias(pinGeo(3), F.M.oro(), puntos.map(p => [p.x, y0 + 1, p.z]));
        const hz = new T.BoxGeometry(dir[0] ? largo : .64, .64, dir[1] ? largo : .64);
        pines = instancias(hz, F.M.oro(), puntos.map(p => [p.x + dir[0] * (largo / 2), y0 + 1.25, p.z + dir[1] * (largo / 2)]));
        g.add(vert, pines);
        puntos.forEach(p => puntas.push(new T.Vector3(p.x + dir[0] * largo, y0 + 1.25, p.z + dir[1] * largo)));
      }
      // Detectar el mouse sobre cada pin
      pines.userData.pines = puntos.map((p, i) => Object.assign({ punta: puntas[i] }, p.info || {}));
      g.userData.puntas = puntas.map((v, i) => ({ v, info: puntos[i].info || {} }));
      g.userData.cabecera = true;
      return g;
    };
    // Fila recta de pines: inicio [x,z], paso [dx,dz] entre pines, etiquetas (texto o {n,t})
    F.fila = (x, z, dx, dz, etiquetas) => etiquetas.map((e, i) => ({ x: x + dx * i, z: z + dz * i, info: V.infoPin(e) }));

    /* ----- Circuito integrado DIP (vista desde arriba: muesca a la izquierda, pin 1 abajo a la izquierda) ----- */
    F.dip = (n, texto, opciones = {}) => {
      const filas = opciones.ancho ? 15.24 : 7.62, largo = n / 2 * 2.54 + .6, g = new T.Group(), yC = .9, h = 3.2;
      const cuerpo = F.caja(largo, h, filas - 1.3, F.M.epoxi(), .35); cuerpo.position.y = yC + h / 2;
      const muesca = F.cil(1, 1, .3, F.mat({ color: '#0a0a0c', roughness: .9 }), 16); muesca.position.set(-largo / 2 + .5, yC + h + .02, 0);
      const punto = F.cil(.45, .45, .2, F.mat({ color: '#0a0a0c', roughness: .9 }), 12); punto.position.set(-largo / 2 + 1.6, yC + h + .02, filas / 2 - 1.8);
      g.add(cuerpo, muesca, punto);
      g.add(F.pon(F.calco(largo - 3, filas - 2.6, (c, w, d) => {
        F.texto(c, texto, w / 2, d / 2 - (opciones.sub ? .7 : 0), 1.7, '#d4d8e0');
        if (opciones.sub) F.texto(c, opciones.sub, w / 2, d / 2 + 1.2, .9, '#9aa0aa', { peso: 600 });
      }), .8, yC + h + .02, 0));
      // Patas: hombro horizontal + pata vertical (instanciadas)
      const puntos = [];
      for (let i = 0; i < n; i++) {
        const abajo = i < n / 2, k = abajo ? i : n - 1 - i;
        puntos.push({ x: -largo / 2 + 1.57 + k * 2.54, z: abajo ? filas / 2 : -filas / 2, i });
      }
      const m4 = new T.Matrix4();
      const hombro = new T.InstancedMesh(new T.BoxGeometry(1.5, .25, 1.1), F.M.estano(), n);
      const pata = new T.InstancedMesh(new T.BoxGeometry(.5, 3.6, .25), F.M.estano(), n);
      puntos.forEach((p, i) => {
        m4.makeTranslation(p.x, yC + 1.4, p.z - Math.sign(p.z) * .55); hombro.setMatrixAt(i, m4);
        m4.makeTranslation(p.x, yC - .2, p.z); pata.setMatrixAt(i, m4);
      });
      hombro.instanceMatrix.needsUpdate = pata.instanceMatrix.needsUpdate = true;
      const infos = opciones.pines || [];
      hombro.userData.pines = puntos.map((p, i) => Object.assign({ punta: new T.Vector3(p.x, yC + 1.6, p.z) }, infos[i] || { nombre: 'Pin ' + (i + 1) }));
      g.add(hombro, pata);
      g.userData.puntas = puntos.map((p, i) => ({ v: new T.Vector3(p.x, yC + 1.6, p.z + Math.sign(p.z) * .6), info: infos[i] || {} }));
      return g;
    };

    /* ----- Chips de montaje superficial ----- */
    F.qfp = (lado, porLado, texto, opciones = {}) => {
      const g = new T.Group(), h = opciones.alto || 1.4;
      const cuerpo = F.caja(lado, h, lado, F.M.epoxi(), .15); cuerpo.position.y = h / 2 + .1; g.add(cuerpo);
      const total = porLado * 4, paso = (lado - 1.2) / (porLado - 1), im = new T.InstancedMesh(new T.BoxGeometry(.22, .15, 1.1), F.M.estano(), total), m4 = new T.Matrix4(), q4 = new T.Quaternion(), e = new T.Euler(), s = new T.Vector3(1, 1, 1);
      let k = 0;
      for (let ladoN = 0; ladoN < 4; ladoN++) for (let i = 0; i < porLado; i++) {
        const a = -lado / 2 + .6 + i * paso, off = lado / 2 + .4;
        const pos = [[a, off], [off, -a], [-a, -off], [-off, a]][ladoN];
        e.set(0, ladoN % 2 ? Math.PI / 2 : 0, 0); q4.setFromEuler(e);
        m4.compose(new T.Vector3(pos[0], .12, pos[1]), q4, s); im.setMatrixAt(k++, m4);
      }
      im.instanceMatrix.needsUpdate = true; g.add(im);
      g.add(F.pon(F.calco(lado * .8, lado * .5, (c, w, d) => F.texto(c, texto, w / 2, d / 2, Math.min(1.6, w / texto.length * 1.5))), 0, h + .12, 0));
      g.add(F.pon(F.cil(.35, .35, .1, F.mat({ color: '#0a0a0c', roughness: .9 }), 10), -lado / 2 + 1, h + .12, lado / 2 - 1));
      return g;
    };
    F.qfn = (lado, texto) => {
      const g = new T.Group(), cuerpo = F.caja(lado, .9, lado, F.M.epoxi(), .1); cuerpo.position.y = .45; g.add(cuerpo);
      g.add(F.pon(F.calco(lado * .85, lado * .5, (c, w, d) => F.texto(c, texto, w / 2, d / 2, Math.min(1.2, w / Math.max(texto.length, 3) * 1.6))), 0, .92, 0));
      return g;
    };
    F.soic = (n, texto, opciones = {}) => {
      const g = new T.Group(), largo = n / 2 * 1.27 + .4, ancho = opciones.ancho || 3.9, h = 1.5;
      const cuerpo = F.caja(largo, h, ancho, F.M.epoxi(), .12); cuerpo.position.y = h / 2 + .1; g.add(cuerpo);
      const im = new T.InstancedMesh(new T.BoxGeometry(.4, .2, 1.2), F.M.estano(), n), m4 = new T.Matrix4();
      for (let i = 0; i < n; i++) { const abajo = i < n / 2, k = abajo ? i : n - 1 - i; m4.makeTranslation(-largo / 2 + .6 + k * 1.27, .2, (abajo ? 1 : -1) * (ancho / 2 + .5)); im.setMatrixAt(i, m4); }
      im.instanceMatrix.needsUpdate = true; g.add(im);
      g.add(F.pon(F.calco(largo * .9, ancho * .7, (c, w, d) => F.texto(c, texto, w / 2, d / 2, Math.min(1.3, w / Math.max(texto.length, 3) * 1.6))), 0, h + .12, 0));
      return g;
    };
    F.sot23 = () => {
      const g = new T.Group(); g.add(F.pon(F.caja(2.9, 1, 1.3, F.M.epoxi()), 0, .6, 0));
      [[-.95, .9], [.95, .9], [0, -.9]].forEach(([x, z]) => g.add(F.pon(F.caja(.4, .2, .6, F.M.estano()), x, .15, z)));
      return F.info(g, 'Transistor', 'Interruptor electrónico pequeño que maneja más corriente que un pin', { menor: true });
    };
    F.sot223 = (texto = 'AMS1117') => {
      const g = new T.Group(); g.add(F.pon(F.caja(6.5, 1.6, 3.5, F.M.epoxi(), .1), 0, .9, 0));
      g.add(F.pon(F.caja(3, .25, 1.6, F.M.estano()), 0, .2, -2.4));
      [-2.3, 0, 2.3].forEach(x => g.add(F.pon(F.caja(.7, .25, 1.4, F.M.estano()), x, .2, 2.3)));
      g.add(F.pon(F.calco(5.5, 2.4, (c, w, d) => F.texto(c, texto, w / 2, d / 2, .9)), 0, 1.72, 0));
      return F.info(g, 'Regulador de voltaje', 'Convierte el voltaje de entrada en uno fijo y estable (por ejemplo 3,3 V)');
    };
    F.smd = (tipo = 'r') => {
      const g = new T.Group(), cuerpo = tipo === 'r' ? '#121214' : '#b49067';
      g.add(F.pon(F.caja(1.2, .45, 1.25, F.M.plastico(cuerpo, .6)), 0, .25, 0));
      [-.8, .8].forEach(x => g.add(F.pon(F.caja(.4, .5, 1.25, F.M.estano()), x, .25, 0)));
      return F.info(g, tipo === 'r' ? 'Resistencia SMD' : 'Capacitor SMD', tipo === 'r' ? 'Limita la corriente en el circuito' : 'Filtra el ruido de la alimentación', { menor: true });
    };
    F.ledSMD = (color = '#ff3b30', encendido = false) => {
      const g = new T.Group();
      g.add(F.pon(F.caja(1.6, .35, .8, F.M.blanco()), 0, .18, 0));
      g.add(F.pon(F.caja(1.0, .3, .6, encendido ? F.M.luz(color, 2.2) : F.M.vidrio(color, .85)), 0, .5, 0));
      return F.info(g, 'LED indicador', encendido ? 'Está encendido: indica que la placa tiene energía' : 'Se enciende para indicar actividad', { menor: true });
    };

    /* ----- Conectores ----- */
    // La abertura del conector mira hacia -X; gíralo con F.pon(..., ry)
    F.usb = (tipo = 'micro') => {
      const D = { B: [16, 10.9, 12, 0], mini: [9.2, 3.9, 7.7, .5], micro: [5.6, 2.6, 7.5, .6], C: [7.3, 3.2, 8.9, 1.5] }[tipo];
      const g = new T.Group(), [l, h, w, r] = D;
      const shell = F.caja(l, h, w, F.M.aluminio(), r); shell.position.y = h / 2; g.add(shell);
      const boca = F.caja(.4, h * .62, w * .8, F.mat({ color: '#0b0b0c', roughness: .95 }), Math.min(r, .3)); boca.position.set(-l / 2 - .1, h / 2, 0); g.add(boca);
      if (tipo === 'B') { const lengua = F.caja(.5, h * .38, w * .45, F.M.blanco()); lengua.position.set(-l / 2 - .2, h / 2, 0); g.add(lengua); }
      return F.info(g, 'Conector USB ' + (tipo === 'C' ? 'tipo C' : tipo === 'B' ? 'tipo B' : tipo === 'mini' ? 'Mini' : 'Micro'), 'Alimenta la placa y sirve para cargar el programa desde la computadora');
    };
    F.jackDC = () => {
      const g = new T.Group();
      g.add(F.pon(F.caja(14, 11, 9, F.M.negro(), .6), 0, 5.5, 0));
      g.add(F.pon(F.cil(3.2, 3.2, .4, F.mat({ color: '#050505', roughness: 1 }), 20), -7.1, 6.3, 0, 0, 0, Math.PI / 2));
      g.add(F.pon(F.cil(1, 1, .6, F.M.estano(), 12), -7.2, 6.3, 0, 0, 0, Math.PI / 2));
      return F.info(g, 'Conector de alimentación', 'Entrada de 7 a 12 V con un adaptador o una batería');
    };
    F.bornera = (n, color = '#1f63d8') => {
      const g = new T.Group();
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * 5.08;
        g.add(F.pon(F.caja(5, 10, 7.6, F.M.plastico(color, .5), .3), x, 5, 0));
        g.add(F.pon(F.cil(1.5, 1.5, .8, F.M.estano(), 14), x, 10.2, -1));
        g.add(F.pon(F.caja(2.6, .3, .45, F.mat({ color: '#555a62', metalness: .8, roughness: .4 })), x, 10.65, -1));
        g.add(F.pon(F.caja(.4, 3, 3, F.mat({ color: '#0a0a0a', roughness: 1 })), x, 4, 3.82, Math.PI / 2));
      }
      return F.info(g, 'Bornera de tornillo', 'Se conectan cables gruesos ajustando el tornillo con un desarmador');
    };

    /* ----- Componentes pasivos y mecánicos ----- */
    F.cristal = (tipo = 'hc49', texto = '16.000') => {
      const g = new T.Group();
      if (tipo === 'hc49') {
        g.add(F.pon(F.caja(11, 3.6, 4.6, F.M.aluminio(), 1.7), 0, 2.2, 0));
        g.add(F.pon(F.calco(7, 2.4, (c, w, d) => F.texto(c, texto, w / 2, d / 2, 1.3, '#3a3f48')), 0, 4.02, 0));
      } else if (tipo === 'reloj') {
        g.add(F.pon(F.cil(1, 1, 6, F.M.aluminio(), 14), 0, 1, 0, 0, 0, Math.PI / 2));
      } else {
        g.add(F.pon(F.caja(3.2, .8, 2.5, F.M.aluminio(), .2), 0, .45, 0));
      }
      return F.info(g, 'Cristal de cuarzo', 'Vibra a una frecuencia exacta y marca el ritmo del circuito, como un metrónomo');
    };
    F.electrolitico = (dia = 6.3, alto = 7, funda = '#1d2a4a') => {
      const g = new T.Group(), r = dia / 2;
      g.add(F.pon(F.cil(r, r, alto, F.M.plastico(funda, .45)), 0, alto / 2, 0));
      g.add(F.pon(F.cil(r * .92, r * .92, .3, F.M.aluminio()), 0, alto + .05, 0));
      g.add(F.pon(F.calco(dia * .7, dia * .7, (c, w, d) => { c.strokeStyle = '#7b818a'; c.lineWidth = .25; c.beginPath(); c.moveTo(w * .2, d / 2); c.lineTo(w * .8, d / 2); c.moveTo(w / 2, d * .2); c.lineTo(w / 2, d * .8); c.stroke(); }), 0, alto + .22, 0));
      g.add(F.pon(F.caja(.3, alto * .9, r * .8, F.M.plastico('#c9ced8')), r - .05, alto / 2, 0));   // franja del negativo
      return F.info(g, 'Capacitor electrolítico', 'Guarda energía y estabiliza el voltaje, como un pequeño tanque de agua');
    };
    F.boton = (lado = 6, colorCapuchon = '#1a1a1a') => {
      const g = new T.Group();
      g.add(F.pon(F.caja(lado, 1.6, lado, F.M.negro(), .2), 0, .8, 0));
      g.add(F.pon(F.caja(lado, .25, lado, F.M.estano()), 0, 1.7, 0));
      g.add(F.pon(F.cil(lado * .29, lado * .29, 1.6, F.M.plastico(colorCapuchon, .5), 20), 0, 2.6, 0));
      return F.info(g, 'Pulsador', 'Botón para reiniciar la placa o para una función especial');
    };
    F.trimmer = (tipo = 'cuadrado') => {
      const g = new T.Group();
      if (tipo === 'multivuelta') {
        g.add(F.pon(F.caja(9.5, 10, 4.8, F.M.plastico('#2a63d4', .45), .3), 0, 5, 0));
        g.add(F.pon(F.cil(1.1, 1.1, 1.2, F.M.oro(), 14), 3.2, 10.4, 0));
      } else {
        g.add(F.pon(F.caja(6.6, 4.4, 6.8, F.M.plastico('#2a63d4', .45), .4), 0, 2.2, 0));
        g.add(F.pon(F.cil(2, 2, .6, F.M.blanco(), 20), 0, 4.6, 0));
        g.add(F.pon(F.caja(3.2, .3, .7, F.M.plastico('#9aa0aa')), 0, 4.95, 0, Math.PI / 4));
        g.add(F.pon(F.caja(3.2, .3, .7, F.M.plastico('#9aa0aa')), 0, 4.95, 0, -Math.PI / 4));
      }
      return F.info(g, 'Potenciómetro de ajuste', 'Se gira con un desarmador para calibrar la sensibilidad o el umbral');
    };
    F.rele = (texto = 'SRD-05VDC') => {
      const g = new T.Group();
      g.add(F.pon(F.caja(19, 15.5, 15.5, F.M.plastico('#1f5ec9', .4), .7), 0, 7.75, 0));
      g.add(F.pon(F.calco(16, 12, (c, w, d) => { F.texto(c, texto, w / 2, 2.6, 1.6, '#e8eefc'); F.texto(c, '10A 250VAC', w / 2, 5.6, 1.3, '#cfd9f2', { peso: 600 }); F.texto(c, '10A 30VDC', w / 2, 8, 1.3, '#cfd9f2', { peso: 600 }); F.texto(c, 'NO · COM · NC', w / 2, 10.6, 1.1, '#cfd9f2', { peso: 600 }); }), 0, 15.52, 0));
      return F.info(g, 'Relé', 'Interruptor con un electroimán: con poca corriente controla cargas grandes');
    };
    F.pila = () => {
      const g = new T.Group();
      g.add(F.pon(F.cil(11.5, 11.5, 2.4, F.M.negro()), 0, 1.2, 0));
      g.add(F.pon(F.cil(10, 10, 3.2, F.M.estano(), Q.seg), 0, 2.6, 0));
      g.add(F.pon(F.calco(12, 6, (c, w, d) => { F.texto(c, '+  CR2032', w / 2, d / 2, 1.8, '#5a606a'); }), 0, 4.22, 0));
      return F.info(g, 'Pila de botón CR2032', 'Mantiene funcionando el reloj cuando se desconecta la alimentación');
    };
    F.transductor = () => {
      const g = new T.Group();
      g.add(F.pon(F.cil(8, 8, 12, F.M.aluminio()), 0, 6, 0));
      g.add(F.pon(F.calco(15, 15, (c, w, d) => {
        c.fillStyle = '#1a1c20'; c.beginPath(); c.arc(w / 2, d / 2, 7.1, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#4a4e57'; for (let x = 1; x < w; x += 1.1) for (let y = 1; y < d; y += 1.1) if (Math.hypot(x - w / 2, y - d / 2) < 6.8) { c.fillRect(x, y, .55, .55); }
      }, { rugosidad: .9 }), 0, 12.02, 0));
      return F.info(g, 'Transductor ultrasónico', 'Uno "grita" el ultrasonido y el otro escucha el eco');
    };
    F.domo = (r = 11.5) => {
      const g = new T.Group();
      g.add(F.pon(F.esfera(r, F.mat({ color: '#f4f4f0', roughness: .35, transparent: true, opacity: .92 })), 0, 0, 0));
      // Facetas de la lente de Fresnel
      if (Q.seg > 12) {
        const anillo = F.mat({ color: '#d8d8d2', roughness: .4 });
        for (let i = 1; i <= 3; i++) { const tor = new T.Mesh(new T.TorusGeometry(r * Math.sin(i * .38), .18, 6, Q.seg), anillo); tor.rotation.x = Math.PI / 2; tor.position.y = r * Math.cos(i * .38); g.add(tor); }
      }
      return F.info(g, 'Lente de Fresnel', 'Concentra el calor (infrarrojo) de las personas sobre el sensor');
    };
    F.pantalla = (w, d, h, tipo, opciones = {}) => {
      const g = new T.Group();
      const marco = tipo === 'lcd' ? F.M.negro() : tipo === 'tft' ? F.mat({ color: '#0d0d0f', roughness: .3 }) : F.mat({ color: '#08080a', roughness: .25 });
      g.add(F.pon(F.caja(w, h, d, marco, .4), 0, h / 2, 0));
      const aw = opciones.aw || w * .86, ad = opciones.ad || d * .7;
      const dibujos = {
        lcd: (c, W, D) => {
          c.fillStyle = '#9ccc2a'; c.fillRect(0, 0, W, D);
          const lineas = opciones.lineas || ['ELECTROVERSE', 'Hola, Llata!'];
          const cw = W / 16.6, ch = D / 2.4;
          for (let f = 0; f < 2; f++) for (let k = 0; k < 16; k++) {
            const x = .3 + k * cw * 1.02, y = .4 + f * ch * 1.05;
            c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(x, y, cw * .9, ch * .9);
            const letra = (lineas[f] || '')[k];
            if (letra && letra !== ' ') F.texto(c, letra, x + cw * .45, y + ch * .48, ch * .78, '#16300b', { fuente: 'Courier New, monospace' });
          }
        },
        oled: (c, W, D) => { c.fillStyle = '#000'; c.fillRect(0, 0, W, D); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, W, D * .25); F.texto(c, 'ELECTROVERSE', W / 2, D * .13, D * .16, '#000'); F.texto(c, 't = 42 s', W / 2, D * .5, D * .2, '#7fe8ff'); c.strokeStyle = '#7fe8ff'; c.lineWidth = .25; c.beginPath(); for (let x = 1; x < W - 1; x += .5) c.lineTo(x, D * .82 - Math.sin(x * .6) * D * .08); c.stroke(); },
        tft: (c, W, D) => { const gr = c.createLinearGradient(0, 0, W, D); gr.addColorStop(0, '#0d2b6b'); gr.addColorStop(1, '#5b1f8c'); c.fillStyle = gr; c.fillRect(0, 0, W, D); F.texto(c, 'ELECTROVERSE', W / 2, D * .3, D * .12, '#ffd23a'); c.fillStyle = '#22e5ff'; c.beginPath(); c.arc(W * .3, D * .66, D * .14, 0, 7); c.fill(); c.fillStyle = '#ff4fb8'; c.fillRect(W * .5, D * .52, W * .25, D * .28); },
        matriz: (c, W, D) => {
          c.fillStyle = '#0b0b0b'; c.fillRect(0, 0, W, D);
          const cara = [0b00111100, 0b01000010, 0b10100101, 0b10000001, 0b10100101, 0b10011001, 0b01000010, 0b00111100], p = W / 8;
          for (let f = 0; f < 8; f++) for (let k = 0; k < 8; k++) { const on = (cara[f] >> (7 - k)) & 1; c.fillStyle = on ? '#ff2a1a' : '#3a1210'; c.beginPath(); c.arc(p * k + p / 2, p * f + p / 2, p * .36, 0, 7); c.fill(); }
        }
      };
      const brillo = tipo === 'lcd' ? 0 : tipo === 'matriz' ? 1.6 : 1.1;
      g.add(F.pon(F.calco(aw, ad, dibujos[tipo], { brillo, rugosidad: .25, pxmm: Math.max(Q.pxmm, 12) }), 0, h + .02, opciones.oz || 0));
      return F.info(g, { lcd: 'Pantalla LCD 16×2', oled: 'Pantalla OLED', tft: 'Pantalla TFT a color', matriz: 'Matriz de 64 LEDs' }[tipo], opciones.funcion || 'Muestra la información del programa');
    };
    // Módulo con escudo metálico y antena impresa (ESP32-WROOM)
    F.moduloWifi = (w = 18, d = 25.5, texto = 'ESP32-WROOM-32', opciones = {}) => {
      const g = new T.Group(), antena = opciones.antena || 6;
      g.add(F.pon(F.caja(w, .8, d, F.M.pcb('#1a1d22')), 0, .4, 0));
      const escudoD = d - antena - 1.2;
      g.add(F.pon(F.caja(w - 1.2, 2.4, escudoD, F.mat({ color: '#c6cbd2', metalness: 1, roughness: .32 }), .25), 0, 2, antena / 2 + .2));
      g.add(F.pon(F.calco(w - 3, escudoD - 4, (c, W, D) => { F.texto(c, texto, W / 2, D * .35, Math.min(1.5, W / texto.length * 1.7), '#4b5059'); F.texto(c, opciones.sub || 'Wi-Fi + Bluetooth', W / 2, D * .6, 1.1, '#6b717a', { peso: 600 }); }), 0, 3.22, antena / 2 + .2));
      // Antena impresa en zigzag
      g.add(F.pon(F.calco(w - 1.5, antena - .6, (c, W, D) => { c.strokeStyle = '#d9ab45'; c.lineWidth = .45; c.beginPath(); c.moveTo(.8, D - .5); let x = .8, arriba = true; while (x < W - 1) { c.lineTo(x, arriba ? .6 : D - .8); x += 1.4; c.lineTo(x, arriba ? .6 : D - .8); arriba = !arriba; } c.stroke(); }, { rugosidad: .4 }), 0, .82, -d / 2 + antena / 2));
      return F.info(g, opciones.nombre || 'Módulo Wi-Fi y Bluetooth', opciones.funcion || 'El "cerebro" con radio: procesador de dos núcleos, memoria y antena impresa');
    };
    F.cable = (puntos, color, grosor = .9) => {
      const curva = new T.CatmullRomCurve3(puntos.map(p => new T.Vector3(p[0], p[1], p[2])));
      return new T.Mesh(new T.TubeGeometry(curva, Math.max(8, Q.seg), grosor, 8, false), F.M.plastico(color, .5));
    };
    F.patas = (puntos, largo = 6, grosor = .5) => {
      // Patas metálicas verticales (para componentes de inserción)
      const im = new T.InstancedMesh(new T.BoxGeometry(grosor, largo, grosor), F.M.estano(), puntos.length), m4 = new T.Matrix4();
      puntos.forEach((p, i) => { m4.makeTranslation(p[0], (p[1] || 0) - largo / 2, p[2]); im.setMatrixAt(i, m4); });
      im.instanceMatrix.needsUpdate = true;
      return im;
    };

    return F;
  }

  /* =====================================================================
     EL VISOR
     ===================================================================== */
  const Visor3D = {
    actual: null,
    modelos: {},          // se llenan en js/modelos3d.js
    calidad: calidadInicial(),
    elegidaAMano: (() => { try { return !!localStorage.getItem('ev1:calidad3d'); } catch (e) { return false; } })(),
    CALIDAD,

    /* contenedor: elemento donde va el 3D · comp: componente de EV_DATA
       ayuda: { infoPin(comp, etiqueta) → {nombre,tipo,funcion}, color(tipo) → '#hex' } */
    async montar(contenedor, comp, ayuda) {
      this.desmontar();
      const V = { contenedor, comp, ayuda, activo: true, q: CALIDAD[this.calidad], quitar: [] };
      this.actual = V;
      contenedor.innerHTML = this.plantilla();
      const msg = contenedor.querySelector('.v3b-msg');
      msg.textContent = 'Cargando el motor 3D…';
      let lib;
      try { lib = await cargarThree(); }
      catch (e) {
        msg.innerHTML = 'No se pudo cargar el motor 3D. Revisa tu conexión a internet.<br><button class="btn sm" data-v3="reintentar">Reintentar</button>';
        const b = msg.querySelector('[data-v3="reintentar"]'); if (b) b.onclick = () => this.montar(contenedor, comp, ayuda);
        return;
      }
      if (!V.activo || this.actual !== V || !contenedor.isConnected) return;
      try { this.construir(V, lib); msg.hidden = true; }
      catch (e) { console.error(e); msg.textContent = 'Este equipo no pudo dibujar el 3D (' + e.message + '). El resto de la ficha funciona igual.'; }
    },

    plantilla() {
      const q = this.calidad;
      return `<canvas class="v3b-canvas" tabindex="0" aria-label="Modelo 3D. Arrastra para girar, rueda o pellizco para acercar."></canvas>
        <div class="v3b-capa" aria-hidden="true"></div>
        <div class="v3b-tip" hidden></div>
        <div class="v3b-barra" role="toolbar" aria-label="Controles del modelo 3D">
          <button class="btn sm" data-v3="etiquetas" aria-pressed="false">Mostrar etiquetas</button>
          <button class="btn sm" data-v3="explotar" aria-pressed="false">Vista explosionada</button>
          <button class="btn sm" data-v3="pinout" aria-pressed="false">Ver pinout</button>
          <button class="btn sm" data-v3="reiniciar">Reiniciar vista</button>
          <span class="seg v3b-cal" role="group" aria-label="Calidad del 3D">${Object.entries(CALIDAD).map(([k, c]) => `<button data-cal="${k}" aria-pressed="${k === q}">${c.nombre}</button>`).join('')}</span>
        </div>
        <div class="v3b-ayuda small muted">Arrastra para girar · rueda o pellizco para acercar · ${matchMedia('(pointer: coarse)').matches ? 'dos dedos para mover' : 'clic derecho para mover'}</div>
        <div class="v3b-msg"></div>`;
    },

    construir(V, lib) {
      const { T, OrbitControls, RoomEnvironment } = lib, Q = V.q, cont = V.contenedor;
      V.lib = lib; V.T = T;
      const canvas = cont.querySelector('.v3b-canvas');

      /* ----- Renderizador ----- */
      const r = new T.WebGLRenderer({ canvas, antialias: Q.aa && (Q === CALIDAD.alta || (window.devicePixelRatio || 1) < 2), alpha: true, powerPreference: Q === CALIDAD.alta ? 'high-performance' : 'default' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pr));   // nitidez limitada a 2 para no gastar de más
      r.outputColorSpace = T.SRGBColorSpace;
      r.toneMapping = T.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.05;
      r.setClearColor(0x000000, 0);
      if (Q.sombras) { r.shadowMap.enabled = true; r.shadowMap.type = Q.suaves ? T.PCFSoftShadowMap : T.PCFShadowMap; }
      V.r = r; V.aniso = Math.min(8, r.capabilities.getMaxAnisotropy());

      /* ----- Escena, cámara y luces ----- */
      const escena = new T.Scene(); V.escena = escena;
      V.camara = new T.PerspectiveCamera(32, 1, 1, 4000);
      if (Q.env) {
        V.pmrem = new T.PMREMGenerator(r);
        V.entorno = V.pmrem.fromScene(new RoomEnvironment(r), .04).texture;
        escena.environment = V.entorno;
        escena.add(new T.HemisphereLight(0xffffff, 0x404858, .35));
      } else {
        escena.add(new T.HemisphereLight(0xeef3ff, 0x30303a, 2.4));
      }
      const sol = new T.DirectionalLight(0xffffff, Q.env ? 1.6 : 2.2);
      escena.add(sol, sol.target); V.sol = sol;

      /* ----- Información de pines (la entrega la Biblioteca) ----- */
      V.infoPin = (etiqueta) => {
        if (etiqueta && typeof etiqueta === 'object') return Object.assign({ nombre: etiqueta.n }, V.ayuda.infoPin(V.comp, etiqueta.n), etiqueta.t ? { tipo: etiqueta.t } : {}, etiqueta.f ? { funcion: etiqueta.f } : {});
        return Object.assign({ nombre: etiqueta }, V.ayuda.infoPin(V.comp, etiqueta));
      };

      /* ----- Construir el modelo ----- */
      const F = crearFabrica(V); V.F = F;
      const constructor = this.modelos[V.comp.id] || this.modelos['*' + V.comp.categoria] || this.modelos['*'];
      const modelo = constructor(F, V.comp, V);
      escena.add(modelo); V.modelo = modelo;

      // Sombras, piezas seleccionables y datos para la vista explosionada
      V.partes = []; V.seleccionables = []; V.puntas = [];
      const caja = new T.Box3().setFromObject(modelo), centro = caja.getCenter(new T.Vector3()), tam = caja.getSize(new T.Vector3());
      modelo.traverse(o => {
        if (o.isMesh) { o.castShadow = Q.sombras && !o.userData.calco; o.receiveShadow = Q.sombras && !!o.userData.esPCB; }
        if (o.userData.info || o.userData.pines) V.seleccionables.push(o);
      });
      // Pinout: solo los pines de conexión (no las patas de los chips internos de una placa)
      const conPuntas = []; modelo.traverse(o => { if (o.userData.puntas) conPuntas.push(o); });
      const cabeceras = conPuntas.filter(o => o.userData.cabecera);
      (cabeceras.length ? cabeceras : conPuntas).forEach(o => o.userData.puntas.forEach(p => V.puntas.push({ obj: o, v: p.v, info: p.info })));
      // Partes = hijos directos del modelo (o de sus subgrupos marcados como "ensamble")
      const juntar = g => g.children.forEach(h => { if (h.userData.ensamble) juntar(h); else V.partes.push(h); });
      juntar(modelo);
      const yPcb = (modelo.userData.yPcb ?? 1.6);
      V.partes.forEach((p, i) => {
        p.userData.base = p.position.clone();
        const b = new T.Box3().setFromObject(p), c = b.getCenter(new T.Vector3());
        let dy = 0;
        if (p.userData.esPCB) dy = 0;
        else if (p.userData.cabecera && c.y < yPcb) dy = -14;
        else if (c.y >= yPcb * .5) dy = 10 + (i % 4) * 3.5 + (b.max.y - b.min.y) * .4;
        else dy = -10 - (i % 3) * 3;
        p.userData.explota = new T.Vector3(0, dy * (modelo.userData.factorExplosion || 1), 0);
      });

      // Suelo que recibe la sombra
      const suelo = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShadowMaterial({ opacity: .28 }));
      suelo.rotation.x = -Math.PI / 2; suelo.position.y = caja.min.y - .05; suelo.scale.setScalar(Math.max(tam.x, tam.z) * 4);
      suelo.receiveShadow = true; suelo.visible = Q.sombras; escena.add(suelo); V.suelo = suelo;

      // Luz principal y su cámara de sombras ajustada al tamaño del modelo
      const radio = Math.max(tam.length() / 2, 10);
      sol.position.set(centro.x - radio * 1.2, centro.y + radio * 2.4, centro.z + radio * 1.4);
      sol.target.position.copy(centro);
      if (Q.sombras) {
        sol.castShadow = true; sol.shadow.mapSize.set(Q.mapa, Q.mapa);
        const sc = sol.shadow.camera; sc.left = sc.bottom = -radio * 1.6; sc.right = sc.top = radio * 1.6; sc.near = radio * .5; sc.far = radio * 6; sc.updateProjectionMatrix();
        sol.shadow.bias = -.0004; sol.shadow.normalBias = .02; sol.shadow.radius = 4;
      }

      /* ----- Cámara y controles ----- */
      V.centro = centro; V.radio = radio;
      const ctl = new OrbitControls(V.camara, canvas);
      ctl.enableDamping = true; ctl.dampingFactor = .09; ctl.screenSpacePanning = true;
      ctl.minDistance = radio * .6; ctl.maxDistance = radio * 8; ctl.maxPolarAngle = Math.PI * .92;
      ctl.target.copy(centro); V.ctl = ctl;
      this.vistaInicial(V);

      /* ----- Bucle de dibujo: solo cuando algo cambia ----- */
      V.pedir = () => { if (!V.raf && V.activo) V.raf = requestAnimationFrame(() => this.cuadro(V)); };
      ctl.addEventListener('change', V.pedir);
      ctl.addEventListener('start', () => { V.usuarioMovio = true; this.ocultarTip(V); V.pedir(); });

      // Tamaño del lienzo
      const ajustar = () => {
        const w = cont.clientWidth, h = cont.clientHeight; if (!w || !h) return;
        r.setSize(w, h, false); V.camara.aspect = w / h; V.camara.updateProjectionMatrix(); V.ancho = w; V.alto = h;
        if (!V.usuarioMovio) this.vistaInicial(V);   // si aún no lo giraste, se reencuadra al cambiar el tamaño
        V.pedir();
      };
      V.ro = new ResizeObserver(ajustar); V.ro.observe(cont); ajustar();

      /* ----- Mouse y toque: ficha del componente ----- */
      V.ray = new T.Raycaster(); V.mouse = new T.Vector2();
      V.marco = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), new T.LineBasicMaterial({ color: 0x22e5ff, transparent: true, opacity: .95, depthTest: false }));
      V.marco.renderOrder = 10; V.marco.visible = false; escena.add(V.marco);
      let inicio = null;
      const enMovimiento = e => { if (e.pointerType === 'mouse' && !e.buttons) this.apuntar(V, e); };
      const alPresionar = e => { inicio = [e.clientX, e.clientY]; };
      const alSoltar = e => { if (inicio && Math.hypot(e.clientX - inicio[0], e.clientY - inicio[1]) < 6) this.apuntar(V, e, true); inicio = null; };
      const alSalir = () => { this.ocultarTip(V); };
      canvas.addEventListener('pointermove', enMovimiento); canvas.addEventListener('pointerdown', alPresionar);
      canvas.addEventListener('pointerup', alSoltar); canvas.addEventListener('pointerleave', alSalir);
      V.quitar.push(() => { canvas.removeEventListener('pointermove', enMovimiento); canvas.removeEventListener('pointerdown', alPresionar); canvas.removeEventListener('pointerup', alSoltar); canvas.removeEventListener('pointerleave', alSalir); });

      /* ----- Botones ----- */
      V.etiquetas = false; V.pinout = false; V.explosion = 0; V.metaExplosion = 0;
      cont.querySelectorAll('[data-v3]').forEach(b => b.onclick = () => {
        const a = b.dataset.v3;
        if (a === 'etiquetas') { V.etiquetas = !V.etiquetas; b.setAttribute('aria-pressed', V.etiquetas); this.armarEtiquetas(V); }
        if (a === 'pinout') { V.pinout = !V.pinout; b.setAttribute('aria-pressed', V.pinout); this.armarEtiquetas(V); if (V.pinout && !V.puntas.length) this.aviso(V, 'Este componente no tiene pines para mostrar.'); }
        if (a === 'explotar') { V.metaExplosion = V.metaExplosion ? 0 : 1; b.setAttribute('aria-pressed', !!V.metaExplosion); V.tExp = performance.now(); V.desdeExp = V.explosion; V.pedir(); }
        if (a === 'reiniciar') { V.usuarioMovio = false; this.vistaInicial(V); V.metaExplosion = 0; V.tExp = performance.now(); V.desdeExp = V.explosion; cont.querySelector('[data-v3="explotar"]').setAttribute('aria-pressed', 'false'); V.pedir(); }
      });
      cont.querySelectorAll('[data-cal]').forEach(b => b.onclick = () => {
        if (b.dataset.cal === this.calidad) return;
        this.calidad = b.dataset.cal; this.elegidaAMano = true; guardarCalidad(this.calidad);
        this.montar(cont, V.comp, V.ayuda);
      });
      const visib = () => { if (!document.hidden) V.pedir(); };
      document.addEventListener('visibilitychange', visib); V.quitar.push(() => document.removeEventListener('visibilitychange', visib));
      V.estad = { cuadros: 0, ms: 0 };
      V.pedir();
    },

    vistaInicial(V) {
      // Distancia para que el modelo entero quepa en el lienzo (también en pantallas angostas)
      const T = V.T, factor = (V.modelo.userData.distancia || 2.7) / 2.7;
      let d = V.radio / Math.sin(V.camara.fov * Math.PI / 360) * factor;
      if (V.camara.aspect < 1) d /= Math.max(V.camara.aspect, .5);
      const dir = new T.Vector3(...(V.modelo.userData.direccion || [.55, 1, 1.1])).normalize();
      V.camara.position.copy(V.centro).addScaledVector(dir, d);
      V.ctl.target.copy(V.centro); V.ctl.update();
    },

    cuadro(V) {
      V.raf = 0; if (!V.activo) return;
      const t0 = performance.now();
      let seguir = V.ctl.update();
      // Animación de la vista explosionada
      if (V.explosion !== V.metaExplosion) {
        const k = Math.min(1, (t0 - V.tExp) / 700);
        V.explosion = V.desdeExp + (V.metaExplosion - V.desdeExp) * suavizar(k);
        if (k >= 1) V.explosion = V.metaExplosion;
        V.partes.forEach(p => p.position.copy(p.userData.base).addScaledVector(p.userData.explota, V.explosion));
        if (V.marco.visible && V.sel) this.enmarcar(V, V.sel);
        seguir = true;
      }
      V.r.render(V.escena, V.camara);
      this.moverEtiquetas(V);
      const dt = performance.now() - t0;
      V.estad.cuadros++; V.estad.ms += dt;
      if (V.estad.cuadros > 2) V.estad.msMedidos = (V.estad.msMedidos || 0) + dt;   // los 2 primeros incluyen la preparación de sombreadores
      // Equipo lento: si nadie eligió la calidad a mano, bajamos a "Baja" automáticamente
      if (V.estad.cuadros === 8 && this.calidad !== 'baja' && !this.elegidaAMano && V.estad.msMedidos / 6 > 45) {
        this.calidad = 'baja';
        const cont = V.contenedor, comp = V.comp, ayuda = V.ayuda;
        setTimeout(() => { if (this.actual === V) { this.montar(cont, comp, ayuda).then(() => { if (this.actual) this.aviso(this.actual, 'Este equipo dibuja lento: activé la calidad Baja para que vaya fluido.'); }); } }, 0);
        return;
      }
      if (seguir) V.pedir();
    },

    /* ----- Ficha al pasar el mouse o tocar ----- */
    apuntar(V, e, toque) {
      const rect = V.r.domElement.getBoundingClientRect();
      V.mouse.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      V.ray.setFromCamera(V.mouse, V.camara);
      const golpes = V.ray.intersectObjects(V.seleccionables, true);
      let info = null, objetivo = null;
      for (const g of golpes) {
        if (g.object.userData.pines && g.instanceId != null) { info = g.object.userData.pines[g.instanceId]; objetivo = { pin: info, obj: g.object }; break; }
        let o = g.object;
        while (o && !o.userData.info && o !== V.modelo) o = o.parent;
        if (o && o.userData.info) { info = o.userData.info; objetivo = o; break; }
      }
      if (!info) { this.ocultarTip(V); if (toque) V.pedir(); return; }
      V.sel = objetivo; this.enmarcar(V, objetivo);
      const tip = V.contenedor.querySelector('.v3b-tip');
      const tipo = info.tipo ? `<span class="bib-tipo" style="--c:${V.ayuda.color(info.tipo)}">${escapar(info.tipo)}</span>` : '';
      tip.innerHTML = `<b>${escapar(info.nombre)}</b>${tipo}${info.funcion ? `<span>${escapar(info.funcion)}</span>` : ''}`;
      tip.hidden = false;
      const cr = V.contenedor.getBoundingClientRect();
      const x = e.clientX - cr.left, y = e.clientY - cr.top;
      tip.style.left = Math.min(Math.max(8, x + 14), cr.width - tip.offsetWidth - 8) + 'px';
      tip.style.top = Math.min(Math.max(8, y + 14), cr.height - tip.offsetHeight - 8) + 'px';
      V.pedir();
    },
    enmarcar(V, objetivo) {
      const T = V.T;
      if (objetivo.pin) {
        const p = objetivo.obj.localToWorld(objetivo.pin.punta.clone());
        V.marco.position.copy(p); V.marco.scale.set(2.2, 2.2, 2.2);
      } else {
        const b = new T.Box3().setFromObject(objetivo), c = b.getCenter(new T.Vector3()), s = b.getSize(new T.Vector3());
        V.marco.position.copy(c); V.marco.scale.set(s.x + .8, s.y + .8, s.z + .8);
      }
      V.marco.visible = true;
    },
    ocultarTip(V) {
      const tip = V.contenedor.querySelector('.v3b-tip'); if (tip) tip.hidden = true;
      if (V.marco && V.marco.visible) { V.marco.visible = false; V.sel = null; V.pedir(); }
    },
    aviso(V, texto) {
      const tip = V.contenedor.querySelector('.v3b-tip'); tip.innerHTML = `<span>${escapar(texto)}</span>`; tip.hidden = false; tip.style.left = '12px'; tip.style.top = '12px';
      setTimeout(() => { if (tip.isConnected) tip.hidden = true; }, 2500);
    },

    /* ----- Etiquetas de piezas y de pines (elementos HTML que siguen al modelo) ----- */
    armarEtiquetas(V) {
      const capa = V.contenedor.querySelector('.v3b-capa'); capa.innerHTML = ''; V.etqs = [];
      if (V.etiquetas) {
        // Una sola etiqueta por pieza: la de la pieza o, si no tiene, la de su primer hijo con información
        V.partes.map(p => p.userData.info ? p : p.children.find(h => h.userData.info)).forEach(o => {
          const inf = o && o.userData.info; if (!inf || inf.menor || inf.etiqueta === false) return;
          const el = document.createElement('div'); el.className = 'v3b-etq'; el.textContent = inf.nombre; capa.appendChild(el);
          V.etqs.push({ el, obj: o, local: null });
        });
      }
      if (V.pinout) {
        V.puntas.forEach(p => {
          const el = document.createElement('div'); el.className = 'v3b-pin'; el.textContent = p.info.nombre || '';
          el.style.setProperty('--c', V.ayuda.color(p.info.tipo || 'otro')); capa.appendChild(el);
          V.etqs.push({ el, obj: p.obj, local: p.v });
        });
      }
      V.pedir();
    },
    moverEtiquetas(V) {
      if (!V.etqs || !V.etqs.length) return;
      const T = V.T, v = new T.Vector3(), b = new T.Box3();
      V.etqs.forEach(e => {
        if (e.local) { v.copy(e.local); e.obj.localToWorld(v); }
        else { b.setFromObject(e.obj); b.getCenter(v); v.y = b.max.y + 1; }
        v.project(V.camara);
        const fuera = v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1;
        e.el.style.display = fuera ? 'none' : '';
        if (!fuera) e.el.style.transform = `translate(${((v.x + 1) / 2 * V.ancho).toFixed(1)}px, ${((1 - v.y) / 2 * V.alto).toFixed(1)}px) translate(-50%, -100%)`;
      });
    },

    /* ----- Liberar toda la memoria gráfica ----- */
    desmontar() {
      const V = this.actual; if (!V) return;
      V.activo = false; this.actual = null;
      if (V.raf) cancelAnimationFrame(V.raf);
      V.quitar.forEach(f => { try { f(); } catch (e) { /* nada */ } });
      if (V.ro) V.ro.disconnect();
      if (V.ctl) V.ctl.dispose();
      if (V.escena) {
        const texturas = new Set(), materiales = new Set();
        V.escena.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
          ms.forEach(m => { materiales.add(m); ['map', 'emissiveMap'].forEach(k => m[k] && texturas.add(m[k])); });
        });
        texturas.forEach(t => t.dispose()); materiales.forEach(m => m.dispose());
        if (V.sol && V.sol.shadow && V.sol.shadow.map) V.sol.shadow.map.dispose();
      }
      if (V.entorno) V.entorno.dispose();
      if (V.pmrem) V.pmrem.dispose();
      if (V.r) { V.r.dispose(); V.r.forceContextLoss(); }
      if (V.contenedor) V.contenedor.innerHTML = '';
    },

    /* La protoboard 3D usa su propio Three.js (r128). Con esto puede pedir la misma fábrica
       de piezas y los mismos modelos de la Biblioteca, construidos con SU versión de Three. */
    fabricaExterna(T, calidad, opciones = {}) {
      const V = {
        T, lib: { T, RoundedBoxGeometry: opciones.RoundedBoxGeometry || null },
        q: CALIDAD[calidad] || CALIDAD.media, aniso: opciones.aniso || 4,
        infoPin: opciones.infoPin || (e => ({ nombre: e && typeof e === 'object' ? e.n : e }))
      };
      V.F = crearFabrica(V);
      return V;
    },

    // Para las pruebas: cuántos cuadros se dibujaron y cuánto tardó cada uno
    estadisticas() { const V = this.actual; if (!V || !V.r) return null; const i = V.r.info; return { cuadros: V.estad.cuadros, msPorCuadro: V.estad.cuadros ? +(V.estad.ms / V.estad.cuadros).toFixed(2) : 0, geometrias: i.memory.geometries, texturas: i.memory.textures, llamadas: i.render.calls, triangulos: i.render.triangles, calidad: this.calidad }; }
  };

  window.Visor3D = Visor3D;
})();
