/* =====================================================================
   ELECTROVERSE v13 · Componentes realistas de la protoboard 3D
   ---------------------------------------------------------------------
   Modelos detallados (diseño propio, sin marcas) para las piezas básicas:
   batería 9 V, portapilas 3×AA, fuente de laboratorio, motor DC,
   display de 7 segmentos, DIP switch, pulsador, interruptor deslizante
   y zumbador. Usan el Three.js de la protoboard (r128).

   Unidades: 1 unidad = 1 hueco de la protoboard = 2,54 mm.
   Cada función recibe (pb, g, p, c):
     pb = la protoboard 3D (para materiales, patas y cables)
     g  = el grupo donde se agrega el modelo
     p  = la pieza (tipo, valores y huecos)
     c  = { A, B, P, burned, center } posiciones ya calculadas
   ===================================================================== */
(function () {
  'use strict';
  const T = () => window.THREE;

  /* ---------- Ayudantes ---------- */
  // Textura dibujada en canvas con muchos píxeles por unidad (nítida al acercar)
  function tex(w, h, dibujar, ppu = 110) {
    const THREE = T(), cv = document.createElement('canvas');
    cv.width = Math.max(16, Math.min(2048, Math.round(w * ppu))); cv.height = Math.max(16, Math.min(2048, Math.round(h * ppu)));
    const k = cv.getContext('2d'); k.scale(cv.width / w, cv.height / h); dibujar(k, w, h);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  }
  // Material propio (se libera junto con la pieza)
  function propio(params) { const m = new (T().MeshStandardMaterial)(params); m.userData.own = true; return m; }
  function malla(geo, mat, propioMat) { const m = new (T().Mesh)(geo, mat); if (propioMat) m.userData.disposeMat = true; return m; }
  function texto(k, s, x, y, alto, color, op = {}) {
    k.save(); k.fillStyle = color; k.font = `${op.peso || 700} ${alto}px ${op.fuente || 'Arial, sans-serif'}`;
    k.textAlign = op.alinear || 'center'; k.textBaseline = 'middle';
    if (op.rot) { k.translate(x, y); k.rotate(op.rot); k.fillText(s, 0, 0); } else k.fillText(s, x, y);
    k.restore();
  }
  // Caja con esquinas redondeadas: crece desde y = 0 hasta y = h
  function cajaRedonda(w, h, d, r) {
    const THREE = T(), b = Math.min(r * 0.45, h / 4), s = new THREE.Shape(), x = w / 2 - b, z = d / 2 - b, rr = Math.max(0.01, Math.min(r, x, z) - b * 0.2);
    s.moveTo(-x + rr, -z); s.lineTo(x - rr, -z); s.quadraticCurveTo(x, -z, x, -z + rr); s.lineTo(x, z - rr); s.quadraticCurveTo(x, z, x - rr, z);
    s.lineTo(-x + rr, z); s.quadraticCurveTo(-x, z, -x, z - rr); s.lineTo(-x, -z + rr); s.quadraticCurveTo(-x, -z, -x + rr, -z);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.01, h - 2 * b), bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2, curveSegments: 6 });
    g.rotateX(-Math.PI / 2); g.translate(0, b, 0);
    return g;
  }
  function plano(w, h, mat) { return malla(new (T().PlaneGeometry)(w, h), mat, true); }
  // Cable de alimentación (con el recorrido que usa la animación de la corriente)
  function cable(pb, g, desde, hasta, color) {
    const THREE = T(), mid = desde.clone().lerp(hasta, 0.5).setY(Math.max(desde.y, 2) + 1.2);
    const pts = [desde, desde.clone().setY(desde.y + 0.8), mid, hasta.clone().setY(1.2), hasta.clone().setY(0)];
    g.add(pb.tube(pts, 0.14, pb.mat('lead' + color, { color, roughness: 0.4 })));
    const cv = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    (g.userData.leads = g.userData.leads || []).push({ curve: cv, len: cv.getLength() });
  }
  const metal = pb => pb.mat('r_metal', { color: 0xc9ced6, metalness: 0.9, roughness: 0.28 });
  const negro = pb => pb.mat('r_negro', { color: 0x16171a, roughness: 0.55 });

  const R = {};

  /* ===================== BATERÍA 9 V ===================== */
  R.BAT9 = (pb, g, p, c) => {
    const THREE = T(), o = pb.offPos(p), W = 4.2, H = 7.2, D = 2.8;
    const cuerpo = malla(cajaRedonda(W, H, D, 0.35), pb.mat('r_bat9', { color: 0x15161a, roughness: 0.35, metalness: 0.35 }));
    cuerpo.position.copy(o); g.add(cuerpo);
    const etq = propio({ map: tex(W * 0.98, H * 0.84, (k, w, h) => {
      const gr = k.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#b97a1f'); gr.addColorStop(0.5, '#f4cf74'); gr.addColorStop(1, '#b97a1f');
      k.fillStyle = '#121317'; k.fillRect(0, 0, w, h); k.fillStyle = gr; k.fillRect(0, 0, w, h * 0.34);
      k.fillStyle = '#121317'; k.fillRect(0, h * 0.30, w, h * 0.012);
      texto(k, '9V', w / 2, h * 0.6, h * 0.24, '#ffffff', { peso: 900 });
      texto(k, 'ALCALINA', w / 2, h * 0.78, h * 0.055, '#f4cf74', { peso: 800 });
      texto(k, 'ELECTROVERSE', w / 2, h * 0.17, h * 0.07, '#1a1408', { peso: 900 });
      texto(k, '6LR61 · 1,5 V × 6', w / 2, h * 0.9, h * 0.04, '#9aa0aa', { peso: 600 });
    }), roughness: 0.45, metalness: 0.1 });
    [1, -1].forEach(s => { const pl = plano(W * 0.98, H * 0.84, etq); pl.position.copy(o).add(new THREE.Vector3(0, H * 0.47, s * (D / 2 + 0.006))); if (s < 0) pl.rotation.y = Math.PI; pl.userData.disposeMat = s > 0; g.add(pl); });
    const tapa = malla(new THREE.BoxGeometry(W - 0.35, 0.12, D - 0.35), metal(pb)); tapa.position.copy(o).setY(H + 0.06); g.add(tapa);
    // Bornes: + redondo pequeño, − hexagonal grande (como en una batería real)
    const mas = malla(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 24), metal(pb)); mas.position.copy(o).add(new THREE.Vector3(0.95, H + 0.37, 0)); g.add(mas);
    const menos = malla(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 6), metal(pb)); menos.position.copy(o).add(new THREE.Vector3(-0.95, H + 0.35, 0)); g.add(menos);
    // Broche con cables
    const broche = malla(cajaRedonda(3.9, 0.8, 2.5, 0.3), pb.mat('r_broche', { color: 0x0f1012, roughness: 0.3 })); broche.position.copy(o).setY(H + 0.62); g.add(broche);
    const marca = plano(3.4, 2.0, propio({ map: tex(3.4, 2.0, (k, w, h) => { texto(k, '+', w * 0.78, h / 2, h * 0.55, '#e53935', { peso: 900 }); texto(k, '−', w * 0.22, h / 2, h * 0.55, '#e8ecf5', { peso: 900 }); }), transparent: true, roughness: 0.5 }));
    marca.rotation.x = -Math.PI / 2; marca.position.copy(o).setY(H + 1.43); g.add(marca);
    const tp = o.clone().add(new THREE.Vector3(0.95, H + 1.45, -0.6)), tm = o.clone().add(new THREE.Vector3(-0.95, H + 1.45, -0.6));
    cable(pb, g, tp, c.A, '#e53935'); cable(pb, g, tm, c.B, '#1d1d1f');
    g.userData.mid = o;
  };

  /* ===================== PORTAPILAS 3×AA ===================== */
  R.BAT45 = (pb, g, p, c) => {
    const THREE = T(), o = pb.offPos(p), W = 6.8, D = 7.4;
    const plas = negro(pb);
    const base = malla(cajaRedonda(W, 0.32, D, 0.25), plas); base.position.copy(o); g.add(base);
    [[W / 2 - 0.15, 0, 0.3, 1.5, D], [-W / 2 + 0.15, 0, 0.3, 1.5, D], [0, D / 2 - 0.15, W, 1.5, 0.3], [0, -D / 2 + 0.15, W, 1.5, 0.3]].forEach(([x, z, w, h, d]) => { const m = malla(new THREE.BoxGeometry(w, h, d), plas); m.position.copy(o).add(new THREE.Vector3(x, h / 2, z)); g.add(m); });
    [-1.1, 1.1].forEach(x => { const r = malla(new THREE.BoxGeometry(0.12, 0.8, D - 0.8), plas); r.position.copy(o).add(new THREE.Vector3(x, 0.72, 0)); g.add(r); });
    // Etiqueta de la pila (envuelve el cilindro)
    const etq = propio({ map: tex(6.0, 6.2, (k, w, h) => {
      const gr = k.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9dde3'); gr.addColorStop(0.12, '#1d8f4e'); gr.addColorStop(0.88, '#13703c'); gr.addColorStop(1, '#d9dde3');
      k.fillStyle = gr; k.fillRect(0, 0, w, h);
      k.fillStyle = '#0d0e10'; k.fillRect(0, h * 0.62, w, h * 0.12);
      [0.25, 0.75].forEach(f => { texto(k, 'AA', w * f, h * 0.36, h * 0.13, '#ffffff', { peso: 900, rot: -Math.PI / 2 }); texto(k, '1,5 V', w * f, h * 0.68, h * 0.06, '#f4cf74', { peso: 800, rot: -Math.PI / 2 }); });
      texto(k, '+', w * 0.5, h * 0.06, h * 0.07, '#13703c', { peso: 900 });
    }), roughness: 0.35, metalness: 0.2 });
    [-2.2, 0, 2.2].forEach((x, i) => {
      const pila = new THREE.Group(); pila.position.copy(o).add(new THREE.Vector3(x, 0.32 + 0.95, 0));
      const cil = malla(new THREE.CylinderGeometry(0.95, 0.95, 6.2, 36, 1, true), etq, i === 0); pila.add(cil);   // la etiqueta se libera una sola vez
      const tapaN = malla(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 30), metal(pb)); tapaN.position.y = -3.12; pila.add(tapaN);
      const tapaP = malla(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 30), metal(pb)); tapaP.position.y = 3.12; pila.add(tapaP);
      const nub = malla(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 20), metal(pb)); nub.position.y = 3.24; pila.add(nub);
      pila.rotation.x = i % 2 ? -Math.PI / 2 : Math.PI / 2;   // en serie: cada pila al revés de la anterior
      g.add(pila);
      // Resorte en el polo negativo
      const zN = (i % 2 ? 1 : -1) * 3.45, pts = [];
      for (let t = 0; t <= 1; t += 0.02) pts.push(new THREE.Vector3(Math.cos(t * Math.PI * 10) * 0.42, Math.sin(t * Math.PI * 10) * 0.42, t * 0.5 * Math.sign(zN)));
      const res = malla(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.05, 6, false), metal(pb));
      res.position.copy(o).add(new THREE.Vector3(x, 1.27, zN - 0.25 * Math.sign(zN))); g.add(res);
    });
    const tp = o.clone().add(new THREE.Vector3(W / 2 - 0.7, 1.3, -D / 2 - 0.2)), tm = o.clone().add(new THREE.Vector3(W / 2 - 1.6, 1.3, -D / 2 - 0.2));
    cable(pb, g, tp, c.A, '#e53935'); cable(pb, g, tm, c.B, '#1d1d1f');
    g.userData.mid = o;
  };

  /* ===================== FUENTE DE LABORATORIO ===================== */
  R.SUP = (pb, g, p, c) => {
    const THREE = T(), o = pb.offPos(p), W = 7.2, H = 4.4, D = 5.4, v = (+p.v || 0).toFixed(2);
    const caja = malla(cajaRedonda(W, H, D, 0.35), pb.mat('r_psu', { color: 0x4c5363, roughness: 0.45, metalness: 0.35 })); caja.position.copy(o); g.add(caja);
    const panel = plano(W - 0.4, H - 0.4, propio({ map: tex(W - 0.4, H - 0.4, (k, w, h) => {
      k.fillStyle = '#1b1f27'; k.fillRect(0, 0, w, h);
      k.fillStyle = '#071a0c'; k.fillRect(0.25, 0.35, w * 0.55, h * 0.42);
      texto(k, v, 0.25 + w * 0.5, 0.35 + h * 0.2, h * 0.3, '#5cff8a', { fuente: 'Courier New, monospace', peso: 800, alinear: 'right' });
      texto(k, 'V', 0.25 + w * 0.53, 0.35 + h * 0.31, h * 0.09, '#5cff8a', { peso: 800, alinear: 'right' });
      texto(k, 'VOLTAJE', w * 0.68, h * 0.08, h * 0.06, '#c9d1de'); texto(k, 'LÍMITE', w * 0.88, h * 0.08, h * 0.06, '#c9d1de');
      texto(k, 'FUENTE DC 0–15 V', 0.25 + w * 0.275, h * 0.88, h * 0.06, '#8f9bb3', { peso: 700 });
      texto(k, '+', w * 0.68, h * 0.6, h * 0.09, '#e53935', { peso: 900 }); texto(k, '−', w * 0.88, h * 0.6, h * 0.09, '#e8ecf5', { peso: 900 });
      texto(k, 'ELECTROVERSE LAB', w * 0.78, h * 0.93, h * 0.05, '#5d6880', { peso: 800 });
    }), roughness: 0.5 }));
    panel.position.copy(o).add(new THREE.Vector3(0, H / 2, D / 2 + 0.01)); g.add(panel);
    // Perillas
    [[W * 0.18, H * 0.68], [W * 0.38, H * 0.68]].forEach(([x, y]) => {
      const pr = new THREE.Group(); pr.position.copy(o).add(new THREE.Vector3(x - 0.2, y, D / 2 + 0.05));
      const k1 = malla(new THREE.CylinderGeometry(0.5, 0.56, 0.5, 28), negro(pb)); k1.rotation.x = Math.PI / 2; k1.position.z = 0.25; pr.add(k1);
      const ind = malla(new THREE.BoxGeometry(0.07, 0.36, 0.02), pb.mat('r_blanco', { color: 0xf1f1f1 })); ind.position.set(0, 0.2, 0.51); pr.add(ind);
      g.add(pr);
    });
    // Bornes rojo y negro
    const borne = (x, col) => {
      const b = new THREE.Group(); b.position.copy(o).add(new THREE.Vector3(x, H * 0.26, D / 2 + 0.05));
      const tuerca = malla(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 6), metal(pb)); tuerca.rotation.x = Math.PI / 2; tuerca.position.z = 0.09; b.add(tuerca);
      const cap = malla(new THREE.CylinderGeometry(0.32, 0.36, 0.55, 20), pb.mat('r_borne' + col, { color: col, roughness: 0.35 })); cap.rotation.x = Math.PI / 2; cap.position.z = 0.45; b.add(cap);
      g.add(b); return o.clone().add(new THREE.Vector3(x, H * 0.26, D / 2 + 0.8));
    };
    const tp = borne(W * 0.18, 0xd32f2f), tm = borne(W * 0.38, 0x1d1d1f);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const f = malla(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), negro(pb)); f.position.copy(o).add(new THREE.Vector3(sx * (W / 2 - 0.6), 0.02, sz * (D / 2 - 0.6))); g.add(f); });
    cable(pb, g, tp, c.A, '#e53935'); cable(pb, g, tm, c.B, '#1d1d1f');
    g.userData.mid = o;
  };

  /* ===================== MOTOR DC ===================== */
  R.MOTOR = (pb, g, p, c) => {
    const THREE = T(), o = pb.offPos(p), y = 1.6;
    const lata = malla(new THREE.CylinderGeometry(1.55, 1.55, 3.6, 40), pb.mat('r_lata', { color: 0xc7ccd4, metalness: 0.85, roughness: 0.3 }));
    lata.rotation.z = Math.PI / 2; lata.scale.set(1, 1, 0.82); lata.position.copy(o).setY(y); g.add(lata);
    const tapa = malla(new THREE.CylinderGeometry(1.45, 1.45, 0.6, 40), pb.mat('r_tapamotor', { color: 0xf0f0ec, roughness: 0.5 }));
    tapa.rotation.z = Math.PI / 2; tapa.scale.set(1, 1, 0.82); tapa.position.copy(o).add(new THREE.Vector3(2.1, y, 0)); g.add(tapa);
    [-0.55, 0.55].forEach(z => { const t = malla(new THREE.BoxGeometry(0.06, 0.9, 0.42), pb.mat('r_cobre', { color: 0xd8a85a, metalness: 0.9, roughness: 0.3 })); t.position.copy(o).add(new THREE.Vector3(2.43, y + 0.95, z)); g.add(t); });
    const buje = malla(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24), metal(pb)); buje.rotation.z = Math.PI / 2; buje.position.copy(o).add(new THREE.Vector3(-1.95, y, 0)); g.add(buje);
    const eje = malla(new THREE.CylinderGeometry(0.11, 0.11, 1.5, 12), metal(pb)); eje.rotation.z = Math.PI / 2; eje.position.copy(o).add(new THREE.Vector3(-2.6, y, 0)); g.add(eje);
    // Hélice que gira con el voltaje
    const helice = new THREE.Group(); helice.position.copy(o).add(new THREE.Vector3(-3.1, y, 0));
    const cubo = malla(new THREE.CylinderGeometry(0.32, 0.32, 0.4, 20), pb.mat('r_helice', { color: 0xf57c1f, roughness: 0.4 })); cubo.rotation.z = Math.PI / 2; helice.add(cubo);
    [0, Math.PI].forEach(a => { const aspa = malla(new THREE.BoxGeometry(0.12, 2.2, 0.7), pb.mat('r_helice', { color: 0xf57c1f, roughness: 0.4 })); aspa.geometry.translate(0, 1.2, 0); aspa.rotation.set(a, 0.35, 0); helice.add(aspa); });
    g.add(helice); g.userData.spinner = helice; g.userData.tick = dt => { helice.rotation.x += dt * (g.userData.spin || 0); };
    const tp = o.clone().add(new THREE.Vector3(2.43, y + 1.4, 0.55)), tm = o.clone().add(new THREE.Vector3(2.43, y + 1.4, -0.55));
    cable(pb, g, tp, c.A, '#e53935'); cable(pb, g, tm, c.B, '#1d1d1f');
    g.userData.mid = o;
  };

  window.PB_REAL = R;
  window.PB_REAL_AYUDA = { tex, propio, malla, texto, cajaRedonda, plano, cable, metal, negro };
})();
